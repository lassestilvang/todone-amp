import React from 'react'
import { Task } from '@/types'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  selectedTaskId?: string | null
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  isLoading?: boolean
  emptyMessage?: string
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTaskId,
  onToggle,
  onSelect,
  isLoading,
  emptyMessage = 'No tasks yet',
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200 border-y border-gray-200">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onSelect={onSelect}
          isSelected={selectedTaskId === task.id}
        />
      ))}
    </div>
  )
}
