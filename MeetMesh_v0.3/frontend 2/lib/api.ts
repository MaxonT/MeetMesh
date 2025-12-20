import axios from 'axios';
import type {
  EventRecord,
  EventResponse,
  CreateEventInput,
  UserRecord,
  AvailabilityInterval,
  AvailabilityView,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required but not set. Please check your environment configuration.');
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create a new event
 */
export async function createEvent(data: CreateEventInput): Promise<EventRecord> {
  const response = await api.post('/events', data);
  return response.data;
}

/**
 * Get event details with participants and availability
 */
export async function getEvent(
  eventId: string, 
  userId?: string, 
  timezone?: string
): Promise<EventResponse> {
  const params: Record<string, string> = {};
  if (userId) params.userId = userId;
  if (timezone) params.timezone = timezone;
  const response = await api.get(`/events/${eventId}`, { 
    params: Object.keys(params).length > 0 ? params : undefined 
  });
  return response.data;
}

/**
 * Update event details
 */
export async function updateEvent(
  eventId: string,
  data: Partial<EventRecord>
): Promise<EventRecord> {
  const response = await api.patch(`/events/${eventId}`, data);
  return response.data;
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  await api.delete(`/events/${eventId}`);
}

/**
 * Create a new user for an event
 */
export async function createUser(
  eventId: string,
  username?: string
): Promise<UserRecord> {
  const response = await api.post(`/events/${eventId}/users`, { username });
  return response.data;
}

/**
 * Update username
 */
export async function updateUser(
  eventId: string,
  userId: string,
  username: string
): Promise<UserRecord> {
  const response = await api.patch(`/events/${eventId}/users/${userId}`, {
    username,
  });
  return response.data;
}

/**
 * Save user's availability
 */
export async function saveAvailability(
  eventId: string,
  userId: string,
  intervals: AvailabilityInterval[]
): Promise<void> {
  await api.post(`/events/${eventId}/availability`, {
    userId,
    intervals,
  });
}

/**
 * Clear user's availability
 */
export async function clearAvailability(
  eventId: string,
  userId: string
): Promise<void> {
  await api.delete(`/events/${eventId}/availability`, {
    data: { userId },
  });
}

/**
 * Get aggregated availability view
 */
export async function getAvailability(eventId: string): Promise<AvailabilityView> {
  const response = await api.get(`/events/${eventId}/availability`);
  return response.data;
}
