import React from 'react';
import type { AvailabilitySummary } from '@/types';
import { Card } from './ui/Card';
import { formatTime24Hour, formatDate } from '@/lib/utils';

interface AvailabilitySummaryProps {
  summary: AvailabilitySummary;
  totalParticipants: number;
}

export function AvailabilitySummaryComponent({ summary, totalParticipants }: AvailabilitySummaryProps) {
  const { bestBlocks, everyoneBlocks, mostAvailableDay } = summary;
  
  if (totalParticipants === 0) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">No availability data yet</p>
      </Card>
    );
  }
  
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Availability Summary
      </h3>
      
      <div className="space-y-3">
        {/* Best Times */}
        {bestBlocks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              🎯 Best Times
            </h4>
            <ul className="space-y-1">
              {bestBlocks.slice(0, 5).map((block, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  {formatDate(block.date)} at {formatTime24Hour(block.time)} ({block.count}/{totalParticipants} people)
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Everyone Available */}
        {everyoneBlocks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              ✅ Everyone Available
            </h4>
            <ul className="space-y-1">
              {everyoneBlocks.slice(0, 5).map((block, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  {formatDate(block.date)} at {formatTime24Hour(block.time)}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Most Available Day */}
        {mostAvailableDay && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              📅 Best Day
            </h4>
            <p className="text-sm text-muted-foreground">
              {formatDate(mostAvailableDay.date)} ({mostAvailableDay.total} total slots available)
            </p>
          </div>
        )}
        
        {bestBlocks.length === 0 && everyoneBlocks.length === 0 && !mostAvailableDay && (
          <p className="text-sm text-muted-foreground">No overlapping availability yet</p>
        )}
      </div>
    </Card>
  );
}
