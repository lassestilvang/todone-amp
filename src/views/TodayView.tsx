import React, { useEffect, useMemo, useState } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useFilterStore } from '@/store/filterStore'
import { useQuickAddStore } from '@/store/quickAddStore'
import { useAuthStore } from '@/store/authStore'
import { useIntegrationStore } from '@/store/integrationStore'
import { VirtualTaskList } from '@/components/VirtualTaskList'
import { ViewSwitcher } from '@/components/ViewSwitcher'
import { ExternalCalendarEvents } from '@/components/ExternalCalendarEvents'
import { isTaskDueToday, isTaskOverdue } from '@/utils/date'
import { Plus, AlertCircle, Filter, Calendar } from 'lucide-react'
import { FilterPanel } from '@/components/FilterPanel'

export const TodayView: React.FC = () => {
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

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => !t.completed && isTaskDueToday(t.dueDate))
  }, [tasks])

  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => !t.completed && isTaskOverdue(t.dueDate))
  }, [tasks])

  const completedToday = useMemo(() => {
    return tasks.filter((t) => t.completed && t.completedAt && isTaskDueToday(t.completedAt))
  }, [tasks])

  // Apply advanced filter query if set
  const filteredTodayTasks = useMemo(() => {
    return advancedQuery ? applyFilterQuery(advancedQuery, todayTasks) : todayTasks
  }, [todayTasks, advancedQuery, applyFilterQuery])

  const filteredOverdueTasks = useMemo(() => {
    return advancedQuery ? applyFilterQuery(advancedQuery, overdueTasks) : overdueTasks
  }, [overdueTasks, advancedQuery, applyFilterQuery])

  const filteredCompletedToday = useMemo(() => {
    return advancedQuery ? applyFilterQuery(advancedQuery, completedToday) : completedToday
  }, [completedToday, advancedQuery, applyFilterQuery])

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
            <h2 className="text-2xl font-bold text-gray-900">Today</h2>
            <p className="text-sm text-gray-500 mt-1">
              {todayTasks.length} tasks · {completedToday.length} completed
            </p>
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
                  Calendar Events
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
              <ExternalCalendarEvents events={externalEvents} dateFilter="today" maxItems={5} />
            </div>
          </div>
        )}
        
        {/* Overdue Section */}
        {filteredOverdueTasks.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="px-6 py-3 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                <AlertCircle className="w-4 h-4" />
                {filteredOverdueTasks.length} overdue task{filteredOverdueTasks.length !== 1 ? 's' : ''}
              </div>
            </div>
            <VirtualTaskList
              tasks={filteredOverdueTasks}
              selectedTaskId={selectedTaskId}
              onToggle={toggleTask}
              onSelect={selectTask}
              maxHeight="300px"
            />
          </div>
        )}

        {/* Today's Tasks */}
        <div>
          <div className="px-6 py-3 bg-gray-50 font-medium text-sm text-gray-700 border-b border-gray-200">
            Today ({filteredTodayTasks.length})
          </div>
          <VirtualTaskList
            tasks={filteredTodayTasks}
            selectedTaskId={selectedTaskId}
            onToggle={toggleTask}
            onSelect={selectTask}
            emptyMessage={advancedQuery ? 'No tasks match this filter' : (filteredOverdueTasks.length > 0 ? 'No tasks for today' : 'No tasks yet')}
            maxHeight="400px"
          />
        </div>

        {/* Completed Today */}
        {filteredCompletedToday.length > 0 && (
          <div className="border-t border-gray-200">
            <div className="px-6 py-3 bg-gray-50 font-medium text-sm text-gray-700 border-b border-gray-200">
              Completed ({filteredCompletedToday.length})
            </div>
            <VirtualTaskList
              tasks={filteredCompletedToday}
              selectedTaskId={selectedTaskId}
              onToggle={toggleTask}
              onSelect={selectTask}
              maxHeight="300px"
            />
          </div>
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
