import React, { useEffect } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { TaskList } from '@/components/TaskList'
import { Plus } from 'lucide-react'

export const InboxView: React.FC = () => {
  const tasks = useTaskStore((state) => state.getFilteredTasks())
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const selectTask = useTaskStore((state) => state.selectTask)
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
  const loadTasks = useTaskStore((state) => state.loadTasks)
  const setFilter = useTaskStore((state) => state.setFilter)

  useEffect(() => {
    loadTasks()
    setFilter({ completed: false })
  }, [])

  const inboxTasks = tasks.filter((t) => !t.projectId)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Inbox</h2>
        <p className="text-sm text-gray-500 mt-1">Quick processing area for new tasks</p>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        <TaskList
          tasks={inboxTasks}
          selectedTaskId={selectedTaskId}
          onToggle={toggleTask}
          onSelect={selectTask}
          emptyMessage="No tasks in inbox"
        />
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
