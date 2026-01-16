import React from 'react'
import { Task } from '@/types'
import { TaskItem } from './TaskItem'
import { DroppableTaskList } from './DroppableTaskList'

interface TaskListProps {
  tasks: Task[]
  selectedTaskId?: string | null
  onToggle?: (id: string) => void
  onSelect?: (id: string) => void
  isLoading?: boolean
  emptyMessage?: string
  isDraggable?: boolean
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTaskId,
  onToggle,
  onSelect,
  isLoading,
  emptyMessage = 'No tasks yet',
  isDraggable = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-interactive-secondary rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-content-tertiary text-sm">{emptyMessage}</p>
      </div>
    )
  }

  // If draggable, use DroppableTaskList
  if (isDraggable) {
    return (
      <DroppableTaskList
        tasks={tasks}
        droppableId="task-list"
        selectedTaskId={selectedTaskId}
        onToggle={onToggle}
        onSelect={onSelect}
        emptyMessage={emptyMessage}
        className="divide-y divide-border border-y border-border"
      />
    )
  }

  // Otherwise use regular TaskItem list
  return (
    <div className="divide-y divide-border border-y border-border">
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
