import { useState, useEffect, useRef } from 'react'
import { Timer, Settings, ChevronUp, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { PomodoroTimer } from './PomodoroTimer'
import { FocusSettings } from './FocusSettings'
import { BreakReminder } from './BreakReminder'
import { useFocusTimer } from '@/hooks/useFocusTimer'
import { useWakeLock } from '@/hooks/useWakeLock'
import { playNotificationSound } from '@/utils/notifications'

interface FocusModeWidgetProps {
  userId: string
  linkedTaskId?: string
}

export function FocusModeWidget({ userId, linkedTaskId }: FocusModeWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showBreakReminder, setShowBreakReminder] = useState(false)
  const [breakType, setBreakType] = useState<'short-break' | 'long-break'>('short-break')
  const prevTimeRemaining = useRef<number | null>(null)

  const {
    isActive,
    isPaused,
    timeRemaining,
    formattedTime,
    progress,
    currentSession,
    sessionCount,
    settings,
    startFocus,
    startBreak,
    pauseFocus,
    resumeFocus,
    stopFocus,
  } = useFocusTimer(userId)

  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock()

  useEffect(() => {
    if (isActive && !isPaused) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }
  }, [isActive, isPaused, requestWakeLock, releaseWakeLock])

  useEffect(() => {
    if (
      prevTimeRemaining.current !== null &&
      prevTimeRemaining.current > 0 &&
      timeRemaining === 0 &&
      currentSession?.type === 'focus'
    ) {
      if (settings?.soundEnabled) {
        playNotificationSound()
      }
      const nextBreak =
        sessionCount > 0 && sessionCount % (settings?.sessionsUntilLongBreak || 4) === 0
          ? 'long-break'
          : 'short-break'
      setBreakType(nextBreak)
      setShowBreakReminder(true)
    }
    prevTimeRemaining.current = timeRemaining
  }, [timeRemaining, currentSession, sessionCount, settings])

  const handleStartBreak = () => {
    setShowBreakReminder(false)
    startBreak(breakType)
  }

  const handleSkipBreak = () => {
    setShowBreakReminder(false)
    startFocus(linkedTaskId)
  }

  const handleDismissBreakReminder = () => {
    setShowBreakReminder(false)
  }

  const handleStartFocus = (taskId?: string) => {
    startFocus(taskId ?? linkedTaskId)
  }

  return (
    <>
      <div
        className={clsx(
          'fixed bottom-4 right-4 z-40',
          'bg-white dark:bg-gray-800',
          'rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700',
          'transition-all duration-300'
        )}
      >
        {isExpanded ? (
          <div className="relative w-80">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">Focus Mode</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                    'hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  aria-label="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                    'hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  aria-label="Collapse"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            <PomodoroTimer
              isActive={isActive}
              isPaused={isPaused}
              timeRemaining={timeRemaining}
              formattedTime={formattedTime}
              progress={progress}
              currentSession={currentSession}
              sessionCount={sessionCount}
              startFocus={handleStartFocus}
              pauseFocus={pauseFocus}
              resumeFocus={resumeFocus}
              stopFocus={stopFocus}
            />
          </div>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className={clsx(
              'flex items-center gap-3 px-4 py-3',
              'text-gray-900 dark:text-white',
              'hover:bg-gray-50 dark:hover:bg-gray-750',
              'transition-colors rounded-2xl'
            )}
            aria-label="Expand focus timer"
          >
            <Timer
              className={clsx('w-5 h-5', isActive ? 'text-blue-500' : 'text-gray-500')}
            />
            <span
              className={clsx(
                'font-mono text-lg font-semibold',
                isActive && !isPaused && 'text-blue-600 dark:text-blue-400'
              )}
            >
              {formattedTime}
            </span>
            <ChevronUp className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <FocusSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <BreakReminder
        isVisible={showBreakReminder}
        breakType={breakType}
        onStartBreak={handleStartBreak}
        onSkip={handleSkipBreak}
        onDismiss={handleDismissBreakReminder}
      />
    </>
  )
}
