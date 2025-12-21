import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  id,
  type,
  placeholder,
  lang,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const isDateOrTime = type === 'date' || type === 'time';
  const resolvedPlaceholder = placeholder
    ?? (type === 'date'
      ? 'YYYY-MM-DD'
      : type === 'time'
        ? 'HH:MM'
        : undefined);
  const resolvedLang = isDateOrTime ? lang ?? 'en' : lang;

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    try {
      const input = inputRef.current;
      if (input && typeof (input as HTMLInputElement & { showPicker: () => void }).showPicker === 'function') {
        (input as HTMLInputElement & { showPicker: () => void }).showPicker();
      } else {
        input?.focus();
      }
    } catch {
      // Fallback for browsers that don't support showPicker or throw errors
      inputRef.current?.focus();
    }
  };

  return (
    <div className="w-full relative">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-input bg-background text-foreground placeholder:text-muted-foreground transition-colors duration-200',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            isDateOrTime && 'pr-10', // Add padding for the icon
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          type={type}
          placeholder={resolvedPlaceholder}
          lang={resolvedLang}
          {...props}
        />
        {type === 'date' && (
          <div 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={handleIconClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
          </div>
        )}
        {type === 'time' && (
          <div 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={handleIconClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
