import React, { useEffect, useCallback } from 'react'
import { Play, Pause, Square, X, Minimize2 } from 'lucide-react'
import clsx from 'clsx'
import { useFocusTimer } from '@/hooks/useFocusTimer'

const SESSION_COLORS: Record<string, string> = {
  focus: 'text-icon-info',
  'short-break': 'text-icon-success',
  'long-break': 'text-icon-purple',
}

interface FocusModeFullscreenProps {
  userId: string
  taskId?: string
  taskTitle?: string
  onExit: () => void
}

export const FocusModeFullscreen: React.FC<FocusModeFullscreenProps> = ({
  userId,
  taskId,
  taskTitle,
  onExit,
}) => {
  const {
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
  } = useFocusTimer(userId)

  const sessionType = currentSession?.type || 'focus'
  const sessionColor = SESSION_COLORS[sessionType] || SESSION_COLORS.focus

  const handlePlayPause = useCallback(() => {
    if (!isActive) {
      startFocus(taskId)
    } else if (isPaused) {
      resumeFocus()
    } else {
      pauseFocus()
    }
  }, [isActive, isPaused, taskId, startFocus, resumeFocus, pauseFocus])

  const handleStop = useCallback(() => {
    stopFocus()
  }, [stopFocus])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit()
      } else if (e.key === ' ') {
        e.preventDefault()
        handlePlayPause()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onExit, handlePlayPause])

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'bg-gray-900 text-white'
      )}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/10 animate-pulse-slow" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-500/10 animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <button
        onClick={onExit}
        className={clsx(
          'absolute top-6 right-6 p-3 rounded-full transition-colors',
          'bg-white/10 hover:bg-white/20',
          'focus:outline-none focus:ring-2 focus:ring-white/50'
        )}
        aria-label="Exit fullscreen"
      >
        <Minimize2 className="w-6 h-6" />
      </button>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {taskTitle && (
          <div className="text-center">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Current Task</p>
            <h2 className="text-xl font-medium text-gray-200 max-w-md truncate">{taskTitle}</h2>
          </div>
        )}

        <div className="flex flex-col items-center">
          <span className={clsx('text-8xl font-bold tracking-tight', sessionColor)}>
            {formattedTime}
          </span>
          <span className="text-lg text-gray-400 mt-2 capitalize">
            {sessionType.replace('-', ' ')}
          </span>
        </div>

        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={clsx('h-full transition-all duration-300 rounded-full', {
              'bg-blue-500': sessionType === 'focus',
              'bg-green-500': sessionType === 'short-break',
              'bg-purple-500': sessionType === 'long-break',
            })}
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={handlePlayPause}
            className={clsx(
              'p-5 rounded-full transition-colors',
              'bg-white/10 hover:bg-white/20',
              'focus:outline-none focus:ring-2 focus:ring-white/50'
            )}
            aria-label={!isActive ? 'Start' : isPaused ? 'Resume' : 'Pause'}
          >
            {!isActive || isPaused ? (
              <Play className="w-8 h-8" />
            ) : (
              <Pause className="w-8 h-8" />
            )}
          </button>

          {isActive && (
            <button
              onClick={handleStop}
              className={clsx(
                'p-5 rounded-full transition-colors',
                'bg-white/10 hover:bg-white/20',
                'focus:outline-none focus:ring-2 focus:ring-white/50'
              )}
              aria-label="Stop"
            >
              <Square className="w-8 h-8" />
            </button>
          )}

          <button
            onClick={onExit}
            className={clsx(
              'p-5 rounded-full transition-colors',
              'bg-white/10 hover:bg-white/20',
              'focus:outline-none focus:ring-2 focus:ring-white/50'
            )}
            aria-label="Exit"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={clsx('w-3 h-3 rounded-full transition-colors', {
                'bg-blue-500': i < sessionCount,
                'bg-white/20': i >= sessionCount,
              })}
            />
          ))}
          <span className="ml-2 text-sm">{sessionCount}/4 sessions</span>
        </div>
      </div>

      <div className="absolute bottom-8 flex items-center gap-6 text-sm text-gray-500">
        <span>
          <kbd className="px-2 py-1 bg-white/10 rounded text-gray-400">Space</kbd> Pause/Play
        </span>
        <span>
          <kbd className="px-2 py-1 bg-white/10 rounded text-gray-400">Esc</kbd> Exit
        </span>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
