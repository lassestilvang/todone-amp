import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import type { Task } from '@/types'

export interface MobileCalendarViewProps {
  projectId?: string
  sectionId?: string
}

type ViewMode = 'day' | 'week'

export const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({
  projectId,
  sectionId,
}) => {
  const { tasks } = useTaskStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')

  // Filter tasks for this project/section
  const filteredTasks = useMemo(
    () =>
      tasks.filter((t) => {
        if (projectId && t.projectId !== projectId) return false
        if (sectionId && t.sectionId !== sectionId) return false
        return t.dueDate
      }),
    [tasks, projectId, sectionId]
  )

  // Get tasks for selected date
  const tasksForDate = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    return filteredTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] === dateStr
    )
  }, [filteredTasks, selectedDate])

  // Get week dates
  const weekDates = useMemo(() => {
    const dates = []
    const firstDay = new Date(selectedDate)
    firstDay.setDate(firstDay.getDate() - firstDay.getDay())

    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDay)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [selectedDate])

  // Get tasks for week
  const weekTasks = useMemo(() => {
    const weekMap = new Map<string, Task[]>()

    weekDates.forEach((date) => {
      const dateStr = date.toISOString().split('T')[0]
      weekMap.set(
        dateStr,
        filteredTasks.filter(
          (t) => t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] === dateStr
        )
      )
    })

    return weekMap
  }, [weekDates, filteredTasks])

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    }
    setSelectedDate(newDate)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  return (
    <div className="w-full h-full bg-surface-primary flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-surface-secondary">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('prev')}
            className="p-2 hover:bg-interactive-secondary rounded-lg transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-content-secondary" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-semantic-info" />
            <h2 className="text-lg font-semibold text-content-primary">
              {selectedDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}
            </h2>
          </div>

          <button
            onClick={() => navigate('next')}
            className="p-2 hover:bg-interactive-secondary rounded-lg transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-content-secondary" />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          {(['day', 'week'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                viewMode === mode
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-interactive-secondary text-content-secondary'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'day' ? (
          // Day View
          <div className="p-4 space-y-2">
            {tasksForDate.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-center text-content-tertiary">
                  No tasks for this day
                </p>
              </div>
            ) : (
              tasksForDate.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-surface-secondary rounded-lg border border-border"
                >
                  <p className="font-medium text-content-primary text-sm">
                    {task.content}
                  </p>
                  {task.dueTime && (
                    <p className="text-xs text-content-tertiary mt-1">
                      🕐 {task.dueTime}
                    </p>
                  )}
                  {task.priority && (
                    <div className="mt-2">
                      <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          // Week View
          <div className="p-4 space-y-3">
            {weekDates.map((date) => {
              const dateStr = date.toISOString().split('T')[0]
              const dayTasks = weekTasks.get(dateStr) || []
              const dateTasksCount = dayTasks.length

              return (
                <div key={dateStr}>
                  {/* Day Header */}
                  <button
                    onClick={() => {
                      setSelectedDate(date)
                      setViewMode('day')
                    }}
                    className={`w-full px-3 py-2 rounded-lg font-medium text-sm mb-2 transition-colors ${
                      isSelected(date)
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : isToday(date)
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100'
                          : 'bg-surface-tertiary text-content-secondary'
                    }`}
                  >
                    {date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {dateTasksCount > 0 && <span className="ml-2">({dateTasksCount})</span>}
                  </button>

                  {/* Tasks for this day */}
                  {dateTasksCount > 0 && (
                    <div className="space-y-1 mb-2 pl-2">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="text-xs text-content-secondary">
                          • {task.content.substring(0, 50)}
                          {task.content.length > 50 ? '...' : ''}
                        </div>
                      ))}
                      {dateTasksCount > 3 && (
                        <div className="text-xs text-content-tertiary font-medium">
                          +{dateTasksCount - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
