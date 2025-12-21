'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { TIMEZONES } from '@/lib/constants';
import { createEvent } from '@/lib/api';
import type { CreateEventInput } from '@/types';

export function CreateEventForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateEventInput>({
    eventName: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'America/New_York',
  });
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.eventName.trim()) {
      setError('Event name is required');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      setError('Start and end dates are required');
      return;
    }
    
    if (formData.startDate > formData.endDate) {
      setError('End date must be after start date');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const event = await createEvent(formData);
      router.push(`/event/${event.eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="max-w-2xl mx-auto relative overflow-hidden">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-medium text-primary">Creating your event...</p>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Event Name *"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          placeholder="Team Meeting"
          required
        />
        
        <Textarea
          label="Description (optional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What's this event about?"
          rows={3}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
          
          <Input
            label="End Date *"
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Time *"
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
          
          <Input
            label="End Time *"
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </div>
        
        <Select
          label="Timezone *"
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
          options={TIMEZONES}
          required
        />
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </Button>
      </form>
    </Card>
  );
}
