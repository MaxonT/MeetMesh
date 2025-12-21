'use client';

import React from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface UserNameModalProps {
  isOpen: boolean;
  onSubmit: (username: string) => void;
  initialUsername?: string;
  onCancel?: () => void;
}

export function UserNameModal({ isOpen, onSubmit, initialUsername = '', onCancel }: UserNameModalProps) {
  const [username, setUsername] = React.useState(initialUsername);

  // Reset username when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setUsername(initialUsername);
    }
  }, [isOpen, initialUsername]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onCancel || (() => {})} title={onCancel ? "Edit Your Name" : "Welcome to MeetMesh"} showCloseButton={!!onCancel}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {onCancel 
            ? "Update your name so others can identify your availability."
            : "Enter your name to get started. This will help others identify your availability."
          }
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
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                onSubmit('');
              }
            }}
          >
            {onCancel ? 'Cancel' : 'Skip'}
          </Button>
          <Button type="submit">
            {onCancel ? 'Save' : 'Continue'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
