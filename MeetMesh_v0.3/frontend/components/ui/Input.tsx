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

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-input bg-background text-foreground placeholder:text-muted-foreground transition-colors duration-200',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          error && 'border-destructive focus:ring-destructive',
          className
        )}
        type={type}
        placeholder={resolvedPlaceholder}
        lang={resolvedLang}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
