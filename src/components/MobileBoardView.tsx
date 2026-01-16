import React, { useRef, useEffect, useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import type { Task } from '@/types'

export interface MobileBoardViewProps {
  projectId?: string
  sectionId?: string
}

interface Column {
  id: string
  name: string
  tasks: Task[]
  color?: string
}

export const MobileBoardView: React.FC<MobileBoardViewProps> = ({
  projectId,
  sectionId,
}) => {
  const { tasks } = useTaskStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Group tasks by status (could also be by custom status field)
  const columns: Column[] = useMemo(() => [
    {
      id: 'todo',
      name: 'To Do',
      tasks: tasks
        .filter((t) => {
          if (projectId && t.projectId !== projectId) return false
          if (sectionId && t.sectionId !== sectionId) return false
          return !t.completed
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
      color: 'bg-surface-secondary',
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      tasks: [], // Can be populated if you add status field to tasks
      color: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      id: 'done',
      name: 'Done',
      tasks: tasks
        .filter((t) => {
          if (projectId && t.projectId !== projectId) return false
          if (sectionId && t.sectionId !== sectionId) return false
          return t.completed
        })
        .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
        .slice(0, 10), // Show only recent completed tasks
      color: 'bg-green-50 dark:bg-green-900/30',
    },
  ], [tasks, projectId, sectionId])

  // Check scroll position
  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    )
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [columns])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 320 // Width of column + gap
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-surface-primary">
      {/* Scroll Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gradient-to-r from-surface-primary to-transparent"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-content-secondary" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gradient-to-l from-surface-primary to-transparent"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-content-secondary" />
        </button>
      )}

      {/* Board Columns */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide p-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {columns.map((column) => (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 rounded-lg border border-border overflow-hidden flex flex-col ${column.color}`}
          >
            {/* Column Header */}
            <div className="px-4 py-3 border-b border-border bg-surface-primary">
              <h3 className="font-semibold text-content-primary">
                {column.name}
              </h3>
              <p className="text-xs text-content-tertiary mt-1">
                {column.tasks.length} item{column.tasks.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Tasks */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-96">
              {column.tasks.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-center">
                  <p className="text-sm text-content-tertiary">
                    No tasks
                  </p>
                </div>
              ) : (
                column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-surface-primary rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm font-medium text-content-primary line-clamp-2">
                      {task.content}
                    </p>
                    {task.priority && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-opacity-20 bg-blue-500 text-blue-700 dark:text-blue-300">
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-content-tertiary mt-2">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
