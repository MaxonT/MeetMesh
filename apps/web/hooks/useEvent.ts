import { useEffect } from 'react';
import { useMeetMeshStore } from '@/lib/store';

/**
 * Hook for managing event data
 */
export function useEvent(eventId: string) {
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
      loadEvent(eventId);
    }
  }, [eventId, loadEvent]);
  
  const refresh = () => {
    loadEvent(eventId);
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
