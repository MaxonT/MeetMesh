import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { AvailabilityInterval, AvailabilityView } from '@/types';
import { generateTimeBlocks, generateDateRange, formatDate, formatTime12Hour, getAvailabilityColor } from '@/lib/utils';
import { Tooltip } from './ui/Tooltip';
import { useMeetMeshStore } from '@/lib/store';
import { BLOCK_MINUTES } from '@/lib/constants';

interface OptimizedTimeGridProps {
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

// 虚拟化时间网格 - 只渲染可见区域
export function OptimizedTimeGrid({
  startDate,
  endDate,
  startTime,
  endTime,
  availability,
  myAvailability,
  onAvailabilityChange,
  totalParticipants,
}: OptimizedTimeGridProps) {
  const { dragState, setDragState, resetDragState } = useMeetMeshStore();
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 24 });

  const dates = useMemo(() => generateDateRange(startDate, endDate), [startDate, endDate]);
  const timeBlocks = useMemo(() => generateTimeBlocks(startTime, endTime), [startTime, endTime]);

  // 检测移动端和响应式处理
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 虚拟化：只渲染可见的时间块
  useEffect(() => {
    const handleScroll = () => {
      if (!gridRef.current) return;
      
      const container = gridRef.current;
      const scrollTop = container.scrollTop;
      const itemHeight = 32; // h-8
      const visibleStart = Math.floor(scrollTop / itemHeight);
      const visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2; // +2 for buffer
      
      setVisibleRange({
        start: Math.max(0, visibleStart - 1),
        end: Math.min(timeBlocks.length, visibleStart + visibleCount + 1)
      });
    };

    const container = gridRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // 初始计算
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [timeBlocks.length]);

  // 初始化选中状态
  useEffect(() => {
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

  const saveAvailability = useCallback(() => {
    // 转换选中的块为时间段
    const intervals: AvailabilityInterval[] = [];
    const blocksByDate: Record<string, Set<string>> = {};
    
    selectedBlocks.forEach((key) => {
      const [date, time] = key.split('_');
      if (!blocksByDate[date]) {
        blocksByDate[date] = new Set();
      }
      blocksByDate[date].add(time);
    });
    
    // 为每个日期创建时间段
    Object.entries(blocksByDate).forEach(([date, times]) => {
      const sortedTimes = Array.from(times).sort();
      
      let currentStart = sortedTimes[0];
      let currentEnd = sortedTimes[0];
      
      for (let i = 1; i < sortedTimes.length; i++) {
        const prevTime = sortedTimes[i - 1];
        const currTime = sortedTimes[i];
        
        // 检查时间是否连续（15分钟间隔）
        const [prevHour, prevMin] = prevTime.split(':').map(Number);
        const [currHour, currMin] = currTime.split(':').map(Number);
        const prevMinutes = prevHour * 60 + prevMin;
        const currMinutes = currHour * 60 + currMin;
        
        if (currMinutes - prevMinutes === BLOCK_MINUTES) {
          currentEnd = currTime;
        } else {
          // 添加时间段并开始新的时间段
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
      
      // 添加最后一个时间段
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

  // 全局鼠标事件处理
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragState.isDragging) {
        resetDragState();
        saveAvailability();
      }
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [dragState.isDragging, resetDragState, saveAvailability]);
  
  const handleMouseUp = () => {
    if (dragState.isDragging) {
      resetDragState();
      saveAvailability();
    }
  };

  // 移动端列表视图
  if (isMobile && viewMode === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Available Times</h3>
          <button
            onClick={() => setViewMode('grid')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Grid View
          </button>
        </div>
        
        <div className="space-y-3">
          {dates.map((date) => (
            <div key={date} className="bg-white rounded-lg border p-4">
              <h4 className="font-medium text-gray-900 mb-3">{formatDate(date)}</h4>
              <div className="grid grid-cols-3 gap-2">
                {timeBlocks.slice(0, 6).map((time) => {
                  const key = `${date}_${time}`;
                  const isSelected = selectedBlocks.has(key);
                  const { count } = getAvailabilityForBlock(date, time);
                  
                  return (
                    <button
                      key={time}
                      onClick={() => toggleBlock(date, time, isSelected ? 'deselect' : 'select')}
                      className={`
                        p-2 rounded-md text-sm font-medium transition-all
                        ${isSelected 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : count > 0 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                        active:scale-95
                      `}
                    >
                      <div>{formatTime12Hour(time)}</div>
                      {count > 0 && (
                        <div className="text-xs opacity-75">{count}</div>
                      )}
                    </button>
                  );
                })}
              </div>
              {timeBlocks.length > 6 && (
                <p className="text-xs text-gray-500 mt-2">+{timeBlocks.length - 6} more time slots</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 只渲染可见的时间块
  const visibleTimeBlocks = timeBlocks.slice(visibleRange.start, visibleRange.end);

  return (
    <div className="relative">
      {isMobile && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Available Times</h3>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>
      )}
      
      <div 
        ref={gridRef}
        className="overflow-x-auto overflow-y-auto max-h-96" 
        style={{ maxHeight: '600px' }}
      >
        <div 
          className="grid" 
          style={{ 
            gridTemplateColumns: `80px repeat(${dates.length}, minmax(80px, 1fr))`,
            paddingTop: `${visibleRange.start * 32}px`,
            paddingBottom: `${(timeBlocks.length - visibleRange.end) * 32}px`
          }}
        >
          {/* 表头行 */}
          <div className="sticky left-0 bg-white z-20 border-b border-r border-gray-300 p-2">
            <span className="text-xs font-semibold text-gray-600">Time</span>
          </div>
          {dates.map((date) => (
            <div
              key={date}
              className="border-b border-r border-gray-300 p-2 text-center bg-gray-50 sticky top-0 z-10"
            >
              <div className="text-xs font-semibold text-gray-700">
                {formatDate(date)}
              </div>
            </div>
          ))}
          
          {/* 可见的时间行 */}
          {visibleTimeBlocks.map((time) => (
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
      
      {isMobile && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          💡 Tip: Use grid view for detailed selection, list view for quick mobile selection
        </div>
      )}
    </div>
  );
}