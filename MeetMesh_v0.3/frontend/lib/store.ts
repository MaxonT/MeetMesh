import { create } from 'zustand';
import type {
  EventRecord,
  UserRecord,
  AvailabilityInterval,
  AvailabilityView,
} from '@/types';
import * as api from './api';
import { saveUserToStorage } from './utils';

interface DragState {
  isDragging: boolean;
  dragStartBlock: { date: string; time: string } | null;
  dragMode: 'select' | 'deselect' | null;
}

interface MeetMeshStore {
  // User state
  userId: string | null;
  username: string | null;
  setUser: (userId: string, username?: string) => void;
  
  // Event state
  currentEvent: EventRecord | null;
  participants: UserRecord[];
  
  // Availability state
  myAvailability: AvailabilityInterval[];
  allAvailability: AvailabilityView | null;
  
  // UI state
  selectedTimezone: string;
  dragState: DragState;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadEvent: (eventId: string, viewTimezone?: string) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<EventRecord>) => Promise<void>;
  createUser: (eventId: string, username?: string) => Promise<string>;
  updateUsername: (eventId: string, userId: string, username: string) => Promise<void>;
  saveMyAvailability: (eventId: string, intervals: AvailabilityInterval[]) => Promise<void>;
  clearMyAvailability: (eventId: string) => Promise<void>;
  setTimezone: (tz: string) => void;
  setDragState: (state: Partial<DragState>) => void;
  resetDragState: () => void;
  setMyAvailability: (intervals: AvailabilityInterval[]) => void;
}

export const useMeetMeshStore = create<MeetMeshStore>((set, get) => ({
  // Initial state
  userId: null,
  username: null,
  currentEvent: null,
  participants: [],
  myAvailability: [],
  allAvailability: null,
  selectedTimezone: '',
  dragState: {
    isDragging: false,
    dragStartBlock: null,
    dragMode: null,
  },
  isLoading: false,
  error: null,
  
  // Set user
  setUser: (userId: string, username?: string) => {
    set({ userId, username });
  },
  
  // Load event data
  loadEvent: async (eventId: string, viewTimezone?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { userId } = get();
      const data = await api.getEvent(eventId, userId ?? undefined, viewTimezone);
      
      set({
        currentEvent: data.event,
        participants: data.participants,
        allAvailability: data.availability,
        selectedTimezone: viewTimezone || data.event.timezone,
        myAvailability: data.myAvailability ?? [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load event',
        isLoading: false,
      });
    }
  },
  
  // Update event
  updateEvent: async (eventId: string, updates: Partial<EventRecord>) => {
    try {
      const updatedEvent = await api.updateEvent(eventId, updates);
      
      set({ currentEvent: updatedEvent });
      
      // Reload event to get updated availability (in case timezone changed)
      await get().loadEvent(eventId);
    } catch (error) {
      throw error;
    }
  },
  
  // Create user
  createUser: async (eventId: string, username?: string) => {
    try {
      const user = await api.createUser(eventId, username);
      
      set({
        userId: user.userId,
        username: user.username,
      });
      
      // Save to localStorage
      saveUserToStorage(eventId, user.userId, user.username);
      
      return user.userId;
    } catch (error) {
      throw error;
    }
  },
  
  // Update username
  updateUsername: async (eventId: string, userId: string, username: string) => {
    try {
      await api.updateUser(eventId, userId, username);
      
      set({ username });
      
      // Update localStorage
      saveUserToStorage(eventId, userId, username);
    } catch (error) {
      throw error;
    }
  },
  
  // Save availability
  saveMyAvailability: async (eventId: string, intervals: AvailabilityInterval[]) => {
    const { userId } = get();
    if (!userId) throw new Error('User not initialized');
    
    try {
      await api.saveAvailability(eventId, userId, intervals);
      
      set({ myAvailability: intervals });
      
      // Reload event to get updated availability
      await get().loadEvent(eventId);
    } catch (error) {
      throw error;
    }
  },
  
  // Clear availability
  clearMyAvailability: async (eventId: string) => {
    const { userId } = get();
    if (!userId) throw new Error('User not initialized');
    
    try {
      await api.clearAvailability(eventId, userId);
      
      set({ myAvailability: [] });
      
      // Reload event to get updated availability
      await get().loadEvent(eventId);
    } catch (error) {
      throw error;
    }
  },
  
  // Set timezone
  setTimezone: (tz: string) => {
    set({ selectedTimezone: tz });
  },
  
  // Set drag state
  setDragState: (state: Partial<DragState>) => {
    set((prev) => ({
      dragState: { ...prev.dragState, ...state },
    }));
  },
  
  // Reset drag state
  resetDragState: () => {
    set({
      dragState: {
        isDragging: false,
        dragStartBlock: null,
        dragMode: null,
      },
    });
  },
  
  // Set my availability (local state)
  setMyAvailability: (intervals: AvailabilityInterval[]) => {
    set({ myAvailability: intervals });
  },
}));
