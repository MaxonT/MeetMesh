'use client';

import React, { useState, useEffect } from 'react';
import { Select } from './ui/Select';

interface ViewTimezoneSelectorProps {
  eventTimezone: string;
  currentViewTimezone: string;
  onTimezoneChange: (timezone: string) => void;
}

// Common timezones for quick selection
const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Beijing (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'UTC', label: 'UTC' },
];

export function ViewTimezoneSelector({ 
  eventTimezone, 
  currentViewTimezone, 
  onTimezoneChange 
}: ViewTimezoneSelectorProps) {
  const [selectedTimezone, setSelectedTimezone] = useState(currentViewTimezone);
  const [userTimezone, setUserTimezone] = useState<string>('');

  useEffect(() => {
    // Detect user's local timezone
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(detected);
  }, []);

  const handleChange = (value: string) => {
    setSelectedTimezone(value);
    onTimezoneChange(value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(e.target.value);
  };

  const isViewingEventTimezone = selectedTimezone === eventTimezone;
  const isViewingUserTimezone = selectedTimezone === userTimezone;

  // Build options list
  const options: Array<{ value: string; label: string; disabled?: boolean }> = [
    { 
      value: eventTimezone, 
      label: `Event Timezone (${eventTimezone})` 
    },
  ];

  if (userTimezone && userTimezone !== eventTimezone) {
    options.push({
      value: userTimezone,
      label: `My Timezone (${userTimezone})`,
    });
  }

  // Add separator
  options.push({ value: '_separator_', label: '---', disabled: true });

  // Add common timezones (excluding those already added)
  COMMON_TIMEZONES.forEach((tz) => {
    if (tz.value !== eventTimezone && tz.value !== userTimezone) {
      options.push(tz);
    }
  });

  return (
    <div>
      <label className="block text-sm font-medium text-foreground/80 mb-1">
        View Times In
      </label>
      <div className="space-y-2">
        <Select
          value={selectedTimezone}
          onChange={handleSelectChange}
          options={options}
        />
        
        {/* Indicator badges */}
        <div className="flex flex-wrap gap-2 text-xs">
          {isViewingEventTimezone && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Event Timezone
            </span>
          )}
          {!isViewingEventTimezone && isViewingUserTimezone && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-100">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Your Local Time
            </span>
          )}
          {!isViewingEventTimezone && !isViewingUserTimezone && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Custom View
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
