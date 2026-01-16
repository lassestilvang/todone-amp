import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { useTaskDetailStore } from '@/store/taskDetailStore'
import { TaskItem } from '@/components/TaskItem'
import { Button } from '@/components/Button'
import { format, addDays, startOfDay } from 'date-fns'

export function DailyAgendaView() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const tasks = useTaskStore((state) => state.tasks)
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const { openTaskDetail } = useTaskDetailStore()

  // Get tasks for selected date, grouped by status
  const groupedTasks = useMemo(() => {
    const start = startOfDay(selectedDate)
    const end = new Date(start.getTime() + 86400000) // Next day

    const dateTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) >= start && new Date(t.dueDate) < end && !t.parentTaskId
    )

    return {
      completed: dateTasks.filter((t) => t.completed),
      active: dateTasks.filter((t) => !t.completed),
    }
  }, [selectedDate, tasks])

  const handlePrevDay = () => {
    setSelectedDate((prev) => addDays(prev, -1))
  }

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1))
  }

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  const totalTasks = groupedTasks.active.length + groupedTasks.completed.length
  const completionRate = totalTasks > 0 ? Math.round((groupedTasks.completed.length / totalTasks) * 100) : 0

  return (
    <div className="flex flex-col h-full bg-surface-primary">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-content-primary">Daily Agenda</h1>
          <Button variant="primary" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handlePrevDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <div className="text-lg font-semibold text-content-primary">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="text-sm text-content-secondary">
              {groupedTasks.active.length} tasks, {completionRate}% done
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleNextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto divide-y divide-border">
          {/* Active Tasks */}
          <div>
            <div className="sticky top-0 bg-surface-secondary px-4 py-2 border-b border-border">
              <h2 className="text-sm font-semibold text-content-secondary uppercase tracking-wide">
                {groupedTasks.active.length > 0
                  ? `${groupedTasks.active.length} Active Task${groupedTasks.active.length !== 1 ? 's' : ''}`
                  : 'No active tasks'}
              </h2>
            </div>

            {groupedTasks.active.length > 0 ? (
              <div className="divide-y divide-border">
                {groupedTasks.active.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onSelect={() => openTaskDetail(task.id, task)}
                  />
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-content-tertiary">No tasks scheduled for today</p>
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          {groupedTasks.completed.length > 0 && (
            <div>
              <div className="sticky top-0 bg-surface-secondary px-4 py-2 border-b border-border">
                <h2 className="text-sm font-semibold text-content-secondary uppercase tracking-wide">
                  {groupedTasks.completed.length} Completed
                </h2>
              </div>

              <div className="divide-y divide-border">
                {groupedTasks.completed.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onSelect={() => openTaskDetail(task.id, task)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-border bg-surface-secondary px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="text-content-secondary">
            <span className="font-semibold text-content-primary">{groupedTasks.completed.length}</span> of{' '}
            <span className="font-semibold text-content-primary">{totalTasks}</span> completed
          </div>
          <div className="flex-1 h-2 bg-surface-tertiary rounded-full ml-4">
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
