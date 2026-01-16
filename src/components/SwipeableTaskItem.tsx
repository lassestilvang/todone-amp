import React, { useRef, useState } from 'react'
import { useSwipeGestures } from '@/hooks/useSwipeGestures'
import { TaskItem } from '@/components/TaskItem'
import { Task } from '@/types'
import { CheckCircle2, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SwipeableTaskItemProps {
  task: Task
  onComplete?: () => void
  onDelete?: () => void
  onToggle?: (id: string) => void
  onSelect?: (id: string) => void
  isSelected?: boolean
}

/**
 * Swipeable task item for mobile:
 * - Swipe right: Mark complete
 * - Swipe left: Delete/Archive
 */
export const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({
  task,
  onComplete,
  onDelete,
  onToggle,
  onSelect,
  isSelected = false,
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const swipeRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSwipeRight = () => {
    if (onComplete && !task.completed) {
      onComplete()
      setSwipeOffset(0)
    }
  }

  const handleSwipeLeft = () => {
    if (onDelete) {
      onDelete()
      setSwipeOffset(0)
    }
  }

  const gestureRef = useSwipeGestures({
    onSwipeRight: handleSwipeRight,
    onSwipeLeft: handleSwipeLeft,
    minDistance: 30,
  })

  // Bind gesture ref to container
  React.useImperativeHandle(gestureRef, () => containerRef.current as HTMLDivElement)

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-surface-primary rounded-lg mb-2"
    >
      {/* Swipe background actions */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        {/* Right action - Complete */}
        <div className={cn('flex items-center gap-2', swipeOffset > 20 && 'opacity-100')}>
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-green-600">Complete</span>
        </div>

        {/* Left action - Delete */}
        <div className={cn('flex items-center gap-2', swipeOffset < -20 && 'opacity-100')}>
          <span className="text-sm font-medium text-red-600">Delete</span>
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
      </div>

      {/* Main task item */}
      <div
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 ? 'transform 300ms ease-out' : 'none',
        }}
        className="relative z-10"
      >
        <TaskItem
          task={task}
          onToggle={onToggle}
          onSelect={onSelect}
          isSelected={isSelected}
        />
      </div>

      {/* Touch-optimized hit area for swipe */}
      <div
        ref={swipeRef}
        className="absolute inset-0 md:hidden"
        style={{ touchAction: 'pan-x pan-y' }}
        onTouchStart={(e) => {
          const startX = e.touches[0].clientX
          const handleTouchMove = (moveEvent: TouchEvent) => {
            const currentX = moveEvent.touches[0].clientX
            const offset = currentX - startX
            if (Math.abs(offset) < 150) {
              setSwipeOffset(offset)
            }
          }

          const handleTouchEnd = () => {
            document.removeEventListener('touchmove', handleTouchMove)
            document.removeEventListener('touchend', handleTouchEnd)

            if (swipeOffset > 50) {
              handleSwipeRight()
            } else if (swipeOffset < -50) {
              handleSwipeLeft()
            }
            setSwipeOffset(0)
          }

          document.addEventListener('touchmove', handleTouchMove, { passive: false })
          document.addEventListener('touchend', handleTouchEnd)
        }}
      />
    </div>
  )
}
