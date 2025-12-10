import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { useTaskDetailStore } from '@/store/taskDetailStore'
import { Button } from '@/components/Button'
import { cn } from '@/utils/cn'
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval, addDays, startOfDay, isToday } from 'date-fns'
import type { Task } from '@/types'

interface DayColumn {
  date: Date
  dateStr: string
  dayName: string
  isToday: boolean
  tasks: Task[]
  completed: number
}

export function WeeklyAgendaView() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()))
  const tasks = useTaskStore((state) => state.tasks)
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const { openTaskDetail } = useTaskDetailStore()

  const weekDays = useMemo(() => {
    const start = weekStart
    const end = endOfWeek(start)
    return eachDayOfInterval({ start, end })
  }, [weekStart])

  // Build day columns
  const dayColumns: DayColumn[] = useMemo(() => {
    return weekDays.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayStart = startOfDay(date)
      const dayEnd = new Date(dayStart.getTime() + 86400000)

      const dayTasks = tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) >= dayStart && new Date(t.dueDate) < dayEnd && !t.parentTaskId
      )

      return {
        date,
        dateStr,
        dayName: format(date, 'EEE'),
        isToday: isToday(date),
        tasks: dayTasks.filter((t) => !t.completed),
        completed: dayTasks.filter((t) => t.completed).length,
      }
    })
  }, [weekDays, tasks])

  const handlePrevWeek = () => {
    setWeekStart((prev) => addWeeks(prev, -1))
  }

  const handleNextWeek = () => {
    setWeekStart((prev) => addWeeks(prev, 1))
  }

  const handleThisWeek = () => {
    setWeekStart(startOfWeek(new Date()))
  }

  const totalTasks = dayColumns.reduce((sum, day) => sum + day.tasks.length + day.completed, 0)
  const totalCompleted = dayColumns.reduce((sum, day) => sum + day.completed, 0)
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Weekly Agenda</h1>
          <Button variant="primary" size="sm" onClick={handleThisWeek}>
            This Week
          </Button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handlePrevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </div>
            <div className="text-sm text-gray-600">
              {totalTasks} total tasks, {completionRate}% done
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 gap-1 p-4 min-h-full">
          {dayColumns.map((day) => (
            <div
              key={day.dateStr}
              className={cn(
                'flex flex-col border rounded-lg overflow-hidden',
                day.isToday ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'
              )}
            >
              {/* Day Header */}
              <div
                className={cn(
                  'px-3 py-2 border-b text-center',
                  day.isToday ? 'bg-brand-100 border-brand-200' : 'bg-gray-50 border-gray-100'
                )}
              >
                <div className={cn('text-sm font-semibold', day.isToday ? 'text-brand-700' : 'text-gray-700')}>
                  {day.dayName}
                </div>
                <div className={cn('text-xs', day.isToday ? 'text-brand-600' : 'text-gray-500')}>
                  {format(day.date, 'd')}
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-auto min-h-[200px]">
                {day.tasks.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {day.tasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          'px-2 py-1 text-xs cursor-pointer hover:bg-gray-50 truncate',
                          task.completed && 'line-through text-gray-400'
                        )}
                        onClick={() => openTaskDetail(task.id, task)}
                        title={task.content}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          className="w-3 h-3 mr-1 rounded border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {task.content.substring(0, 20)}
                        {task.content.length > 20 ? '...' : ''}
                      </div>
                    ))}

                    {day.tasks.length > 3 && (
                      <div className="px-2 py-1 text-xs text-gray-500 bg-gray-50">
                        +{day.tasks.length - 3} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2 text-xs text-gray-400 text-center">No tasks</div>
                )}
              </div>

              {/* Footer Stats */}
              {(day.tasks.length > 0 || day.completed > 0) && (
                <div className="px-2 py-1 text-xs text-gray-600 border-t border-gray-100 bg-gray-50">
                  <div className="flex justify-between">
                    <span>{day.tasks.length}</span>
                    <span className="text-green-600">{day.completed} ✓</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            <span className="font-semibold text-gray-900">{totalCompleted}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalTasks}</span> completed
          </div>
          <div className="flex-1 h-2 bg-gray-200 rounded-full ml-4">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
