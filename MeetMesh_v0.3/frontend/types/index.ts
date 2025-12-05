// TypeScript interfaces for MeetMesh

export interface EventRecord {
  eventId: string;
  eventName: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  userId: string;
  username?: string;
}

export interface AvailabilityInterval {
  date: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityBlock {
  time: string;
  availableUsers: string[];
}

export interface AvailabilityByDate {
  date: string;
  blocks: AvailabilityBlock[];
}

export interface ParticipantAvailability {
  userId: string;
  username?: string;
  availableBlocks: number;
  availabilityPct: number;
}

export interface AvailabilitySummary {
  bestBlocks: { date: string; time: string; count: number }[];
  everyoneBlocks: { date: string; time: string }[];
  mostAvailableDay: { date: string; total: number } | null;
  participantAvailability: ParticipantAvailability[];
  totalBlocks: number;
  totalParticipants: number;
}

export interface LocalizedAvailability {
  timezone: string;
  availabilityByDate: AvailabilityByDate[];
  availabilityMatrix: Record<string, Record<string, number>>;
}

export interface AvailabilityView {
  availabilityByDate: AvailabilityByDate[];
  availabilityMatrix: Record<string, Record<string, number>>;
  summary: AvailabilitySummary;
  localizedAvailability?: LocalizedAvailability;
}

export interface EventResponse {
  event: EventRecord;
  participants: UserRecord[];
  availability: AvailabilityView;
  myAvailability?: AvailabilityInterval[];
  blockSizeMinutes: number;
  eventTimezone: string;
}

export interface CreateEventInput {
  eventName: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface TimeBlock {
  date: string;
  time: string;
  availableCount: number;
  totalParticipants: number;
  availableUsers: string[];
  isUserAvailable: boolean;
}
