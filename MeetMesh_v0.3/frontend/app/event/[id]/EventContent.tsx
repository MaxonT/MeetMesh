'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EventPageSkeleton } from '@/components/SkeletonLoaders';
import { ErrorState } from '@/components/ErrorStates';
import { ShareLink } from '@/components/ShareLink';
import { ParticipantList } from '@/components/ParticipantList';
import { ViewTimezoneSelector } from '@/components/ViewTimezoneSelector';
import { EventSettingsModal } from '@/components/EventSettingsModal';
import { AvailabilitySummaryComponent } from '@/components/AvailabilitySummary';
import { UserNameModal } from '@/components/UserNameModal';
import { TimeGrid } from '@/components/TimeGrid';
import { useUser } from '@/hooks/useUser';
import { useEvent } from '@/hooks/useEvent';
import { useAvailability } from '@/hooks/useAvailability';
import { useMeetMeshStore } from '@/lib/store';
import type { AvailabilityInterval, AvailabilityView, EventRecord } from '@/types';

interface EventContentProps {
  eventId: string;
}

export function EventContent({ eventId }: EventContentProps) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewTimezone, setViewTimezone] = useState<string>('');
  
  const { userId, username, initializeUser, isInitialized } = useUser(eventId);
  const { event, participants, availability, isLoading, error, refresh } = useEvent(eventId, viewTimezone || undefined);
  const { availability: myAvailability, saveAvailability } = useAvailability(eventId);
  const { updateEvent } = useMeetMeshStore();
  
  // Initialize viewTimezone to event timezone
  useEffect(() => {
    if (event && !viewTimezone) {
      setViewTimezone(event.timezone);
    }
  }, [event, viewTimezone]);
  
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

  const handleTimezoneChange = (timezone: string) => {
    setViewTimezone(timezone);
    refresh(timezone);
  };

  const handleUpdateEvent = async (updates: Partial<EventRecord>) => {
    await updateEvent(eventId, updates);
    // Refresh with current view timezone
    refresh(viewTimezone || undefined);
  };
  
  if (isLoading) {
    return <EventPageSkeleton />;
  }
  
  if (error || !event) {
    return (
      <ErrorState
        title="Event Not Found"
        message={error || 'This event may have been deleted or the link is incorrect.'}
        onRetry={refresh}
        onGoHome={() => window.location.href = '/'}
        errorCode={error ? 'EVENT_ERROR' : 'NOT_FOUND'}
      />
    );
  }

  const isViewingDifferentTimezone = viewTimezone && viewTimezone !== event.timezone;
  
  // Use localized availability data for display if available, otherwise use regular availability
  const availabilityData = isViewingDifferentTimezone && availability?.localizedAvailability
    ? {
        availabilityByDate: availability.localizedAvailability.availabilityByDate,
        availabilityMatrix: availability.localizedAvailability.availabilityMatrix,
        summary: availability.summary, // Always use the main summary which has all the data
      } as AvailabilityView
    : availability;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <Card className="mb-6 shadow-xl border-border/70 bg-card/90 backdrop-blur">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 text-foreground leading-tight">{event.eventName}</h1>
            {event.description && (
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            )}
            {/* Timezone indicator */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-foreground/80">
                <svg className="w-4 h-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Event: {event.timezone}
              </span>
              {isViewingDifferentTimezone && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  Viewing: {viewTimezone}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground border border-border/70"
            aria-label="Settings"
            title="Event Settings"
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
            <ViewTimezoneSelector
              eventTimezone={event.timezone}
              currentViewTimezone={viewTimezone || event.timezone}
              onTimezoneChange={handleTimezoneChange}
            />

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Your Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={username || 'Anonymous'}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-input rounded-lg bg-muted/50 text-foreground cursor-default"
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
      <Card className="mb-6 overflow-hidden border-border/70 shadow-xl" padding="none">
        <div className="p-5 border-b bg-muted/50 dark:bg-slate-800/70">
          <h2 className="text-xl font-semibold text-foreground">Select Your Availability</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tap to pick a time, or long-press and drag to brush across multiple slots.
          </p>
          {isViewingDifferentTimezone && (
            <p className="text-sm text-blue-700 dark:text-blue-200 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Times shown in {viewTimezone}
            </p>
          )}
        </div>

        <div className="p-4 bg-card">
          <TimeGrid
            startDate={event.startDate}
            endDate={event.endDate}
            startTime={event.startTime}
            endTime={event.endTime}
            availability={availabilityData}
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
          summary={availability?.summary || { 
            bestBlocks: [], 
            everyoneBlocks: [], 
            mostAvailableDay: null,
            participantAvailability: [],
            totalBlocks: 0,
            totalParticipants: 0,
          }}
          totalParticipants={participants.length}
        />
        
        <ParticipantList
          participants={participants}
          currentUserId={userId}
          participantAvailability={availability?.summary?.participantAvailability}
        />
      </div>
      
      {/* User Name Modal */}
      <UserNameModal
        isOpen={showUserModal}
        onSubmit={handleUserSubmit}
        initialUsername={username || ''}
      />

      {/* Event Settings Modal */}
      {event && (
        <EventSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          event={event}
          onUpdateEvent={handleUpdateEvent}
        />
      )}
    </div>
  );
}
