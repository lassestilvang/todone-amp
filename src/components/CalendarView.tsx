import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { useTaskDetailStore } from '@/store/taskDetailStore'
import { cn } from '@/utils/cn'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import type { Task } from '@/types'

type CalendarViewType = 'month' | 'week'

interface DayTasksMap {
  [key: string]: Task[]
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<CalendarViewType>('month')
  const tasks = useTaskStore((state) => state.tasks)
  const { openTaskDetail } = useTaskDetailStore()

  // Build a map of tasks by due date
  const tasksByDate = useMemo(() => {
    const map: DayTasksMap = {}
    tasks.forEach((task) => {
      if (task.dueDate && !task.completed && !task.parentTaskId) {
        const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd')
        if (!map[dateKey]) {
          map[dateKey] = []
        }
        map[dateKey].push(task)
      }
    })
    return map
  }, [tasks])

  const handlePrevMonth = () => {
    setCurrentDate((prev) => addMonths(prev, -1))
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon size={24} className="text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* View Type Switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewType('month')}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-all',
                  viewType === 'month'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                )}
              >
                Month
              </button>
              <button
                onClick={() => setViewType('week')}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-all',
                  viewType === 'week'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                )}
              >
                Week
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Previous"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>

              <button
                onClick={handleToday}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>

              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Next"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Month/Year Display */}
        <p className="text-sm text-gray-500 mt-3">{format(currentDate, 'MMMM yyyy')}</p>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto">
        {viewType === 'month' ? (
          <MonthView currentDate={currentDate} tasksByDate={tasksByDate} onTaskClick={openTaskDetail} />
        ) : (
          <WeekView currentDate={currentDate} tasksByDate={tasksByDate} onTaskClick={openTaskDetail} />
        )}
      </div>
    </div>
  )
}

interface MonthViewProps {
  currentDate: Date
  tasksByDate: DayTasksMap
  onTaskClick: (taskId: string, task: Task) => void
}

function MonthView({ currentDate, tasksByDate, onTaskClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Group days into weeks
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-gray-50 py-3 text-center text-sm font-semibold text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex-1 grid grid-cols-7 gap-px bg-gray-200">
            {week.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayTasks = tasksByDate[dateKey] || []
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isTodayDate = isToday(day)

              return (
                <div
                  key={dateKey}
                  className={cn(
                    'bg-white p-2 min-h-24 flex flex-col',
                    !isCurrentMonth && 'bg-gray-50',
                    isTodayDate && 'bg-blue-50'
                  )}
                >
                  {/* Day Number */}
                  <div
                    className={cn(
                      'text-sm font-semibold mb-1',
                      isTodayDate && 'text-blue-600',
                      !isCurrentMonth && 'text-gray-400',
                      isCurrentMonth && 'text-gray-900'
                    )}
                  >
                    {format(day, 'd')}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1 flex-1 overflow-y-auto">
                    {dayTasks.slice(0, 3).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick(task.id, task)}
                        className={cn(
                          'w-full text-xs p-1 rounded text-left hover:opacity-80 transition-opacity line-clamp-1 font-medium',
                          {
                            'bg-red-100 text-red-800': task.priority === 'p1',
                            'bg-orange-100 text-orange-800': task.priority === 'p2',
                            'bg-blue-100 text-blue-800': task.priority === 'p3',
                            'bg-gray-100 text-gray-800': !task.priority || task.priority === 'p4',
                          }
                        )}
                        title={task.content}
                      >
                        {task.content}
                      </button>
                    ))}

                    {/* More Tasks Indicator */}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 px-1">+{dayTasks.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

interface WeekViewProps {
  currentDate: Date
  tasksByDate: DayTasksMap
  onTaskClick: (taskId: string, task: Task) => void
}

function WeekView({ currentDate, tasksByDate, onTaskClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="flex flex-col h-full">
      {/* Day Headers */}
      <div className="grid grid-cols-8 gap-px bg-gray-200 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="bg-gray-50 py-2 px-2 text-center text-xs font-semibold text-gray-600">Time</div>
        {days.map((day) => (
          <div key={format(day, 'yyyy-MM-dd')} className="bg-gray-50 py-2 px-2 text-center">
            <div className="text-xs font-semibold text-gray-700">{format(day, 'EEE')}</div>
            <div className={cn('text-lg font-bold', isToday(day) && 'text-blue-600')}>
              {format(day, 'd')}
            </div>
            <div className="text-xs text-gray-500">{format(day, 'MMM')}</div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 gap-px bg-gray-200 auto-rows-min">
          {/* Time Column */}
          <div className="bg-white border-r border-gray-200 sticky left-0 z-10">
            {hours.map((hour) => (
              <div key={hour} className="h-16 py-1 px-2 text-xs text-gray-500 border-b border-gray-100">
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayTasks = tasksByDate[dateKey] || []

            return (
              <div
                key={dateKey}
                className={cn('bg-white border-r border-gray-200', isToday(day) && 'bg-blue-50')}
              >
                {hours.map((hour) => (
                  <div key={`${dateKey}-${hour}`} className="h-16 border-b border-gray-100 p-1 relative">
                    {/* Show tasks for this hour slot */}
                    {dayTasks.map((task) => {
                      const dueTime = task.dueTime
                      if (!dueTime) return null

                      const [taskHour] = dueTime.split(':').map(Number)
                      if (taskHour === hour) {
                        return (
                          <button
                            key={task.id}
                            onClick={() => onTaskClick(task.id, task)}
                            className={cn(
                              'w-full text-xs p-1 rounded text-left hover:opacity-80 transition-opacity line-clamp-1 font-medium',
                              {
                                'bg-red-100 text-red-800': task.priority === 'p1',
                                'bg-orange-100 text-orange-800': task.priority === 'p2',
                                'bg-blue-100 text-blue-800': task.priority === 'p3',
                                'bg-gray-100 text-gray-800': !task.priority || task.priority === 'p4',
                              }
                            )}
                            title={task.content}
                          >
                            {task.content}
                          </button>
                        )
                      }
                      return null
                    })}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
