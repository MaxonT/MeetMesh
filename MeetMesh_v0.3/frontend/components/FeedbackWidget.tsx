'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { usePathname } from 'next/navigation';

export function FeedbackWidget() {
  const pathname = usePathname();
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  const handleVote = async (type: 'up' | 'down') => {
    if (voted) return;
    
    setVoted(type);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await axios.post(`${apiUrl}/feedback`, { 
        type, 
        page: pathname 
      });
    } catch (error) {
      console.error('Feedback failed:', error);
      // Revert optimism if needed, but usually fine to leave it
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border p-2 rounded-full shadow-lg transition-all hover:scale-105">
      <button
        onClick={() => handleVote('up')}
        disabled={!!voted}
        className={`p-2 rounded-full transition-colors ${
          voted === 'up' 
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
            : voted 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20'
        }`}
        title="Helpful"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 10v12" />
          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
        </svg>
      </button>
      
      <div className="w-px h-6 bg-border" />
      
      <button
        onClick={() => handleVote('down')}
        disabled={!!voted}
        className={`p-2 rounded-full transition-colors ${
          voted === 'down' 
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
            : voted 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
        }`}
        title="Not helpful"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 14V2" />
          <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
        </svg>
      </button>
    </div>
  );
}
