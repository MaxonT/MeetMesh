'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShareLink } from '@/components/ShareLink';
import { ParticipantList } from '@/components/ParticipantList';
import { TimezoneSelector } from '@/components/TimezoneSelector';
import { AvailabilitySummaryComponent } from '@/components/AvailabilitySummary';
import { UserNameModal } from '@/components/UserNameModal';
import { TimeGrid } from '@/components/TimeGrid';
import { useUser } from '@/hooks/useUser';
import { useEvent } from '@/hooks/useEvent';
import { useAvailability } from '@/hooks/useAvailability';
import type { AvailabilityInterval } from '@/types';

export default function EventPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { userId, username, initializeUser, isInitialized } = useUser(eventId);
  const { event, participants, availability, isLoading, error } = useEvent(eventId);
  const { availability: myAvailability, saveAvailability } = useAvailability(eventId);
  
  // Show user modal if not initialized
  useEffect(() => {
    if (!isInitialized && !isLoading && event) {
      setShowUserModal(true);
    }
  }, [isInitialized, isLoading, event]);
  
  const handleUserSubmit = async (name: string) => {
    await initializeUser(name);
    setShowUserModal(false);
  };
  
  const handleAvailabilityChange = async (intervals: AvailabilityInterval[]) => {
    if (!userId) return;
    await saveAvailability(intervals);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error || 'Event not found'}</p>
          <Button
            className="mt-4"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{event.eventName}</h1>
            {event.description && (
              <p className="text-gray-600">{event.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <ShareLink eventId={eventId} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimezoneSelector />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={username || 'Anonymous'}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 cursor-default"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowUserModal(true)}
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Time Grid */}
      <Card className="mb-6 overflow-hidden" padding="none">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold">Select Your Availability</h2>
          <p className="text-sm text-gray-600 mt-1">
            Click and drag to select times when you&apos;re available
          </p>
        </div>
        
        <div className="p-4">
          <TimeGrid
            startDate={event.startDate}
            endDate={event.endDate}
            startTime={event.startTime}
            endTime={event.endTime}
            availability={availability}
            myAvailability={myAvailability}
            onAvailabilityChange={handleAvailabilityChange}
            totalParticipants={participants.length}
            currentUserId={userId}
          />
        </div>
      </Card>
      
      {/* Summary and Participants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AvailabilitySummaryComponent
          summary={availability?.summary || { bestBlocks: [], everyoneBlocks: [], mostAvailableDay: null }}
          totalParticipants={participants.length}
        />
        
        <ParticipantList
          participants={participants}
          currentUserId={userId}
        />
      </div>
      
      {/* User Name Modal */}
      <UserNameModal
        isOpen={showUserModal}
        onSubmit={handleUserSubmit}
        initialUsername={username || ''}
      />
    </div>
  );
}
