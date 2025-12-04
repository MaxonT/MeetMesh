'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { AvailabilityInterval, AvailabilityView } from '@/types';
import { generateTimeBlocks, generateDateRange, formatDate, formatTime12Hour, getAvailabilityColor } from '@/lib/utils';
import { Tooltip } from './ui/Tooltip';
import { useMeetMeshStore } from '@/lib/store';
import { BLOCK_MINUTES } from '@/lib/constants';

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
  const { dragState, setDragState, resetDragState } = useMeetMeshStore();
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  
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
  
  const handleMouseDown = (date: string, time: string) => {
    const isSelected = isBlockSelected(date, time);
    const mode = isSelected ? 'deselect' : 'select';
    
    setDragState({
      isDragging: true,
      dragStartBlock: { date, time },
      dragMode: mode,
    });
    
    toggleBlock(date, time, mode);
  };
  
  const handleMouseEnter = (date: string, time: string) => {
    if (dragState.isDragging && dragState.dragMode) {
      toggleBlock(date, time, dragState.dragMode);
    }
  };
  
  const handleMouseUp = () => {
    if (dragState.isDragging) {
      resetDragState();
      saveAvailability();
    }
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
  
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragState.isDragging) {
        resetDragState();
        saveAvailability();
      }
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [dragState.isDragging, resetDragState, saveAvailability]);
  
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid" style={{ gridTemplateColumns: `80px repeat(${dates.length}, minmax(80px, 1fr))` }}>
          {/* Header row */}
          <div className="sticky left-0 bg-white z-10 border-b border-r border-gray-300 p-2">
            <span className="text-xs font-semibold text-gray-600">Time</span>
          </div>
          {dates.map((date) => (
            <div
              key={date}
              className="border-b border-r border-gray-300 p-2 text-center bg-gray-50"
            >
              <div className="text-xs font-semibold text-gray-700">
                {formatDate(date)}
              </div>
            </div>
          ))}
          
          {/* Time rows */}
          {timeBlocks.map((time) => (
            <React.Fragment key={time}>
              <div className="sticky left-0 bg-white z-10 border-r border-b border-gray-200 p-2">
                <span className="text-xs text-gray-600">{formatTime12Hour(time)}</span>
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
                      className={`border-r border-b border-gray-200 h-8 cursor-pointer transition-colors select-none ${bgColor} ${
                        isSelected ? 'ring-2 ring-inset ring-blue-600' : ''
                      }`}
                      onMouseDown={() => handleMouseDown(date, time)}
                      onMouseEnter={() => handleMouseEnter(date, time)}
                      onMouseUp={handleMouseUp}
                    />
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
