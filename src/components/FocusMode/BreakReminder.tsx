import React from 'react'
import { Coffee, X, Play } from 'lucide-react'
import clsx from 'clsx'

export interface BreakReminderProps {
  isVisible: boolean
  breakType: 'short-break' | 'long-break'
  onStartBreak: () => void
  onSkip: () => void
  onDismiss: () => void
}

const BREAK_DURATIONS = {
  'short-break': 5,
  'long-break': 15,
}

export const BreakReminder: React.FC<BreakReminderProps> = ({
  isVisible,
  breakType,
  onStartBreak,
  onSkip,
  onDismiss,
}) => {
  if (!isVisible) return null

  const breakDuration = BREAK_DURATIONS[breakType]

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/50 backdrop-blur-sm'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="break-reminder-title"
    >
      <div
        className={clsx(
          'relative max-w-md w-full mx-4 p-6 rounded-2xl shadow-2xl',
          'bg-surface-primary',
          'animate-in zoom-in-95 duration-200'
        )}
      >
        <button
          onClick={onDismiss}
          className={clsx(
            'absolute top-4 right-4 p-1 rounded-full',
            'text-content-tertiary hover:text-content-secondary',
            'hover:bg-surface-tertiary',
            'transition-colors'
          )}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div
            className={clsx(
              'inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full',
              'bg-gradient-to-br from-green-400 to-emerald-500',
              'text-white'
            )}
          >
            <Coffee className="w-8 h-8" />
          </div>

          <h2
            id="break-reminder-title"
            className="text-2xl font-bold text-content-primary mb-2"
          >
            Time for a break!
          </h2>

          <p className="text-content-secondary mb-2">
            Great work! You've completed your focus session. 🎉
          </p>

          <p className="text-sm text-content-tertiary mb-6">
            Take a {breakDuration}-minute {breakType === 'short-break' ? 'short' : 'long'} break to
            recharge.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onStartBreak}
              className={clsx(
                'flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg',
                'bg-gradient-to-r from-green-500 to-emerald-500',
                'hover:from-green-600 hover:to-emerald-600',
                'text-white font-semibold',
                'transition-all duration-200',
                'shadow-lg hover:shadow-xl'
              )}
            >
              <Play className="w-5 h-5" />
              Start Break
            </button>

            <button
              onClick={onSkip}
              className={clsx(
                'w-full py-2 px-4 rounded-lg',
                'text-content-secondary',
                'hover:text-content-primary',
                'hover:bg-surface-tertiary',
                'font-medium',
                'transition-colors'
              )}
            >
              Skip Break
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
