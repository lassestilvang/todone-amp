import React, { useMemo } from 'react'
import clsx from 'clsx'
import { Flame, Trophy } from 'lucide-react'
import type { Habit, HabitCompletion } from '@/types'
import { useHabitStore } from '@/store/habitStore'

interface HabitStreakCalendarProps {
  habit: Habit
}

const WEEKS_TO_SHOW = 12
const DAYS_TO_SHOW = WEEKS_TO_SHOW * 7

export const HabitStreakCalendar: React.FC<HabitStreakCalendarProps> = ({ habit }) => {
  const getCompletionsForHabit = useHabitStore((state) => state.getCompletionsForHabit)
  const getStreak = useHabitStore((state) => state.getStreak)
  const getBestStreak = useHabitStore((state) => state.getBestStreak)

  const completions = getCompletionsForHabit(habit.id)
  const currentStreak = getStreak(habit.id)
  const bestStreak = getBestStreak(habit.id)

  const completionMap = useMemo(() => {
    const map = new Map<string, HabitCompletion>()
    completions.forEach((c) => map.set(c.date, c))
    return map
  }, [completions])

  const calendarData = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days: { date: Date; dateStr: string }[] = []

    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      days.push({
        date,
        dateStr: date.toISOString().split('T')[0],
      })
    }

    const weeks: { date: Date; dateStr: string }[][] = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    return weeks
  }, [])

  const getIntensity = (dateStr: string): number => {
    const completion = completionMap.get(dateStr)
    if (!completion) return 0
    const ratio = completion.count / habit.targetCount
    if (ratio >= 1) return 4
    if (ratio >= 0.75) return 3
    if (ratio >= 0.5) return 2
    if (ratio > 0) return 1
    return 0
  }

  const getIntensityColor = (intensity: number): string => {
    const baseColor = habit.color
    switch (intensity) {
      case 4:
        return baseColor
      case 3:
        return `${baseColor}cc`
      case 2:
        return `${baseColor}99`
      case 1:
        return `${baseColor}55`
      default:
        return 'transparent'
    }
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = []
    let lastMonth = -1

    calendarData.forEach((week, weekIndex) => {
      const firstDay = week[0]
      const month = firstDay.date.getMonth()
      if (month !== lastMonth) {
        labels.push({
          month: firstDay.date.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex,
        })
        lastMonth = month
      }
    })

    return labels
  }, [calendarData])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-orange-500">
            <Flame className="w-5 h-5" />
            <span className="font-semibold">{currentStreak}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">current</span>
          </div>
          <div className="flex items-center gap-1.5 text-yellow-500">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">{bestStreak}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">best</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex gap-0.5 mb-1 ml-8">
          {monthLabels.map(({ month, weekIndex }) => (
            <div
              key={`${month}-${weekIndex}`}
              className="text-xs text-gray-500 dark:text-gray-400"
              style={{
                position: 'absolute',
                left: `calc(32px + ${weekIndex * 14}px)`,
              }}
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5 mt-5">
          <div className="flex flex-col gap-0.5 text-xs text-gray-500 dark:text-gray-400 pr-2">
            <span className="h-3">Mon</span>
            <span className="h-3"></span>
            <span className="h-3">Wed</span>
            <span className="h-3"></span>
            <span className="h-3">Fri</span>
            <span className="h-3"></span>
            <span className="h-3">Sun</span>
          </div>

          <div className="flex gap-0.5">
            {calendarData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {week.map(({ date, dateStr }) => {
                  const intensity = getIntensity(dateStr)
                  const completion = completionMap.get(dateStr)

                  return (
                    <div
                      key={dateStr}
                      className={clsx(
                        'w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125',
                        intensity === 0 && 'bg-gray-100 dark:bg-gray-700'
                      )}
                      style={{
                        backgroundColor: intensity > 0 ? getIntensityColor(intensity) : undefined,
                      }}
                      title={`${formatDate(date)}: ${completion ? `${completion.count}/${habit.targetCount}` : 'No completion'}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700" />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: `${habit.color}55` }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: `${habit.color}99` }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: `${habit.color}cc` }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color }} />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
