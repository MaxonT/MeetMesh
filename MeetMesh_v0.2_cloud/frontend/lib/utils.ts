import { DateTime } from 'luxon';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BLOCK_MINUTES } from './constants';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate time blocks between start and end time
 */
export function generateTimeBlocks(startTime: string, endTime: string): string[] {
  const blocks: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  while (currentMinutes < endMinutes) {
    const hour = Math.floor(currentMinutes / 60);
    const min = currentMinutes % 60;
    blocks.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    currentMinutes += BLOCK_MINUTES;
  }
  
  return blocks;
}

/**
 * Generate array of dates between start and end date
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);
  
  while (current <= end) {
    dates.push(current.toISODate()!);
    current = current.plus({ days: 1 });
  }
  
  return dates;
}

/**
 * Format time for display (12-hour format)
 */
export function formatTime12Hour(time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format date for display
 */
export function formatDate(date: string): string {
  const dt = DateTime.fromISO(date);
  return dt.toFormat('EEE M/d');
}

/**
 * Format date long
 */
export function formatDateLong(date: string): string {
  const dt = DateTime.fromISO(date);
  return dt.toFormat('EEEE, MMMM d, yyyy');
}

/**
 * Convert time from one timezone to another
 */
export function convertTimezone(
  date: string,
  time: string,
  fromTz: string,
  toTz: string
): { date: string; time: string } {
  const dt = DateTime.fromISO(`${date}T${time}`, { zone: fromTz });
  const converted = dt.setZone(toTz);
  
  return {
    date: converted.toISODate()!,
    time: converted.toFormat('HH:mm'),
  };
}

/**
 * Get availability color based on count
 */
export function getAvailabilityColor(
  availableCount: number,
  totalParticipants: number,
  isUserAvailable: boolean
): string {
  if (totalParticipants === 0) {
    return isUserAvailable ? 'bg-blue-500' : 'bg-gray-50';
  }
  
  if (isUserAvailable && availableCount === 1) {
    return 'bg-blue-500';
  }
  
  const ratio = availableCount / totalParticipants;
  
  if (ratio === 0) return 'bg-gray-50';
  if (ratio <= 0.25) return 'bg-blue-100';
  if (ratio <= 0.5) return 'bg-blue-300';
  if (ratio <= 0.75) return 'bg-blue-500';
  return 'bg-blue-700';
}

/**
 * Get opacity based on availability ratio
 */
export function getAvailabilityOpacity(
  availableCount: number,
  totalParticipants: number
): number {
  if (totalParticipants === 0) return 0;
  return (availableCount / totalParticipants) * 100;
}

/**
 * Check if a time block is in user's availability
 */
export function isBlockAvailable(
  date: string,
  time: string,
  availabilityMatrix: Record<string, Record<string, number>>
): boolean {
  return !!availabilityMatrix[date]?.[time];
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Get user data from localStorage
 */
export function getUserFromStorage(eventId: string): { userId: string; username?: string } | null {
  if (typeof window === 'undefined') return null;
  
  const key = `meetmesh_user_${eventId}`;
  const data = localStorage.getItem(key);
  
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Save user data to localStorage
 */
export function saveUserToStorage(eventId: string, userId: string, username?: string): void {
  if (typeof window === 'undefined') return;
  
  const key = `meetmesh_user_${eventId}`;
  localStorage.setItem(key, JSON.stringify({ userId, username }));
}

/**
 * Clear user data from localStorage
 */
export function clearUserFromStorage(eventId: string): void {
  if (typeof window === 'undefined') return;
  
  const key = `meetmesh_user_${eventId}`;
  localStorage.removeItem(key);
}
