import React, { useMemo, useRef, useCallback, useState } from 'react'
import { Task } from '@/types'
import { cn } from '@/utils/cn'

interface VirtualizedTaskListProps {
  tasks: Task[]
  renderTask: (task: Task, index: number) => React.ReactNode
  itemHeight?: number
  containerHeight?: number
  overscan?: number
  className?: string
}

/**
 * Virtualized task list for efficient rendering of large lists (1000+ items)
 * Only renders visible items + overscan buffer to improve performance
 */
export const VirtualizedTaskList: React.FC<VirtualizedTaskListProps> = ({
  tasks,
  renderTask,
  itemHeight = 60,
  containerHeight = 600,
  overscan = 5,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(tasks.length, startIndex + visibleCount + overscan * 2)

    return { startIndex, endIndex, visibleCount }
  }, [scrollTop, containerHeight, itemHeight, overscan, tasks.length])

  const visibleItems = useMemo(() => {
    return tasks.slice(visibleRange.startIndex, visibleRange.endIndex)
  }, [tasks, visibleRange])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const offsetY = visibleRange.startIndex * itemHeight

  if (tasks.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height: containerHeight }}>
        <p className="text-gray-500 dark:text-gray-400">No tasks to display</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('overflow-y-auto overflow-x-hidden', className)}
      style={{ height: containerHeight }}
    >
      {/* Virtual spacer before visible items */}
      {visibleRange.startIndex > 0 && (
        <div style={{ height: offsetY, pointerEvents: 'none' }} />
      )}

      {/* Visible items */}
      <div>
        {visibleItems.map((task, index) => (
          <div key={task.id} style={{ height: itemHeight }}>
            {renderTask(task, visibleRange.startIndex + index)}
          </div>
        ))}
      </div>

      {/* Virtual spacer after visible items */}
      {visibleRange.endIndex < tasks.length && (
        <div
          style={{
            height: (tasks.length - visibleRange.endIndex) * itemHeight,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
