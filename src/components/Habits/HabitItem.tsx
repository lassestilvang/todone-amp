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
        'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
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
          <h3 className="font-medium text-gray-900 dark:text-white truncate">{habit.name}</h3>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-sm text-orange-500">
              <Flame className="w-4 h-4" />
              {streak}
            </span>
          )}
        </div>
        {habit.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{habit.description}</p>
        )}
        {!isDueToday && (
          <p className="text-xs text-gray-400 dark:text-gray-500">Not scheduled for today</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {habit.targetCount > 1 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
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
                    ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
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
                  ? 'border-gray-300 dark:border-gray-600 hover:border-brand-500 dark:hover:border-brand-400'
                  : 'border-gray-200 dark:border-gray-700 cursor-not-allowed'
            )}
          >
            {isCompleted && <Check className="w-4 h-4" />}
          </button>
        )}

        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  )
}
