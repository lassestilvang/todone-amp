import React from 'react'
import { Flame, Trophy, Target, Calendar, TrendingUp } from 'lucide-react'
import type { Habit } from '@/types'
import { useHabitStore } from '@/store/habitStore'

interface HabitStatsProps {
  habit: Habit
}

export const HabitStats: React.FC<HabitStatsProps> = ({ habit }) => {
  const getCompletionRate = useHabitStore((state) => state.getCompletionRate)
  const getStreak = useHabitStore((state) => state.getStreak)
  const getBestStreak = useHabitStore((state) => state.getBestStreak)
  const getCompletionsForHabit = useHabitStore((state) => state.getCompletionsForHabit)

  const currentStreak = getStreak(habit.id)
  const bestStreak = getBestStreak(habit.id)
  const rate7 = getCompletionRate(habit.id, 7)
  const rate30 = getCompletionRate(habit.id, 30)
  const rate90 = getCompletionRate(habit.id, 90)

  const completions = getCompletionsForHabit(habit.id)
  const totalCompletions = completions.reduce((sum, c) => sum + c.count, 0)

  const weeksWithData = Math.min(
    12,
    Math.ceil(
      (Date.now() - new Date(habit.createdAt).getTime()) / (7 * 24 * 60 * 60 * 1000)
    )
  )
  const avgPerWeek = weeksWithData > 0 ? Math.round(totalCompletions / weeksWithData * 10) / 10 : 0

  const stats = [
    {
      icon: Flame,
      label: 'Current Streak',
      value: currentStreak,
      unit: currentStreak === 1 ? 'day' : 'days',
      color: 'text-icon-orange',
      bgColor: 'bg-accent-orange-subtle',
    },
    {
      icon: Trophy,
      label: 'Best Streak',
      value: bestStreak,
      unit: bestStreak === 1 ? 'day' : 'days',
      color: 'text-icon-yellow',
      bgColor: 'bg-accent-yellow-subtle',
    },
    {
      icon: Target,
      label: 'Total Completions',
      value: totalCompletions,
      unit: '',
      color: 'text-icon-success',
      bgColor: 'bg-semantic-success-light',
    },
    {
      icon: Calendar,
      label: 'Avg per Week',
      value: avgPerWeek,
      unit: '',
      color: 'text-icon-info',
      bgColor: 'bg-semantic-info-light',
    },
  ]

  return (
    <div className="bg-surface-primary rounded-lg p-4 border border-border">
      <h3 className="text-lg font-semibold text-content-primary mb-4">Statistics</h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(({ icon: Icon, label, value, unit, color, bgColor }) => (
          <div key={label} className={`${bgColor} rounded-lg p-3`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-content-tertiary">{label}</span>
            </div>
            <div className="text-2xl font-bold text-content-primary">
              {value}
              {unit && <span className="text-sm font-normal text-content-tertiary ml-1">{unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-interactive-primary" />
          <span className="text-sm font-medium text-content-secondary">
            Completion Rate
          </span>
        </div>

        <div className="space-y-3">
          <CompletionRateBar label="Last 7 days" rate={rate7} />
          <CompletionRateBar label="Last 30 days" rate={rate30} />
          <CompletionRateBar label="Last 90 days" rate={rate90} />
        </div>
      </div>
    </div>
  )
}

interface CompletionRateBarProps {
  label: string
  rate: number
}

const CompletionRateBar: React.FC<CompletionRateBarProps> = ({ label, rate }) => {
  const getColor = (rate: number): string => {
    if (rate >= 80) return 'bg-semantic-success'
    if (rate >= 60) return 'bg-semantic-warning'
    if (rate >= 40) return 'bg-accent-orange'
    return 'bg-semantic-error'
  }

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-content-tertiary">{label}</span>
        <span className="font-medium text-content-primary">{rate}%</span>
      </div>
      <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor(rate)}`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  )
}
