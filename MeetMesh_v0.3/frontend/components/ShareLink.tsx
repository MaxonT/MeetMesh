'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';

interface ShareLinkProps {
  eventId: string;
}

export function ShareLink({ eventId }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/event/${eventId}`
    : '';
  
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback: select the text so user can copy manually
      const input = document.querySelector('input[readonly]') as HTMLInputElement;
      if (input) {
        input.select();
        input.focus();
      }
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={shareUrl}
        readOnly
        className="flex-1 px-3 py-2 text-sm border border-input rounded-lg bg-muted text-foreground cursor-default focus:outline-none"
        onClick={(e) => e.currentTarget.select()}
      />
      <Button onClick={handleCopy} size="sm" variant={copied ? 'secondary' : 'primary'}>
        {copied ? (
          <>
            <svg className="w-4 h-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy
          </>
        )}
      </Button>
    </div>
  );
}
