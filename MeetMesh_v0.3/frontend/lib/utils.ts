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
 * @deprecated Use text-based identity instead
 */
export function getAvailabilityColor(
  availableCount: number,
  totalParticipants: number,
  isUserAvailable: boolean
): string {
  if (isUserAvailable) {
    return 'bg-primary/20 hover:bg-primary/30';
  }
  
  if (availableCount === 0) {
    return 'bg-transparent hover:bg-muted';
  }
  
  // Calculate opacity based on availability
  const opacity = Math.max(0.1, Math.min(0.9, availableCount / totalParticipants));
  
  // Use a green scale for availability
  if (opacity < 0.3) return 'bg-green-100 dark:bg-green-900/20';
  if (opacity < 0.6) return 'bg-green-300 dark:bg-green-900/40';
  return 'bg-green-500 dark:bg-green-900/60';
}

/**
 * Get unique prefixes for user names
 * Rules:
 * 1. Use uppercase
 * 2. Shortest unique prefix
 * 3. Max length 4
 */
export function getUniquePrefixes(names: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  const validNames = names.filter(n => n && n !== 'Anonymous');
  
  validNames.forEach(targetName => {
    // Default to first letter if something goes wrong
    let bestPrefix = targetName.substring(0, 1).toUpperCase();
    
    for (let len = 1; len <= targetName.length; len++) {
      const prefix = targetName.substring(0, len).toUpperCase();
      
      // Check for conflict with ANY other name
      const conflict = validNames.some(otherName => {
        if (otherName === targetName) return false;
        const otherPrefix = otherName.substring(0, len).toUpperCase();
        return otherPrefix === prefix;
      });
      
      if (!conflict || len >= 4 || len === targetName.length) {
        bestPrefix = prefix;
        break;
      }
    }
    
    result[targetName] = bestPrefix;
  });
  
  return result;
}

/**
 * Save user to local storage
 */
export function saveUserToStorage(eventId: string, userId: string, username?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`meetmesh_user_${eventId}`, JSON.stringify({ userId, username }));
}

/**
 * Get user from local storage
 */
export function getUserFromStorage(eventId: string): { userId: string; username: string } | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(`meetmesh_user_${eventId}`);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
