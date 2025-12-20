'use client';

import React from 'react';
import { Select } from './ui/Select';
import { TIMEZONES } from '@/lib/constants';
import { useMeetMeshStore } from '@/lib/store';

export function TimezoneSelector() {
  const { selectedTimezone, setTimezone } = useMeetMeshStore();
  
  return (
    <Select
      label="Timezone"
      value={selectedTimezone}
      onChange={(e) => setTimezone(e.target.value)}
      options={TIMEZONES}
    />
  );
}
