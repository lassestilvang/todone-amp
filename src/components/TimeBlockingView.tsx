import { useMemo, useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { useTaskDetailStore } from '@/store/taskDetailStore'
import { cn } from '@/utils/cn'
import { format, isToday, isSameDay } from 'date-fns'
import type { Task } from '@/types'

interface TimeBlockingViewProps {
  selectedDate: Date
}

interface TimeBlock {
  hour: number
  tasks: Task[]
  isCurrentHour: boolean
}

export function TimeBlockingView({ selectedDate }: TimeBlockingViewProps) {
  const tasks = useTaskStore((state) => state.tasks)
  const { openTaskDetail } = useTaskDetailStore()

  const timeBlocks = useMemo(() => {
    const blocksList: TimeBlock[] = []
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const now = new Date()
    const currentHour = now.getHours()

    // Filter tasks for the selected date
    const dayTasks = tasks.filter((task) => {
      if (!task.dueDate || task.completed || task.parentTaskId) return false
      const taskDate = new Date(task.dueDate)
      return isSameDay(taskDate, selectedDate)
    })

    // Separate all-day and timed tasks
    const timedTasks: Task[] = []
    const allDayTasks: Task[] = []

    dayTasks.forEach((task) => {
      if (task.dueTime) {
        timedTasks.push(task)
      } else {
        allDayTasks.push(task)
      }
    })

    // Build time blocks
    hours.forEach((hour) => {
      const hourTasks = timedTasks.filter((task) => {
        if (!task.dueTime) return false
        const [taskHour] = task.dueTime.split(':').map(Number)
        return taskHour === hour
      })

      blocksList.push({
        hour,
        tasks: hourTasks,
        isCurrentHour: isToday(selectedDate) && hour === currentHour,
      })
    })

    return {
      blocks: blocksList,
      allDayTasks,
    }
  }, [tasks, selectedDate])

  // Auto-scroll to current hour on mount
  const handleAutoScroll = () => {
    const now = new Date()
    if (isToday(selectedDate)) {
      const scrollElement = document.querySelector('[data-scroll-container]')
      if (scrollElement) {
        const currentHour = now.getHours()
        scrollElement.scrollTop = currentHour * 64 // 64px per hour row
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>
        {isToday(selectedDate) && (
          <button
            onClick={handleAutoScroll}
            className="text-xs px-3 py-1 bg-brand-50 text-brand-700 rounded-full hover:bg-brand-100 transition-colors"
          >
            Jump to now
          </button>
        )}
      </div>

      {/* All-day tasks section */}
      {timeBlocks.allDayTasks.length > 0 && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-3">ALL-DAY TASKS</p>
          <div className="space-y-2">
            {timeBlocks.allDayTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => openTaskDetail(task.id, task)}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-left text-sm font-medium transition-all hover:opacity-80',
                  {
                    'bg-red-100 text-red-900': task.priority === 'p1',
                    'bg-orange-100 text-orange-900': task.priority === 'p2',
                    'bg-blue-100 text-blue-900': task.priority === 'p3',
                    'bg-gray-100 text-gray-900': !task.priority || task.priority === 'p4',
                  }
                )}
              >
                {task.content}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Time blocks */}
      <div className="flex-1 overflow-y-auto relative" data-scroll-container>
        {/* Current time indicator */}
        {isToday(selectedDate) && (
          <CurrentTimeIndicator />
        )}

        <div className="grid grid-cols-[80px_1fr] gap-px bg-gray-200">
          {/* Time column */}
          <div className="bg-white sticky left-0 z-10 border-r border-gray-200">
            {timeBlocks.blocks.map((block) => (
              <TimeSlot key={`time-${block.hour}`} hour={block.hour} />
            ))}
          </div>

          {/* Tasks column */}
          <div className="bg-white">
            {timeBlocks.blocks.map((block) => (
              <div
                key={`block-${block.hour}`}
                className={cn(
                  'h-16 px-2 py-1 border-b border-gray-100 relative',
                  block.isCurrentHour && 'bg-blue-50 border-b-2 border-blue-200'
                )}
              >
                {block.tasks.length > 0 ? (
                  <div className="space-y-1">
                    {block.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => openTaskDetail(task.id, task)}
                        className={cn(
                          'w-full px-2 py-1 rounded text-xs font-medium text-left line-clamp-2 transition-all hover:opacity-80',
                          {
                            'bg-red-100 text-red-900': task.priority === 'p1',
                            'bg-orange-100 text-orange-900': task.priority === 'p2',
                            'bg-blue-100 text-blue-900': task.priority === 'p3',
                            'bg-gray-100 text-gray-900': !task.priority || task.priority === 'p4',
                          }
                        )}
                        title={task.content}
                      >
                        {task.dueTime && <span className="font-bold">{task.dueTime} </span>}
                        {task.content}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center">
                    <div className="text-xs text-gray-300">-</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface TimeSlotProps {
  hour: number
}

function TimeSlot({ hour }: TimeSlotProps) {
  const formatTime = (h: number): string => {
    return `${h === 0 ? '12' : h > 12 ? h - 12 : h}:00 ${h < 12 ? 'AM' : 'PM'}`
  }

  return (
    <div className="h-16 px-2 py-1 text-xs font-medium text-gray-600 text-right border-b border-gray-100 flex items-start justify-end pr-1">
      {formatTime(hour)}
    </div>
  )
}

function CurrentTimeIndicator() {
  const [position, setPosition] = useState(() => {
    const now = new Date()
    return (now.getHours() + now.getMinutes() / 60) * 64 // 64px per hour
  })

  // Update position every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setPosition((now.getHours() + now.getMinutes() / 60) * 64)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="absolute left-0 right-0 h-1 bg-red-500 z-20 pointer-events-none transition-all"
      style={{ top: `${position}px` }}
    >
      <div className="absolute -left-2 -top-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md" />
      <div className="absolute left-20 -top-2 text-xs font-bold text-red-500 bg-white px-2 rounded">
        Now
      </div>
    </div>
  )
}
