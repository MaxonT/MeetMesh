'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import type { AvailabilityInterval, AvailabilityView } from '@/types';
import { generateTimeBlocks, generateDateRange, formatDate, formatTime24Hour, getUniquePrefixes, getAvailabilityColor, cn } from '@/lib/utils';
import { Tooltip } from './ui/Tooltip';
import { Button } from './ui/Button';
import { BLOCK_MINUTES } from '@/lib/constants';

interface TimeGridProps {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  availability: AvailabilityView | null;
  myAvailability: AvailabilityInterval[];
  onAvailabilityChange: (intervals: AvailabilityInterval[]) => void;
  participants: { userId: string; username?: string | null }[];
  currentUserId?: string | null;
  isSaving?: boolean;
}

export function TimeGrid({
  startDate,
  endDate,
  startTime,
  endTime,
  availability,
  myAvailability,
  onAvailabilityChange,
  participants,
  isSaving = false,
}: TimeGridProps) {
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  
  // Create a map of userId to username for quick lookup
  const userIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    participants.forEach(p => {
      if (p.userId && p.username) {
        map[p.userId] = p.username;
      }
    });
    return map;
  }, [participants]);
  
  // Refs for drag handling
  const dragSurfaceRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    mode: 'select' | 'deselect' | null;
    startBlock: string | null;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    mode: null,
    startBlock: null,
  });

  const dates = useMemo(() => generateDateRange(startDate, endDate), [startDate, endDate]);
  const timeBlocks = useMemo(() => generateTimeBlocks(startTime, endTime), [startTime, endTime]);
  
  // Compute unique prefixes for all participants
  const userPrefixes = useMemo(() => {
    const names = participants
      .map(p => p.username)
      .filter((n): n is string => !!n && n !== 'Anonymous');
    return getUniquePrefixes(names);
  }, [participants]);

  const initialBlocks = useMemo(() => {
    const blocks = new Set<string>();
    myAvailability.forEach((interval) => {
      const intervalTimes = generateTimeBlocks(interval.startTime, interval.endTime);
      intervalTimes.forEach((time) => {
        blocks.add(`${interval.date}_${time}`);
      });
    });
    return blocks;
  }, [myAvailability]);

  // Sync state when props change
  React.useEffect(() => {
    setSelectedBlocks(initialBlocks);
  }, [initialBlocks]);

  const isDirty = useMemo(() => {
    if (selectedBlocks.size !== initialBlocks.size) return true;
    for (const block of selectedBlocks) {
      if (!initialBlocks.has(block)) return true;
    }
    return false;
  }, [selectedBlocks, initialBlocks]);
  
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
  
  const toggleBlock = (date: string, time: string, mode: 'select' | 'deselect') => {
    setSelectedBlocks((prev) => {
      const newSet = new Set(prev);
      const key = getBlockKey(date, time);
      
      if (mode === 'select') {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }
      
      return newSet;
    });
  };

  // Pointer Events Logic
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only handle left click
    if (e.button !== 0) return;
    
    // Prevent default to avoid text selection etc.
    e.preventDefault();
    
    const target = e.target as HTMLElement;
    // Find the closest cell
    const cell = target.closest('[data-date]');
    if (!cell) return;
    
    const date = cell.getAttribute('data-date');
    const time = cell.getAttribute('data-time');
    
    if (!date || !time) return;
    
    // Initialize drag state
    const isSelected = isBlockSelected(date, time);
    dragState.current = {
      isDragging: false,
      startX: e.clientX,
      startY: e.clientY,
      mode: isSelected ? 'deselect' : 'select',
      startBlock: getBlockKey(date, time),
    };
    
    // Set pointer capture on the DragSurface (container)
    if (dragSurfaceRef.current) {
      dragSurfaceRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragSurfaceRef.current?.hasPointerCapture(e.pointerId)) return;
    
    // Check threshold for drag
    if (!dragState.current.isDragging) {
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 5) { // 5px threshold
        dragState.current.isDragging = true;
        // Apply the initial toggle when drag starts
        if (dragState.current.startBlock && dragState.current.mode) {
           const [d, t] = dragState.current.startBlock.split('_');
           toggleBlock(d, t, dragState.current.mode);
        }
      }
    }
    
    if (dragState.current.isDragging && dragState.current.mode) {
      // Find element under pointer
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const cell = element?.closest('[data-date]');
      
      if (cell) {
        const date = cell.getAttribute('data-date');
        const time = cell.getAttribute('data-time');
        
        if (date && time) {
          // Check if we need to toggle this block
          const isSelected = isBlockSelected(date, time);
          if ((dragState.current.mode === 'select' && !isSelected) || 
              (dragState.current.mode === 'deselect' && isSelected)) {
            toggleBlock(date, time, dragState.current.mode);
          }
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragSurfaceRef.current?.hasPointerCapture(e.pointerId)) {
      dragSurfaceRef.current.releasePointerCapture(e.pointerId);
    }
    
    // If it was just a click (no drag), toggle the start block
    if (!dragState.current.isDragging && dragState.current.startBlock && dragState.current.mode) {
      const [date, time] = dragState.current.startBlock.split('_');
      toggleBlock(date, time, dragState.current.mode);
    }
    
    // Reset state
    dragState.current = {
      isDragging: false,
      startX: 0,
      startY: 0,
      mode: null,
      startBlock: null,
    };
  };
  
  const handleSave = async () => {
    try {
      await saveAvailability();
    } catch (error) {
      console.error('Failed to save availability:', error);
    }
  };

  const handleReset = () => {
    setSelectedBlocks(initialBlocks);
  };

  const saveAvailability = useCallback(() => {
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
          const finalEndTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;
          
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
      const finalEndTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;
      
      intervals.push({
        date,
        startTime: currentStart,
        endTime: finalEndTime,
      });
    });
    
    onAvailabilityChange(intervals);
  }, [selectedBlocks, onAvailabilityChange]);
  
  return (
    <div className="space-y-4">
      {/* DragSurface: Physical isolation for drag interactions */}
      <div 
        ref={dragSurfaceRef}
        className="overflow-x-auto select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
      <div className="inline-block min-w-full">
        <div className="grid" style={{ gridTemplateColumns: `80px repeat(${dates.length}, minmax(80px, 1fr))` }}>
          {/* Header row */}
          <div className="sticky left-0 bg-background z-10 border-b border-r border-border p-2 pointer-events-none">
            <span className="text-xs font-semibold text-muted-foreground">Time</span>
          </div>
          {dates.map((date) => (
            <div
              key={date}
              className="border-b border-r border-border p-2 text-center bg-muted/30 pointer-events-none"
            >
              <div className="text-xs font-semibold text-foreground">
                {formatDate(date)}
              </div>
            </div>
          ))}
          
          {/* Time rows */}
          {timeBlocks.map((time) => (
            <React.Fragment key={time}>
              <div className="sticky left-0 bg-background z-10 border-r border-b border-border p-2 pointer-events-none">
                <span className="text-xs text-muted-foreground">{formatTime24Hour(time)}</span>
              </div>
              {dates.map((date) => {
                const { count, availableUsers } = getAvailabilityForBlock(date, time);
                const isSelected = isBlockSelected(date, time);
                
                // Calculate background color using blue scale
                const bgColor = getAvailabilityColor(count, participants.length, isSelected);
                
                // Dynamic text color: white for dark backgrounds, dark blue/foreground for light backgrounds
                // Threshold matches utils.ts: > 0.5 ratio gets blue-500/700 (Dark)
                const isDarkBg = participants.length > 0 && (count / participants.length) > 0.5;
                const textColor = isDarkBg ? 'text-white' : 'text-blue-900 dark:text-blue-100';
                
                // Resolve user IDs to names, filter out Anonymous, and sort
                const displayNames = availableUsers
                  .map(id => userIdToName[id] || id) // Map ID to name if possible
                  .filter(name => name && name !== 'Anonymous')
                  .sort((a, b) => a.localeCompare(b));

                const initials = displayNames.map(name => userPrefixes[name] || name.charAt(0).toUpperCase());
                
                return (
                  <Tooltip
                    key={getBlockKey(date, time)}
                    content={
                      <div className="text-xs">
                        <div className="font-semibold mb-1">Available ({count}):</div>
                        <div className="flex flex-wrap gap-1">
                          {displayNames.map(name => (
                            <span key={name} className="bg-primary/20 px-1 rounded">{name}</span>
                          ))}
                          {count === 0 && <span className="text-muted-foreground italic">No one yet</span>}
                        </div>
                      </div>
                    }
                  >
                    <div
                      data-date={date}
                      data-time={time}
                      className={cn(
                        "border-r border-b border-border h-8 cursor-pointer transition-colors relative flex items-center justify-center overflow-hidden select-none",
                        bgColor,
                        isSelected && "ring-2 ring-inset ring-primary z-10",
                        // Hover effect
                        !isSelected && !count && "hover:bg-muted"
                      )}
                    >
                      {/* Render Initials */}
                      {initials.length > 0 && (
                        <div className="flex items-center justify-center gap-0.5 w-full px-0.5">
                          {initials.slice(0, 2).map((initial, i) => (
                            <span key={i} className={cn("text-[10px] font-bold leading-none", textColor)}>
                              {initial}
                            </span>
                          ))}
                          {initials.length > 2 && (
                            <span className={cn("text-[10px] font-bold leading-none opacity-80", textColor)}>
                              +{initials.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
    
    {/* ActionsBar: Physically separated from drag surface */}
    <div className={`flex items-center justify-end gap-3 transition-opacity duration-200 ${isDirty ? 'opacity-100' : 'opacity-50'}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        disabled={!isDirty || isSaving}
      >
        Discard Changes
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleSave}
        disabled={!isDirty || isSaving}
        className="min-w-[120px]"
      >
        {isSaving ? 'Saving...' : 'Save Availability'}
      </Button>
    </div>
  </div>
  );
}