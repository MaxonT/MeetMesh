'use client'

import { useTheme } from './ThemeProvider'
import { Button } from './ui/Button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="relative"
    >
      <div className="flex items-center gap-2">
        <div className="relative w-5 h-5">
          {/* 太阳图标 */}
          <svg
            className={`absolute inset-0 transition-all duration-300 ${
              theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          {/* 月亮图标 */}
          <svg
            className={`absolute inset-0 transition-all duration-300 ${
              theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </div>
        <span className="hidden sm:inline text-sm font-medium">
          {theme === 'light' ? '深色' : '浅色'}
        </span>
      </div>
    </Button>
  )
}