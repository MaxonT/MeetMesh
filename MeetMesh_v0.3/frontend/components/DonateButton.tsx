'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import axios from 'axios';

export function DonateButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('5.00');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDonate = async () => {
    setIsLoading(true);
    setStatus('idle');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await axios.post(`${apiUrl}/donate`, { amount });
      setStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Donation failed:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed top-4 right-20 z-50">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => setIsModalOpen(true)}
          className="shadow-md gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white border-none hover:from-pink-600 hover:to-rose-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.28 3.6-2.34 3.6-4.44C22.59 7.05 20.52 5 18 5c-1.58 0-2.97 1-3.69 2.47-.07.15-.26.15-.33 0C13.3 5.3 11.5 4 9 4c-4.42 0-8 3.58-8 8.03 0 4.85 7.76 11.4 11.53 14.54a.63.63 0 0 0 .76 0l.47-.37" />
          </svg>
          Donate
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Support MeetMesh"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Your support helps us keep the servers running and coffee brewing!
          </p>
          
          <div className="grid grid-cols-3 gap-2">
            {['2.00', '5.00', '10.00'].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={`p-2 rounded-md border ${
                  amount === val 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border hover:bg-muted'
                }`}
              >
                ${val}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 p-2 rounded-md border border-input bg-background"
              placeholder="Custom amount"
            />
          </div>

          {status === 'success' ? (
            <div className="p-3 bg-green-100 text-green-700 rounded-md text-center animate-in fade-in">
              Thank you for your generosity! ❤️
            </div>
          ) : status === 'error' ? (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-center">
              Something went wrong. Please try again.
            </div>
          ) : (
            <Button 
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              onClick={handleDonate}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : `Donate $${amount}`}
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
}
