import { useEffect } from 'react';
import { useMeetMeshStore } from '@/lib/store';

/**
 * Hook for managing event data
 */
export function useEvent(eventId: string, viewTimezone?: string) {
  const {
    currentEvent,
    participants,
    allAvailability,
    isLoading,
    error,
    loadEvent,
  } = useMeetMeshStore();
  
  useEffect(() => {
    if (eventId) {
      loadEvent(eventId, viewTimezone);
    }
  }, [eventId, viewTimezone, loadEvent]);
  
  const refresh = (timezone?: string) => {
    loadEvent(eventId, timezone);
  };
  
  return {
    event: currentEvent,
    participants,
    availability: allAvailability,
    isLoading,
    error,
    refresh,
  };
}
