import { useEffect } from 'react';
import { useMeetMeshStore } from '@/lib/store';
import { getUserFromStorage } from '@/lib/utils';

/**
 * Hook for managing user state
 */
export function useUser(eventId: string) {
  const { userId, username, setUser, createUser, updateUsername } = useMeetMeshStore();
  
  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = getUserFromStorage(eventId);
    if (storedUser) {
      setUser(storedUser.userId, storedUser.username);
    }
  }, [eventId, setUser]);
  
  const initializeUser = async (name?: string) => {
    const newUserId = await createUser(eventId, name);
    return newUserId;
  };
  
  const updateName = async (name: string) => {
    if (!userId) throw new Error('User not initialized');
    await updateUsername(eventId, userId, name);
  };
  
  return {
    userId,
    username,
    initializeUser,
    updateName,
    isInitialized: !!userId,
  };
}
