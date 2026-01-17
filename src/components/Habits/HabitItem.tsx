import React from 'react'
import { Flame, Check, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import type { Habit } from '@/types'
import { useHabitStore } from '@/store/habitStore'

interface HabitItemProps {
  habit: Habit
  onClick?: () => void
}

export const HabitItem: React.FC<HabitItemProps> = ({ habit, onClick }) => {
  const logCompletion = useHabitStore((state) => state.logCompletion)
  const removeCompletion = useHabitStore((state) => state.removeCompletion)
  const getTodayCompletionCount = useHabitStore((state) => state.getTodayCompletionCount)
  const getStreak = useHabitStore((state) => state.getStreak)
  const isHabitDueToday = useHabitStore((state) => state.isHabitDueToday)

  const today = new Date().toISOString().split('T')[0]
  const completionCount = getTodayCompletionCount(habit.id)
  const streak = getStreak(habit.id)
  const isDueToday = isHabitDueToday(habit)
  const isCompleted = completionCount >= habit.targetCount

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCompleted) {
      await removeCompletion(habit.id, today)
    } else {
      await logCompletion(habit.id, today)
    }
  }

  const handleIncrement = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await logCompletion(habit.id, today)
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
        'bg-surface-primary border-border',
        !isDueToday && 'opacity-60'
      )}
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg text-xl"
        style={{ backgroundColor: `${habit.color}20` }}
      >
        {habit.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-content-primary truncate">{habit.name}</h3>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-sm text-icon-orange">
              <Flame className="w-4 h-4" />
              {streak}
            </span>
          )}
        </div>
        {habit.description && (
          <p className="text-sm text-content-tertiary truncate">{habit.description}</p>
        )}
        {!isDueToday && (
          <p className="text-xs text-content-tertiary">Not scheduled for today</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {habit.targetCount > 1 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-content-secondary">
              {completionCount}/{habit.targetCount}
            </span>
            <button
              onClick={handleIncrement}
              disabled={!isDueToday}
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isDueToday
                    ? 'bg-surface-secondary hover:bg-surface-tertiary text-content-secondary'
                    : 'bg-surface-secondary text-content-tertiary cursor-not-allowed'
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : '+'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleToggle}
            disabled={!isDueToday}
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center transition-colors border-2',
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : isDueToday
                  ? 'border-border hover:border-brand-500'
                  : 'border-border cursor-not-allowed'
            )}
          >
            {isCompleted && <Check className="w-4 h-4" />}
          </button>
        )}

        <ChevronRight className="w-5 h-5 text-content-tertiary" />
      </div>
    </div>
  )
}
