'use client';

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface UserNameModalProps {
  isOpen: boolean;
  onSubmit: (username: string) => void;
  initialUsername?: string;
}

export function UserNameModal({ isOpen, onSubmit, initialUsername = '' }: UserNameModalProps) {
  const [username, setUsername] = useState(initialUsername);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Welcome to MeetMesh" showCloseButton={false}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Enter your name to get started. This will help others identify your availability.
        </p>
        
        <Input
          label="Your Name (optional)"
          placeholder="John Doe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSubmit('')}
          >
            Skip
          </Button>
          <Button type="submit">
            Continue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
