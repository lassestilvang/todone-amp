import { useEffect, useRef, useCallback } from 'react'
import { useFocusStore } from '@/store/focusStore'

export function useFocusTimer(userId: string | undefined) {
  const intervalRef = useRef<number | null>(null)

  const {
    isActive,
    isPaused,
    timeRemaining,
    currentSession,
    sessionCount,
    settings,
    tick,
    startFocus,
    startBreak,
    pauseFocus,
    resumeFocus,
    stopFocus,
    skipToBreak,
    recordInterruption,
    initializeSettings,
    completeSession,
  } = useFocusStore()

  useEffect(() => {
    if (userId) {
      initializeSettings(userId)
    }
  }, [userId, initializeSettings])

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        tick()
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, tick])

  const handleStartFocus = useCallback(
    (taskId?: string) => {
      if (userId) {
        startFocus(userId, taskId)
      }
    },
    [userId, startFocus]
  )

  const handleStartBreak = useCallback(
    (type: 'short-break' | 'long-break') => {
      if (userId) {
        startBreak(userId, type)
      }
    },
    [userId, startBreak]
  )

  const handleSkipToBreak = useCallback(() => {
    if (userId) {
      skipToBreak(userId)
    }
  }, [userId, skipToBreak])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const progress = settings
    ? 1 -
      timeRemaining /
        (currentSession?.type === 'focus'
          ? settings.focusDuration
          : currentSession?.type === 'short-break'
            ? settings.shortBreakDuration
            : settings.longBreakDuration)
    : 0

  return {
    isActive,
    isPaused,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    currentSession,
    sessionCount,
    settings,
    progress,
    startFocus: handleStartFocus,
    startBreak: handleStartBreak,
    pauseFocus,
    resumeFocus,
    stopFocus,
    skipToBreak: handleSkipToBreak,
    recordInterruption,
    completeSession,
  }
}
