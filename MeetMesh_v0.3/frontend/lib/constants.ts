// Constants for MeetMesh application

export const BLOCK_MINUTES = 15;

export const TIMEZONES = [
  // Americas
  { value: 'America/New_York', label: 'Eastern Time (ET) UTC-5', group: 'Americas' },
  { value: 'America/Chicago', label: 'Central Time (CT) UTC-6', group: 'Americas' },
  { value: 'America/Denver', label: 'Mountain Time (MT) UTC-7', group: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) UTC-8', group: 'Americas' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST) UTC-7', group: 'Americas' },
  { value: 'America/Toronto', label: 'Toronto (ET) UTC-5', group: 'Americas' },
  { value: 'America/Vancouver', label: 'Vancouver (PT) UTC-8', group: 'Americas' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST) UTC-6', group: 'Americas' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT) UTC-3', group: 'Americas' },
  
  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST) UTC+0', group: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris (CET) UTC+1', group: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (CET) UTC+1', group: 'Europe' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET) UTC+1', group: 'Europe' },
  { value: 'Europe/Madrid', label: 'Madrid (CET) UTC+1', group: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome (CET) UTC+1', group: 'Europe' },
  { value: 'Europe/Athens', label: 'Athens (EET) UTC+2', group: 'Europe' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK) UTC+3', group: 'Europe' },
  
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST) UTC+4', group: 'Asia' },
  { value: 'Asia/Kolkata', label: 'India (IST) UTC+5:30', group: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT) UTC+8', group: 'Asia' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST) UTC+8', group: 'Asia' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT) UTC+8', group: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST) UTC+9', group: 'Asia' },
  { value: 'Asia/Seoul', label: 'Seoul (KST) UTC+9', group: 'Asia' },
  
  // Pacific
  { value: 'Australia/Sydney', label: 'Sydney (AEDT) UTC+11', group: 'Pacific' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEDT) UTC+11', group: 'Pacific' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT) UTC+13', group: 'Pacific' },
];

export const AVAILABILITY_COLORS = {
  empty: 'bg-gray-50 hover:bg-blue-50',
  user: 'bg-blue-500 hover:bg-blue-600',
  low: 'bg-blue-100 hover:bg-blue-200',
  medium: 'bg-blue-300 hover:bg-blue-400',
  high: 'bg-blue-500 hover:bg-blue-600',
  full: 'bg-blue-700 hover:bg-blue-800',
};
