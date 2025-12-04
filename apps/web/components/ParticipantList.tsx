import React from 'react';
import type { UserRecord } from '@/types';
import { Card } from './ui/Card';

interface ParticipantListProps {
  participants: UserRecord[];
  currentUserId?: string | null;
}

export function ParticipantList({ participants, currentUserId }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500">No participants yet</p>
      </Card>
    );
  }
  
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Participants ({participants.length})
      </h3>
      <ul className="space-y-2">
        {participants.map((participant) => (
          <li
            key={participant.userId}
            className="flex items-center gap-2 text-sm"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className={participant.userId === currentUserId ? 'font-semibold' : ''}>
              {participant.username || 'Anonymous'}
              {participant.userId === currentUserId && ' (You)'}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
