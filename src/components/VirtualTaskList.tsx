import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import type { Task } from '@/types'
import { TaskItem } from './TaskItem'

interface VirtualTaskListProps {
  tasks: Task[]
  selectedTaskId?: string | null
  onToggle: (taskId: string) => void
  onSelect: (taskId: string | null) => void
  emptyMessage?: string
  itemHeight?: number
  containerHeight?: number
  maxHeight?: string | number
}

const DEFAULT_ITEM_HEIGHT = 56 // Approximate height of a TaskItem
const DEFAULT_CONTAINER_HEIGHT = 600

/**
 * Virtual scrolling list component for rendering large task lists efficiently
 * Only renders visible items + buffer, significantly improving performance
 */
export const VirtualTaskList: React.FC<VirtualTaskListProps> = ({
  tasks,
  selectedTaskId,
  onToggle,
  onSelect,
  emptyMessage = 'No tasks',
  itemHeight = DEFAULT_ITEM_HEIGHT,
  containerHeight = DEFAULT_CONTAINER_HEIGHT,
  maxHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeightActual, setContainerHeightActual] = useState(containerHeight)

  // Update container height on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current?.parentElement) {
        setContainerHeightActual(containerRef.current.parentElement.clientHeight)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    setScrollTop(target.scrollTop)
  }, [])

  // Calculate visible range with buffer
  const bufferSize = 5
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize)
  const endIndex = Math.min(
    tasks.length,
    Math.ceil((scrollTop + containerHeightActual) / itemHeight) + bufferSize
  )

  const visibleTasks = useMemo(() => {
    return tasks.slice(startIndex, endIndex)
  }, [tasks, startIndex, endIndex])

  const offsetY = startIndex * itemHeight

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-content-tertiary text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto"
      style={{ 
        height: maxHeight ? 'auto' : containerHeightActual,
        maxHeight: maxHeight,
        minHeight: '100px'
      }}
      onScroll={handleScroll}
      role="list"
      aria-label="Tasks"
    >
      {/* Spacer before visible items */}
      {startIndex > 0 && (
        <div
          style={{ height: offsetY }}
          aria-hidden="true"
          className="pointer-events-none"
        />
      )}

      {/* Visible items */}
      <div className="space-y-2 px-6">
        {visibleTasks.map((task) => (
          <div key={task.id} role="listitem">
            <TaskItem
              task={task}
              isSelected={selectedTaskId === task.id}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>

      {/* Spacer after visible items */}
      {endIndex < tasks.length && (
        <div
          style={{ height: (tasks.length - endIndex) * itemHeight }}
          aria-hidden="true"
          className="pointer-events-none"
        />
      )}

      {/* Performance indicator (debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="fixed bottom-4 right-4 bg-surface-tertiary text-content-secondary text-xs px-3 py-2 rounded opacity-50 pointer-events-none"
          aria-hidden="true"
        >
          Rendering {visibleTasks.length} of {tasks.length}
        </div>
      )}
    </div>
  )
}

export default VirtualTaskList
