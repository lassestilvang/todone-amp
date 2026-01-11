import React from 'react'
import { Play, Pause, Square } from 'lucide-react'
import clsx from 'clsx'
import type { FocusSession } from '@/types'

const SESSION_LABELS: Record<string, string> = {
  focus: 'Focus Time',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
}

const SESSION_COLORS: Record<string, { stroke: string; text: string }> = {
  focus: {
    stroke: 'stroke-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  'short-break': {
    stroke: 'stroke-green-500',
    text: 'text-green-600 dark:text-green-400',
  },
  'long-break': {
    stroke: 'stroke-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
  },
}

interface PomodoroTimerProps {
  isActive: boolean
  isPaused: boolean
  timeRemaining: number
  formattedTime: string
  progress: number
  currentSession: FocusSession | null
  sessionCount: number
  startFocus: (taskId?: string) => void
  pauseFocus: () => void
  resumeFocus: () => void
  stopFocus: () => void
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  isActive,
  isPaused,
  formattedTime,
  progress,
  currentSession,
  sessionCount,
  startFocus,
  pauseFocus,
  resumeFocus,
  stopFocus,
}) => {
  const sessionType = currentSession?.type || 'focus'
  const colors = SESSION_COLORS[sessionType] || SESSION_COLORS.focus
  const label = SESSION_LABELS[sessionType] || 'Focus Time'

  const radius = 90
  const strokeWidth = 8
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - progress * circumference

  const handlePlayPause = () => {
    if (!isActive) {
      startFocus()
    } else if (isPaused) {
      resumeFocus()
    } else {
      pauseFocus()
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="relative">
        <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={clsx('transition-all duration-300', colors.stroke)}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{formattedTime}</span>
          <span className={clsx('text-sm font-medium mt-1', colors.text)}>{label}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          className={clsx(
            'p-4 rounded-full transition-colors',
            'bg-blue-500 hover:bg-blue-600 text-white',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'dark:focus:ring-offset-gray-900'
          )}
          aria-label={!isActive ? 'Start' : isPaused ? 'Resume' : 'Pause'}
        >
          {!isActive || isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
        </button>

        {isActive && (
          <button
            onClick={stopFocus}
            className={clsx(
              'p-4 rounded-full transition-colors',
              'bg-gray-200 hover:bg-gray-300 text-gray-700',
              'dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
              'dark:focus:ring-offset-gray-900'
            )}
            aria-label="Stop"
          >
            <Square className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">{sessionCount}</span>
        <span>/4 sessions</span>
      </div>
    </div>
  )
}
