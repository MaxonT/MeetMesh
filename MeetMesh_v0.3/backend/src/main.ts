import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';

const app = express();
app.use(cors());
app.use(express.json());

const BLOCK_MINUTES = 15;

interface EventRecord {
  eventId: string;
  eventName: string;
  description?: string;
  startDate: string; // ISO date yyyy-MM-dd
  endDate: string; // ISO date yyyy-MM-dd
  startTime: string; // HH:mm in event timezone
  endTime: string; // HH:mm in event timezone
  timezone: string; // IANA
  createdAt: string;
  updatedAt: string;
}

interface UserRecord {
  userId: string;
  username?: string;
}

interface AvailabilityInterval {
  date: string; // yyyy-MM-dd in event timezone
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

interface EventState {
  meta: EventRecord;
  users: Map<string, UserRecord>;
  availability: Map<string, AvailabilityInterval[]>; // userId -> intervals
}

const events = new Map<string, EventState>();

function parseEventDateTime(
  date: string,
  time: string,
  inputZone: string,
  eventZone: string,
): DateTime {
  const parsed = DateTime.fromISO(`${date}T${time}`, { zone: inputZone });
  if (!parsed.isValid) {
    throw new Error('Invalid date or time');
  }
  return parsed.setZone(eventZone, { keepLocalTime: false });
}

function formatTime(dt: DateTime): string {
  return dt.toFormat('HH:mm');
}

function validateEventRequest(body: any) {
  const required = ['eventName', 'startDate', 'endDate', 'startTime', 'endTime', 'timezone'];
  for (const field of required) {
    if (!body[field]) {
      throw new Error(`Missing field: ${field}`);
    }
  }
}

function getDateRange(startDate: string, endDate: string): string[] {
  const days: string[] = [];
  let current = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);
  if (!current.isValid || !end.isValid || current > end) {
    return days;
  }
  while (current <= end) {
    const isoDate = current.toISODate();
    if (isoDate) {
      days.push(isoDate);
    }
    current = current.plus({ days: 1 });
  }
  return days;
}

function generateDailyBlocks(event: EventRecord): Map<string, string[]> {
  const blocks = new Map<string, string[]>();
  for (const date of getDateRange(event.startDate, event.endDate)) {
    const dayBlocks: string[] = [];
    let cursor = DateTime.fromISO(`${date}T${event.startTime}`, { zone: event.timezone });
    const end = DateTime.fromISO(`${date}T${event.endTime}`, { zone: event.timezone });
    while (cursor < end) {
      dayBlocks.push(formatTime(cursor));
      cursor = cursor.plus({ minutes: BLOCK_MINUTES });
    }
    blocks.set(date, dayBlocks);
  }
  return blocks;
}

function mergeIntervals(intervals: AvailabilityInterval[]): AvailabilityInterval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const merged: AvailabilityInterval[] = [];

  for (const interval of sorted) {
    const last = merged[merged.length - 1];
    if (!last || interval.startTime > last.endTime) {
      merged.push({ ...interval });
    } else if (interval.endTime > last.endTime) {
      last.endTime = interval.endTime;
    }
  }
  return merged;
}

function upsertAvailability(state: EventState, userId: string, newInterval: AvailabilityInterval) {
  const existing = state.availability.get(userId) ?? [];
  const intervalsForDay = existing.filter((it) => it.date === newInterval.date);
  const others = existing.filter((it) => it.date !== newInterval.date);
  const merged = mergeIntervals([...intervalsForDay, newInterval]);
  state.availability.set(userId, [...others, ...merged]);
}

function blockCovered(
  interval: AvailabilityInterval,
  blockStart: DateTime,
  blockEnd: DateTime,
  eventZone: string,
): boolean {
  const start = DateTime.fromISO(`${interval.date}T${interval.startTime}`, { zone: eventZone });
  const end = DateTime.fromISO(`${interval.date}T${interval.endTime}`, { zone: eventZone });
  return start <= blockStart && end > blockStart && start < blockEnd;
}

function buildAvailabilityView(state: EventState) {
  const blocks = generateDailyBlocks(state.meta);
  const perDate = [] as {
    date: string;
    blocks: { time: string; availableUsers: string[] }[];
  }[];

  const availabilityMatrix: Record<string, Record<string, number>> = {};
  let highestCount = 0;
  const bestBlocks: { date: string; time: string; count: number }[] = [];
  const everyoneBlocks: { date: string; time: string }[] = [];

  for (const [date, times] of blocks.entries()) {
    const blockEntries: { time: string; availableUsers: string[] }[] = [];
    availabilityMatrix[date] = {};
    for (const time of times) {
      const start = DateTime.fromISO(`${date}T${time}`, { zone: state.meta.timezone });
      const end = start.plus({ minutes: BLOCK_MINUTES });
      const availableUsers: string[] = [];
      for (const [userId, intervals] of state.availability.entries()) {
        const hasAvailability = intervals.some((interval) =>
          blockCovered(interval, start, end, state.meta.timezone),
        );
        if (hasAvailability) {
          availableUsers.push(userId);
        }
      }
      blockEntries.push({ time, availableUsers });
      availabilityMatrix[date][time] = availableUsers.length;
      if (availableUsers.length > highestCount) {
        highestCount = availableUsers.length;
      }
      if (availableUsers.length === state.users.size && state.users.size > 0) {
        everyoneBlocks.push({ date, time });
      }
    }
    perDate.push({ date, blocks: blockEntries });
  }

  for (const [date, times] of Object.entries(availabilityMatrix)) {
    for (const [time, count] of Object.entries(times)) {
      if (count === highestCount && count > 0) {
        bestBlocks.push({ date, time, count });
      }
    }
  }

  const dayScores: { date: string; total: number }[] = Object.entries(availabilityMatrix).map(
    ([date, timeMap]) => ({
      date,
      total: Object.values(timeMap).reduce((sum, val) => sum + val, 0),
    }),
  );
  dayScores.sort((a, b) => b.total - a.total);

  return {
    availabilityByDate: perDate,
    availabilityMatrix,
    summary: {
      bestBlocks,
      everyoneBlocks,
      mostAvailableDay: dayScores[0] ?? null,
    },
  };
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/events', (req: Request, res: Response) => {
  try {
    validateEventRequest(req.body);
    const now = new Date().toISOString();
    const eventId = uuidv4();
    const record: EventState = {
      meta: {
        eventId,
        eventName: req.body.eventName,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        timezone: req.body.timezone,
        createdAt: now,
        updatedAt: now,
      },
      users: new Map(),
      availability: new Map(),
    };
    events.set(eventId, record);
    res.status(201).json(record.meta);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to create event' });
  }
});

app.get('/events/:eventId', (req: Request, res: Response) => {
  const state = events.get(req.params.eventId);
  if (!state) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const availability = buildAvailabilityView(state);
  const userId = req.query.userId as string | undefined;
  
  const response: any = {
    event: state.meta,
    participants: Array.from(state.users.values()),
    availability,
  };
  
  // Include user's availability if userId is provided
  if (userId && state.availability.has(userId)) {
    response.myAvailability = state.availability.get(userId) ?? [];
  }
  
  res.json(response);
});

app.patch('/events/:eventId', (req: Request, res: Response) => {
  const state = events.get(req.params.eventId);
  if (!state) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const allowedFields = ['eventName', 'description', 'startDate', 'endDate', 'startTime', 'endTime', 'timezone'];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      // @ts-expect-error dynamic update
      state.meta[field] = req.body[field];
    }
  }
  state.meta.updatedAt = new Date().toISOString();
  res.json(state.meta);
});

app.delete('/events/:eventId', (req: Request, res: Response) => {
  const exists = events.delete(req.params.eventId);
  if (!exists) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json({ message: 'Event deleted' });
});

app.post('/events/:eventId/users', (req: Request, res: Response) => {
  const state = events.get(req.params.eventId);
  if (!state) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const userId = uuidv4();
  const user: UserRecord = { userId, username: req.body.username };
  state.users.set(userId, user);
  res.status(201).json(user);
});

app.patch('/events/:eventId/users/:userId', (req: Request, res: Response) => {
  const state = events.get(req.params.eventId);
  if (!state) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const user = state.users.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  user.username = req.body.username ?? user.username;
  res.json(user);
});

app.post('/events/:eventId/availability', (req: Request, res: Response) => {
  const { userId, intervals, date, startTime, endTime, timezone } = req.body;
  const state = events.get(req.params.eventId);
  if (!state) {
    return res.status(404).json({ message: 'Event not found' });
  }
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }
  if (!state.users.has(userId)) {
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    // Support both batch intervals array and single interval
    if (intervals && Array.isArray(intervals)) {
      // Batch mode: replace all availability with new intervals
      const userTimezone = timezone ?? state.meta.timezone;
      const normalizedIntervals: AvailabilityInterval[] = [];
      
      for (const interval of intervals) {
        if (!interval.date || !interval.startTime || !interval.endTime) {
          continue; // Skip invalid intervals
        }
        const start = parseEventDateTime(
          interval.date,
          interval.startTime,
          userTimezone,
          state.meta.timezone
        );
        const end = parseEventDateTime(
          interval.date,
          interval.endTime,
          userTimezone,
          state.meta.timezone
        );
        if (end > start) {
          const isoDate = start.toISODate();
          if (isoDate) {
            normalizedIntervals.push({
              date: isoDate,
              startTime: formatTime(start),
              endTime: formatTime(end),
            });
          }
        }
      }
      
      // Merge intervals by date and replace all availability
      const intervalsByDate = new Map<string, AvailabilityInterval[]>();
      normalizedIntervals.forEach((interval) => {
        const existing = intervalsByDate.get(interval.date) ?? [];
        existing.push(interval);
        intervalsByDate.set(interval.date, existing);
      });
      
      const mergedIntervals: AvailabilityInterval[] = [];
      intervalsByDate.forEach((dayIntervals) => {
        mergedIntervals.push(...mergeIntervals(dayIntervals));
      });
      
      // Replace all availability for this user
      state.availability.set(userId, mergedIntervals);
    } else if (date && startTime && endTime) {
      // Single interval mode (backward compatibility)
      const start = parseEventDateTime(date, startTime, timezone ?? state.meta.timezone, state.meta.timezone);
      const end = parseEventDateTime(date, endTime, timezone ?? state.meta.timezone, state.meta.timezone);
      if (end <= start) {
        return res.status(400).json({ message: 'End time must be after start time' });
      }
      const isoDate = start.toISODate();
      if (!isoDate) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      const normalized: AvailabilityInterval = {
        date: isoDate,
        startTime: formatTime(start),
        endTime: formatTime(end),
      };
      upsertAvailability(state, userId, normalized);
    } else {
      return res.status(400).json({ message: 'Missing availability fields: provide either intervals array or date/startTime/endTime' });
    }

    res.status(201).json({ 
      message: 'Availability saved', 
      availability: state.availability.get(userId) ?? [] 
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to save availability' });
  }
});

app.delete('/events/:eventId/availability', (req: Request, res: Response) => {
  const state = events.get(req.params.eventId);
  const userId = req.body.userId as string;
  if (!state) {
    return res.status(404).json({ message: 'Event not found' });
  }
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }
  state.availability.delete(userId);
  res.json({ message: 'Availability cleared' });
});

app.get('/events/:eventId/availability', (req: Request, res: Response) => {
  const state = events.get(req.params.eventId);
  if (!state) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const view = buildAvailabilityView(state);
  res.json(view);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`MeetMesh backend listening on port ${PORT}`);
});
