import React, { useEffect, useMemo } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { TaskList } from '@/components/TaskList'
import { isTaskDueToday, isTaskOverdue } from '@/utils/date'
import { Plus, AlertCircle } from 'lucide-react'

export const TodayView: React.FC = () => {
  const tasks = useTaskStore((state) => state.getFilteredTasks())
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const selectTask = useTaskStore((state) => state.selectTask)
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
  const loadTasks = useTaskStore((state) => state.loadTasks)

  useEffect(() => {
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => !t.completed && isTaskDueToday(t.dueDate))
  }, [tasks])

  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => !t.completed && isTaskOverdue(t.dueDate))
  }, [tasks])

  const completedToday = useMemo(() => {
    return tasks.filter((t) => t.completed && t.completedAt && isTaskDueToday(t.completedAt))
  }, [tasks])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Today</h2>
        <p className="text-sm text-gray-500 mt-1">
          {todayTasks.length} tasks · {completedToday.length} completed
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Overdue Section */}
        {overdueTasks.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="px-6 py-3 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                <AlertCircle className="w-4 h-4" />
                {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
              </div>
            </div>
            <TaskList
              tasks={overdueTasks}
              selectedTaskId={selectedTaskId}
              onToggle={toggleTask}
              onSelect={selectTask}
            />
          </div>
        )}

        {/* Today's Tasks */}
        <div>
          <div className="px-6 py-3 bg-gray-50 font-medium text-sm text-gray-700 border-b border-gray-200">
            Today ({todayTasks.length})
          </div>
          <TaskList
            tasks={todayTasks}
            selectedTaskId={selectedTaskId}
            onToggle={toggleTask}
            onSelect={selectTask}
            emptyMessage={overdueTasks.length > 0 ? 'No tasks for today' : 'No tasks yet'}
          />
        </div>

        {/* Completed Today */}
        {completedToday.length > 0 && (
          <div className="border-t border-gray-200">
            <div className="px-6 py-3 bg-gray-50 font-medium text-sm text-gray-700 border-b border-gray-200">
              Completed ({completedToday.length})
            </div>
            <TaskList
              tasks={completedToday}
              selectedTaskId={selectedTaskId}
              onToggle={toggleTask}
              onSelect={selectTask}
            />
          </div>
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
