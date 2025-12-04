import React, { useEffect, useMemo, useState } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useFilterStore } from '@/store/filterStore'
import { TaskList } from '@/components/TaskList'
import { ViewSwitcher } from '@/components/ViewSwitcher'
import { isTaskDueToday, isTaskOverdue } from '@/utils/date'
import { Plus, AlertCircle, Filter } from 'lucide-react'
import { FilterPanel } from '@/components/FilterPanel'

export const TodayView: React.FC = () => {
  const tasks = useTaskStore((state) => state.getFilteredTasks())
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const selectTask = useTaskStore((state) => state.selectTask)
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
  const loadTasks = useTaskStore((state) => state.loadTasks)
  const applyFilterQuery = useFilterStore((state) => state.applyFilterQuery)

  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [advancedQuery, setAdvancedQuery] = useState('')

  useEffect(() => {
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        {/* Overdue Section */}
        {filteredOverdueTasks.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="px-6 py-3 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                <AlertCircle className="w-4 h-4" />
                {filteredOverdueTasks.length} overdue task{filteredOverdueTasks.length !== 1 ? 's' : ''}
              </div>
            </div>
            <TaskList
              tasks={filteredOverdueTasks}
              selectedTaskId={selectedTaskId}
              onToggle={toggleTask}
              onSelect={selectTask}
            />
          </div>
        )}

        {/* Today's Tasks */}
        <div>
          <div className="px-6 py-3 bg-gray-50 font-medium text-sm text-gray-700 border-b border-gray-200">
            Today ({filteredTodayTasks.length})
          </div>
          <TaskList
            tasks={filteredTodayTasks}
            selectedTaskId={selectedTaskId}
            onToggle={toggleTask}
            onSelect={selectTask}
            emptyMessage={advancedQuery ? 'No tasks match this filter' : (filteredOverdueTasks.length > 0 ? 'No tasks for today' : 'No tasks yet')}
          />
        </div>

        {/* Completed Today */}
        {filteredCompletedToday.length > 0 && (
          <div className="border-t border-gray-200">
            <div className="px-6 py-3 bg-gray-50 font-medium text-sm text-gray-700 border-b border-gray-200">
              Completed ({filteredCompletedToday.length})
            </div>
            <TaskList
              tasks={filteredCompletedToday}
              selectedTaskId={selectedTaskId}
              onToggle={toggleTask}
              onSelect={selectTask}
            />
          </div>
        )}
      </div>

      {/* Quick Add Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 font-medium hover:bg-white border border-gray-300 rounded-md transition-colors">
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
