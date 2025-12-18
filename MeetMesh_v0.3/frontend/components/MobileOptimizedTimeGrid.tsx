import React, { useState, useEffect } from 'react';
import type { AvailabilityInterval, AvailabilityView } from '@/types';

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

export function OptimizedTimeGrid({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startDate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  endDate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startTime,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  endTime,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  availability,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  myAvailability,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAvailabilityChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  totalParticipants,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentUserId,
}: OptimizedTimeGridProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile-optimized list view
  if (isMobile && viewMode === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Available Times</h3>
          <button
            onClick={() => setViewMode('grid')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded"
          >
            Grid View
          </button>
        </div>
        
        {/* Mobile-friendly time selection */}
        <div className="space-y-3">
          {/* Implementation for mobile list view */}
          <p className="text-gray-500 text-center py-8">
            Mobile-optimized time selection coming soon!
          </p>
        </div>
      </div>
    );
  }

  // Desktop grid view (fallback to original TimeGrid)
  return (
    <div className="relative">
      {isMobile && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Available Times</h3>
          <button
            onClick={() => setViewMode('list')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded"
          >
            List View
          </button>
        </div>
      )}
      
      {/* Original TimeGrid implementation */}
      <div className="overflow-x-auto">
        <p className="text-gray-500 text-center py-8">
          Original TimeGrid component will be rendered here
        </p>
      </div>
    </div>
  );
}

// Touch-friendly time block component
export function TouchFriendlyTimeBlock({
  date,
  time,
  isSelected,
  availabilityCount,
  totalParticipants,
  onToggle,
}: {
  date: string;
  time: string;
  isSelected: boolean;
  availabilityCount: number;
  totalParticipants: number;
  onToggle: () => void;
}) {
  const getBackgroundColor = () => {
    if (isSelected) return 'bg-blue-500';
    if (availabilityCount === 0) return 'bg-gray-100';
    
    const intensity = availabilityCount / totalParticipants;
    if (intensity > 0.8) return 'bg-green-400';
    if (intensity > 0.6) return 'bg-green-300';
    if (intensity > 0.4) return 'bg-green-200';
    if (intensity > 0.2) return 'bg-green-100';
    return 'bg-gray-50';
  };

  return (
    <button
      onClick={onToggle}
      className={`
        w-full h-12 rounded-lg border-2 transition-all duration-200
        ${getBackgroundColor()}
        ${isSelected ? 'border-blue-600 shadow-lg' : 'border-gray-300'}
        hover:shadow-md active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500
      `}
      aria-label={`${time} on ${date} - ${availabilityCount} people available`}
    >
      <div className="text-xs font-medium">
        {time}
      </div>
      {availabilityCount > 0 && (
        <div className="text-xs text-gray-600">
          {availabilityCount}/{totalParticipants}
        </div>
      )}
    </button>
  );
}