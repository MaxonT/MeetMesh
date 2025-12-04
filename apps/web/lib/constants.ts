// Constants for MeetMesh application

export const BLOCK_MINUTES = 15;

export const TIMEZONES = [
  // Americas
  { value: 'America/New_York', label: 'Eastern Time (ET)', group: 'Americas' },
  { value: 'America/Chicago', label: 'Central Time (CT)', group: 'Americas' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', group: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', group: 'Americas' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)', group: 'Americas' },
  { value: 'America/Toronto', label: 'Toronto (ET)', group: 'Americas' },
  { value: 'America/Vancouver', label: 'Vancouver (PT)', group: 'Americas' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST)', group: 'Americas' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', group: 'Americas' },
  
  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST)', group: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris (CET)', group: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', group: 'Europe' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET)', group: 'Europe' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)', group: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome (CET)', group: 'Europe' },
  { value: 'Europe/Athens', label: 'Athens (EET)', group: 'Europe' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', group: 'Europe' },
  
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST)', group: 'Asia' },
  { value: 'Asia/Kolkata', label: 'India (IST)', group: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', group: 'Asia' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', group: 'Asia' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', group: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', group: 'Asia' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', group: 'Asia' },
  
  // Pacific
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)', group: 'Pacific' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEDT)', group: 'Pacific' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)', group: 'Pacific' },
];

export const AVAILABILITY_COLORS = {
  empty: 'bg-gray-50 hover:bg-blue-50',
  user: 'bg-blue-500 hover:bg-blue-600',
  low: 'bg-blue-100 hover:bg-blue-200',
  medium: 'bg-blue-300 hover:bg-blue-400',
  high: 'bg-blue-500 hover:bg-blue-600',
  full: 'bg-blue-700 hover:bg-blue-800',
};
