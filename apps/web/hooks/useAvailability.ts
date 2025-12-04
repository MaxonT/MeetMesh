import { useState, useCallback } from 'react';
import { useMeetMeshStore } from '@/lib/store';
import type { AvailabilityInterval } from '@/types';

/**
 * Hook for managing availability selection
 */
export function useAvailability(eventId: string) {
  const {
    myAvailability,
    saveMyAvailability,
    clearMyAvailability,
    setMyAvailability,
  } = useMeetMeshStore();
  
  const [isSaving, setIsSaving] = useState(false);
  
  const saveAvailability = useCallback(async (intervals: AvailabilityInterval[]) => {
    setIsSaving(true);
    try {
      await saveMyAvailability(eventId, intervals);
    } catch (error) {
      console.error('Failed to save availability:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [eventId, saveMyAvailability]);
  
  const clearAvailability = useCallback(async () => {
    setIsSaving(true);
    try {
      await clearMyAvailability(eventId);
    } catch (error) {
      console.error('Failed to clear availability:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [eventId, clearMyAvailability]);
  
  const updateLocalAvailability = useCallback((intervals: AvailabilityInterval[]) => {
    setMyAvailability(intervals);
  }, [setMyAvailability]);
  
  return {
    availability: myAvailability,
    isSaving,
    saveAvailability,
    clearAvailability,
    updateLocalAvailability,
  };
}
