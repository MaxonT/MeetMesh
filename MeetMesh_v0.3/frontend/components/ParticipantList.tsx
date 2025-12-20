import React from 'react';
import type { UserRecord, ParticipantAvailability } from '@/types';
import { Card } from './ui/Card';

interface ParticipantListProps {
  participants: UserRecord[];
  currentUserId?: string | null;
  participantAvailability?: ParticipantAvailability[];
}

export function ParticipantList({ 
  participants, 
  currentUserId,
  participantAvailability 
}: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">No participants yet</p>
      </Card>
    );
  }

  // Create a map for quick lookup of availability data
  const availabilityMap = new Map<string, ParticipantAvailability>();
  participantAvailability?.forEach((pa) => {
    availabilityMap.set(pa.userId, pa);
  });
  
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Participants ({participants.length})
      </h3>
      <ul className="space-y-3">
        {participants.map((participant) => {
          const availability = availabilityMap.get(participant.userId);
          const hasAvailability = availability && availability.availableBlocks > 0;
          
          return (
            <li
              key={participant.userId}
              className="flex items-start justify-between gap-3"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  hasAvailability ? 'bg-green-500' : 'bg-muted'
                }`} />
                <span className={`text-sm truncate ${
                  participant.userId === currentUserId ? 'font-semibold' : ''
                }`}>
                  {participant.username || 'Anonymous'}
                  {participant.userId === currentUserId && ' (You)'}
                </span>
              </div>
              
              {availability && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-medium text-foreground">
                      {availability.availabilityPct}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {availability.availableBlocks} blocks
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                      style={{ width: `${availability.availabilityPct}%` }}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
