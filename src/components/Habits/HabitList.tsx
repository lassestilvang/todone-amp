import React, { useState } from 'react'
import clsx from 'clsx'
import { HabitItem } from './HabitItem'
import type { Habit } from '@/types'

type FilterType = 'all' | 'active' | 'archived'

interface HabitListProps {
  habits: Habit[]
  onSelectHabit: (habit: Habit) => void
}

export const HabitList: React.FC<HabitListProps> = ({ habits, onSelectHabit }) => {
  const [filter, setFilter] = useState<FilterType>('active')

  const filteredHabits = habits.filter((habit) => {
    switch (filter) {
      case 'active':
        return !habit.archivedAt
      case 'archived':
        return !!habit.archivedAt
      case 'all':
      default:
        return true
    }
  })

  const sortedHabits = [...filteredHabits].sort((a, b) => {
    if (a.archivedAt && !b.archivedAt) return 1
    if (!a.archivedAt && b.archivedAt) return -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const filters: { key: FilterType; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'archived', label: 'Archived' },
    { key: 'all', label: 'All' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              filter === key
                ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sortedHabits.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {filter === 'archived'
              ? 'No archived habits'
              : filter === 'active'
                ? 'No active habits. Create one to get started!'
                : 'No habits yet'}
          </div>
        ) : (
          sortedHabits.map((habit) => (
            <HabitItem key={habit.id} habit={habit} onClick={() => onSelectHabit(habit)} />
          ))
        )}
      </div>
    </div>
  )
}
