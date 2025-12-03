import React, { useEffect, useMemo } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { TaskList } from '@/components/TaskList'
import { isAfter, startOfDay, endOfDay, addDays } from 'date-fns'
import { Plus } from 'lucide-react'

export const UpcomingView: React.FC = () => {
  const tasks = useTaskStore((state) => state.getFilteredTasks())
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const selectTask = useTaskStore((state) => state.selectTask)
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
  const loadTasks = useTaskStore((state) => state.loadTasks)

  useEffect(() => {
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const upcomingTasks = useMemo(() => {
    const now = new Date()
    const weekFromNow = addDays(now, 7)

    return tasks.filter(
      (t) =>
        !t.completed &&
        t.dueDate &&
        isAfter(t.dueDate, startOfDay(now)) &&
        isAfter(endOfDay(weekFromNow), t.dueDate)
    )
  }, [tasks])

  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof tasks> = {}

    upcomingTasks.forEach((task) => {
      if (task.dueDate) {
        const dateKey = task.dueDate.toISOString().split('T')[0]
        if (!groups[dateKey]) groups[dateKey] = []
        groups[dateKey].push(task)
      }
    })

    return Object.entries(groups).sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
  }, [upcomingTasks])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming</h2>
        <p className="text-sm text-gray-500 mt-1">Next 7 days</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {groupedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 text-sm">No upcoming tasks</p>
          </div>
        ) : (
          groupedTasks.map(([dateKey, dateTasks]) => {
            const date = new Date(dateKey + 'T00:00:00')
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date)
            const dayDate = new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
            }).format(date)

            return (
              <div key={dateKey} className="border-b border-gray-200">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    {dayName}, {dayDate}
                  </h3>
                </div>
                <TaskList
                  tasks={dateTasks}
                  selectedTaskId={selectedTaskId}
                  onToggle={toggleTask}
                  onSelect={selectTask}
                />
              </div>
            )
          })
        )}
      </div>

      {/* Quick Add Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 font-medium hover:bg-white border border-gray-300 rounded-md transition-colors">
          <Plus className="w-4 h-4" />
          Add task
        </button>
      </div>
    </div>
  )
}
