'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import type { AvailabilityInterval, AvailabilityView } from '@/types';
import { generateTimeBlocks, generateDateRange, formatDate, formatTime12Hour, getAvailabilityColor } from '@/lib/utils';
import { Tooltip } from './ui/Tooltip';
import { Button } from './ui/Button';
import { useMeetMeshStore } from '@/lib/store';
import { BLOCK_MINUTES } from '@/lib/constants';

const LONG_PRESS_DURATION = 400; // milliseconds to activate drag-select

interface TimeGridProps {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  availability: AvailabilityView | null;
  myAvailability: AvailabilityInterval[];
  onAvailabilityChange: (intervals: AvailabilityInterval[]) => void;
  totalParticipants: number;
  currentUserId?: string | null;
}

export function TimeGrid({
  startDate,
  endDate,
  startTime,
  endTime,
  availability,
  myAvailability,
  onAvailabilityChange,
  totalParticipants,
}: TimeGridProps) {
  const { setDragState, resetDragState } = useMeetMeshStore();
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activePointerRef = useRef<number | null>(null);
  const dragModeRef = useRef<'select' | 'deselect' | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

  const dates = useMemo(() => generateDateRange(startDate, endDate), [startDate, endDate]);
  const timeBlocks = useMemo(() => generateTimeBlocks(startTime, endTime), [startTime, endTime]);

  // Initialize selected blocks from myAvailability
  React.useEffect(() => {
    const blocks = new Set<string>();
    myAvailability.forEach((interval) => {
      const intervalTimes = generateTimeBlocks(interval.startTime, interval.endTime);
      intervalTimes.forEach((time) => {
        blocks.add(`${interval.date}_${time}`);
      });
    });
    setSelectedBlocks(blocks);
    setHasPendingChanges(false);
  }, [myAvailability]);

  const getBlockKey = (date: string, time: string) => `${date}_${time}`;

  const isBlockSelected = (date: string, time: string) => {
    return selectedBlocks.has(getBlockKey(date, time));
  };

  const getAvailabilityForBlock = (date: string, time: string) => {
    const availableUsers: string[] = [];
    let count = 0;

    if (availability?.availabilityMatrix[date]?.[time]) {
      count = availability.availabilityMatrix[date][time];

      // Get usernames from availability blocks
      const dateAvailability = availability.availabilityByDate.find((a) => a.date === date);
      const block = dateAvailability?.blocks.find((b) => b.time === time);
      if (block) {
        availableUsers.push(...block.availableUsers);
      }
    }

    return { count, availableUsers };
  };

  const clearLongPressTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const startDragSelection = (date: string, time: string) => {
    const isSelected = isBlockSelected(date, time);
    const mode: 'select' | 'deselect' = isSelected ? 'deselect' : 'select';

    dragModeRef.current = mode;
    setDragState({
      isDragging: true,
      dragStartBlock: { date, time },
      dragMode: mode,
    });

    setIsDragSelecting(true);
    toggleBlock(date, time, mode);
  };

  const handlePointerDown = (date: string, time: string) => (event: React.PointerEvent<HTMLDivElement>) => {
    activePointerRef.current = event.pointerId;
    startPointRef.current = { x: event.clientX, y: event.clientY };
    dragModeRef.current = isBlockSelected(date, time) ? 'deselect' : 'select';

    clearLongPressTimer();
    pressTimerRef.current = setTimeout(() => {
      startDragSelection(date, time);
    }, LONG_PRESS_DURATION);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!startPointRef.current || isDragSelecting) return;

    const dx = Math.abs(event.clientX - startPointRef.current.x);
    const dy = Math.abs(event.clientY - startPointRef.current.y);

    if (dx > 8 || dy > 8) {
      clearLongPressTimer();
    }
  };

  const handlePointerEnter = (date: string, time: string) => (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragSelecting || dragModeRef.current === null) return;
    if (event.pointerId !== activePointerRef.current) return;

    toggleBlock(date, time, dragModeRef.current);
  };

  const endDragSelection = () => {
    if (isDragSelecting) {
      setIsDragSelecting(false);
      dragModeRef.current = null;
      resetDragState();
    }
  };

  const handlePointerUp = (date: string, time: string) => (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) return;

    const wasDragSelecting = isDragSelecting;

    clearLongPressTimer();
    endDragSelection();

    if (!wasDragSelecting) {
      const mode: 'select' | 'deselect' = isBlockSelected(date, time) ? 'deselect' : 'select';
      toggleBlock(date, time, mode);
    }

    activePointerRef.current = null;
    startPointRef.current = null;
  };

  const toggleBlock = (date: string, time: string, mode: 'select' | 'deselect') => {
    setSelectedBlocks((prev) => {
      const newSet = new Set(prev);
      const key = getBlockKey(date, time);

      if (mode === 'select') {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }

      setHasPendingChanges(newSet.size > 0);
      return newSet;
    });
  };

  const saveAvailability = useCallback(async () => {
    // Convert selected blocks to intervals
    const intervals: AvailabilityInterval[] = [];
    const blocksByDate: Record<string, Set<string>> = {};

    selectedBlocks.forEach((key) => {
      const [date, time] = key.split('_');
      if (!blocksByDate[date]) {
        blocksByDate[date] = new Set();
      }
      blocksByDate[date].add(time);
    });

    // Create intervals for each date
    Object.entries(blocksByDate).forEach(([date, times]) => {
      const sortedTimes = Array.from(times).sort();

      let currentStart = sortedTimes[0];
      let currentEnd = sortedTimes[0];

      for (let i = 1; i < sortedTimes.length; i++) {
        const prevTime = sortedTimes[i - 1];
        const currTime = sortedTimes[i];

        // Check if times are consecutive (15 minutes apart)
        const [prevHour, prevMin] = prevTime.split(':').map(Number);
        const [currHour, currMin] = currTime.split(':').map(Number);
        const prevMinutes = prevHour * 60 + prevMin;
        const currMinutes = currHour * 60 + currMin;

        if (currMinutes - prevMinutes === BLOCK_MINUTES) {
          currentEnd = currTime;
        } else {
          // Add interval and start a new one
          const [endHour, endMin] = currentEnd.split(':').map(Number);
          const endMinutes = endHour * 60 + endMin + BLOCK_MINUTES;
          const finalEndTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60)
            .toString()
            .padStart(2, '0')}`;

          intervals.push({
            date,
            startTime: currentStart,
            endTime: finalEndTime,
          });

          currentStart = currTime;
          currentEnd = currTime;
        }
      }

      // Add the last interval
      const [endHour, endMin] = currentEnd.split(':').map(Number);
      const endMinutes = endHour * 60 + endMin + BLOCK_MINUTES;
      const finalEndTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60)
        .toString()
        .padStart(2, '0')}`;

      intervals.push({
        date,
        startTime: currentStart,
        endTime: finalEndTime,
      });
    });

    setIsSaving(true);
    await onAvailabilityChange(intervals);
    setIsSaving(false);
    setHasPendingChanges(false);
  }, [selectedBlocks, onAvailabilityChange]);

  React.useEffect(() => {
    const handleGlobalPointerUp = () => {
      endDragSelection();
      clearLongPressTimer();
    };

    document.addEventListener('pointerup', handleGlobalPointerUp);
    document.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      document.removeEventListener('pointerup', handleGlobalPointerUp);
      document.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid" style={{ gridTemplateColumns: `80px repeat(${dates.length}, minmax(80px, 1fr))` }}>
          {/* Header row */}
          <div className="sticky left-0 bg-card z-10 border-b border-r border-border/70 p-3 backdrop-blur">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</span>
          </div>
          {dates.map((date) => (
            <div
              key={date}
              className="border-b border-r border-border/70 p-3 text-center bg-muted/40 dark:bg-slate-800/60"
            >
              <div className="text-xs font-semibold text-foreground">{formatDate(date)}</div>
            </div>
          ))}

          {/* Time rows */}
          {timeBlocks.map((time) => (
            <React.Fragment key={time}>
              <div className="sticky left-0 bg-card z-10 border-r border-b border-border/70 p-3 backdrop-blur">
                <span className="text-xs text-muted-foreground font-medium">{formatTime12Hour(time)}</span>
              </div>
              {dates.map((date) => {
                const { count, availableUsers } = getAvailabilityForBlock(date, time);
                const isSelected = isBlockSelected(date, time);
                const bgColor = getAvailabilityColor(count, totalParticipants, isSelected);

                return (
                  <Tooltip
                    key={getBlockKey(date, time)}
                    content={
                      availableUsers.length > 0
                        ? `${availableUsers.join(', ')} (${count} ${count === 1 ? 'person' : 'people'})`
                        : isSelected
                        ? 'You are available'
                        : 'No one available'
                    }
                  >
                    <div
                      className={`border-r border-b border-border/70 h-9 cursor-pointer transition-all select-none ${bgColor}${
                        isSelected ? ' ring-2 ring-inset ring-blue-500 shadow-inner' : ' hover:brightness-105'
                      }`}
                      onPointerDown={handlePointerDown(date, time)}
                      onPointerMove={handlePointerMove}
                      onPointerEnter={handlePointerEnter(date, time)}
                      onPointerUp={handlePointerUp(date, time)}
                      onPointerLeave={clearLongPressTimer}
                      aria-pressed={isSelected}
                    />
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {hasPendingChanges && (
        <div className="mt-4 flex items-center justify-end gap-3 rounded-lg bg-muted/60 px-4 py-3 dark:bg-slate-800/70 border border-border/70">
          <div className="text-sm text-muted-foreground">
            Selection ready. Tap Confirm to save without leaving the page.
          </div>
          <Button
            variant="success"
            size="sm"
            onClick={saveAvailability}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Confirm'}
          </Button>
        </div>
      )}
    </div>
  );
}
