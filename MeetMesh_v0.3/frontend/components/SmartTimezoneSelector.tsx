import React, { useState, useMemo } from 'react';
import { TIMEZONES } from '@/lib/constants';

interface SmartTimezoneSelectorProps {
  eventTimezone: string;
  currentViewTimezone: string;
  onTimezoneChange: (timezone: string) => void;
}

export function SmartTimezoneSelector({
  eventTimezone,
  currentViewTimezone,
  onTimezoneChange,
}: SmartTimezoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 智能时区建议
  const suggestedTimezones = useMemo(() => {
    const suggestions = [
      { timezone: eventTimezone, label: 'Event Timezone', type: 'event' },
      { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, label: 'Your Local Time', type: 'local' },
      { timezone: 'UTC', label: 'UTC', type: 'common' },
    ];

    // 去重并添加更多常用时区
    const uniqueSuggestions = suggestions.filter((item, index, arr) => 
      arr.findIndex(t => t.timezone === item.timezone) === index
    );

    return uniqueSuggestions;
  }, [eventTimezone]);

  // 过滤时区列表
  const filteredTimezones = useMemo(() => {
    if (!searchTerm) return TIMEZONES.slice(0, 20); // 限制显示数量
    
    return TIMEZONES.filter(tz => 
      tz.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tz.label.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [searchTerm]);

  // 获取当前时间显示
  const getCurrentTimeDisplay = (timezone: string) => {
    try {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const date = now.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      return { time, date };
    } catch {
      return { time: '--:--', date: 'Invalid timezone' };
    }
  };

  const currentDisplay = getCurrentTimeDisplay(currentViewTimezone);
  const eventDisplay = getCurrentTimeDisplay(eventTimezone);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full p-3 rounded-lg border-2 transition-all duration-200
          ${currentViewTimezone === eventTimezone 
            ? 'border-gray-300 bg-white hover:bg-gray-50' 
            : 'border-blue-500 bg-blue-50 hover:bg-blue-100'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">
              {currentViewTimezone === eventTimezone ? 'Event Timezone' : 'Your Viewing Timezone'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {currentDisplay.time} • {currentDisplay.date}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentViewTimezone !== eventTimezone && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                Modified
              </span>
            )}
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* 搜索框 */}
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Search timezones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* 建议时区 */}
          {!searchTerm && (
            <div className="p-3 border-b bg-muted/30">
            <h3 className="text-sm font-medium text-foreground mb-2">Quick Select</h3>
            <div className="space-y-1">
                {suggestedTimezones.map((suggestion) => {
                  const display = getCurrentTimeDisplay(suggestion.timezone);
                  const isSelected = suggestion.timezone === currentViewTimezone;
                  
                  return (
                    <button
                      key={suggestion.timezone}
                      onClick={() => {
                        onTimezoneChange(suggestion.timezone);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={`
                        w-full p-2 rounded-md text-left transition-colors
                        ${isSelected 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'hover:bg-white hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {suggestion.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {suggestion.timezone}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {display.time}
                          </div>
                          <div className="text-xs text-gray-500">
                            {display.date}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 所有时区列表 */}
          <div className="max-h-64 overflow-y-auto">
            <div className="p-3 space-y-1">
              {filteredTimezones.map((timezone) => {
                const display = getCurrentTimeDisplay(timezone.value);
                const isSelected = timezone.value === currentViewTimezone;
                
                return (
                  <button
                    key={timezone.value}
                    onClick={() => {
                      onTimezoneChange(timezone.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`
                      w-full p-2 rounded-md text-left transition-colors
                      ${isSelected 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">
                        {timezone.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {display.time}
                      </div>
                    </div>
                  </button>
                );
              })}
              
              {filteredTimezones.length === 0 && searchTerm && (
                <div className="text-center py-4 text-gray-500">
                  No timezones found matching &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 时区差异提示 */}
      {currentViewTimezone !== eventTimezone && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm">
              <div className="font-medium text-blue-900">Viewing in different timezone</div>
              <div className="text-blue-700 mt-1">
                Event: {eventDisplay.time} • {eventDisplay.date}
              </div>
              <div className="text-blue-700">
                Your view: {currentDisplay.time} • {currentDisplay.date}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}