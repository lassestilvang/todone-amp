import React, { useEffect, useMemo, useState } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useFilterStore } from '@/store/filterStore'
import { useQuickAddStore } from '@/store/quickAddStore'
import { useAuthStore } from '@/store/authStore'
import { useIntegrationStore } from '@/store/integrationStore'
import { VirtualTaskList } from '@/components/VirtualTaskList'
import { ViewSwitcher } from '@/components/ViewSwitcher'
import { ExternalCalendarEvents } from '@/components/ExternalCalendarEvents'
import { isAfter, startOfDay, endOfDay, addDays } from 'date-fns'
import { Plus, Filter, Calendar } from 'lucide-react'
import { FilterPanel } from '@/components/FilterPanel'

export const UpcomingView: React.FC = () => {
  const tasks = useTaskStore((state) => state.getFilteredTasks())
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const selectTask = useTaskStore((state) => state.selectTask)
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
  const loadTasks = useTaskStore((state) => state.loadTasks)
  const applyFilterQuery = useFilterStore((state) => state.applyFilterQuery)
  const openQuickAdd = useQuickAddStore((state) => state.openQuickAdd)
  const user = useAuthStore((state) => state.user)
  const calendarEvents = useIntegrationStore((state) => state.calendarEvents)
  const getCalendarEvents = useIntegrationStore((state) => state.getCalendarEvents)

  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [advancedQuery, setAdvancedQuery] = useState('')
  const [showExternalEvents, setShowExternalEvents] = useState(true)

  useEffect(() => {
    loadTasks()
    if (user?.id) {
      getCalendarEvents(user.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const upcomingTasks = useMemo(() => {
    const now = new Date()
    const weekFromNow = addDays(now, 7)

    return tasks.filter(
      (t) =>
        !t.completed &&
        t.dueDate &&
        isAfter(t.dueDate, startOfDay(now)) &&
        isAfter(endOfDay(weekFromNow), t.dueDate)
    )
  }, [tasks])

  // Apply advanced filter query if set
  const filteredUpcomingTasks = useMemo(() => {
    return advancedQuery ? applyFilterQuery(advancedQuery, upcomingTasks) : upcomingTasks
  }, [upcomingTasks, advancedQuery, applyFilterQuery])

  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof tasks> = {}

    filteredUpcomingTasks.forEach((task) => {
      if (task.dueDate) {
        const dateKey = task.dueDate.toISOString().split('T')[0]
        if (!groups[dateKey]) groups[dateKey] = []
        groups[dateKey].push(task)
      }
    })

    return Object.entries(groups).sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
  }, [filteredUpcomingTasks])

  // Convert CalendarEvent to ExternalEvent format
  const externalEvents = useMemo(() => {
    return calendarEvents.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.startTime,
      end: event.endTime,
      calendar: event.service as 'google' | 'outlook' | 'apple' | 'other',
      description: event.description,
      location: event.location,
      allDay: event.isAllDay,
      color: event.color,
    }))
  }, [calendarEvents])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upcoming</h2>
            <p className="text-sm text-gray-500 mt-1">Next 7 days</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilterPanel(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Show filters"
            >
              <Filter size={20} className="text-gray-600" />
            </button>
            <ViewSwitcher variant="inline" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* External Calendar Events Section */}
        {showExternalEvents && (
          <div className="border-b border-gray-200">
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 font-medium text-sm">
                  <Calendar className="w-4 h-4" />
                  Calendar Events (Next 7 Days)
                </div>
                <button
                  onClick={() => setShowExternalEvents(false)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Hide
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <ExternalCalendarEvents events={externalEvents} dateFilter="thisWeek" maxItems={8} />
            </div>
          </div>
        )}
        
        {groupedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 text-sm">{advancedQuery ? 'No tasks match this filter' : 'No upcoming tasks'}</p>
          </div>
        ) : (
          groupedTasks.map(([dateKey, dateTasks]) => {
            const date = new Date(dateKey + 'T00:00:00')
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date)
            const dayDate = new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
            }).format(date)

            return (
              <div key={dateKey} className="border-b border-gray-200">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    {dayName}, {dayDate}
                  </h3>
                </div>
                <VirtualTaskList
                  tasks={dateTasks}
                  selectedTaskId={selectedTaskId}
                  onToggle={toggleTask}
                  onSelect={selectTask}
                  maxHeight="250px"
                />
              </div>
            )
          })
        )}
      </div>

      {/* Quick Add Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <button 
          onClick={openQuickAdd}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 font-medium hover:bg-white border border-gray-300 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add task
        </button>
      </div>

      {/* Filter Panel */}
      <FilterPanel 
        isOpen={showFilterPanel} 
        onClose={() => setShowFilterPanel(false)}
        onAdvancedQueryChange={setAdvancedQuery}
      />
    </div>
  )
}
