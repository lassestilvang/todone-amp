import React, { useEffect, useState } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useFilterStore } from '@/store/filterStore'
import { useQuickAddStore } from '@/store/quickAddStore'
import { TaskList } from '@/components/TaskList'
import { ViewSwitcher } from '@/components/ViewSwitcher'
import { ListViewOptions } from '@/components/ListViewOptions'
import { GroupedTaskList } from '@/components/GroupedTaskList'
import { FilterPanel } from '@/components/FilterPanel'
import { Plus, Filter } from 'lucide-react'
import { useViewStore } from '@/store/viewStore'

export const InboxView: React.FC = () => {
  const tasks = useTaskStore((state) => state.getFilteredTasks())
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const selectTask = useTaskStore((state) => state.selectTask)
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
  const loadTasks = useTaskStore((state) => state.loadTasks)
  const setFilter = useTaskStore((state) => state.setFilter)
  const listGroupBy = useViewStore((state) => state.listGroupBy)
  const applyFilterQuery = useFilterStore((state) => state.applyFilterQuery)
  const openQuickAdd = useQuickAddStore((state) => state.openQuickAdd)

  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [advancedQuery, setAdvancedQuery] = useState('')

  useEffect(() => {
    loadTasks()
    setFilter({ completed: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const inboxTasks = tasks.filter((t) => !t.projectId)
  
  // Apply advanced filter query if set
  const filteredInboxTasks = advancedQuery 
    ? applyFilterQuery(advancedQuery, inboxTasks)
    : inboxTasks

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-content-primary">Inbox</h2>
            <p className="text-sm text-content-tertiary mt-1">Quick processing area for new tasks</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilterPanel(true)}
              className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors"
              title="Show filters"
            >
              <Filter size={20} className="text-content-secondary" />
            </button>
            <ViewSwitcher variant="inline" />
          </div>
        </div>
      </div>

      {/* List View Options */}
      {listGroupBy !== 'none' && <ListViewOptions />}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        {listGroupBy === 'none' ? (
          <TaskList
            tasks={filteredInboxTasks}
            selectedTaskId={selectedTaskId}
            onToggle={toggleTask}
            onSelect={selectTask}
            emptyMessage={advancedQuery ? 'No tasks match this filter' : 'No tasks in inbox'}
          />
        ) : (
          <GroupedTaskList
            tasks={filteredInboxTasks}
            selectedTaskId={selectedTaskId}
            onToggle={toggleTask}
            onSelect={selectTask}
          />
        )}
      </div>

      {/* Quick Add Footer */}
      <div className="border-t border-border px-6 py-4 bg-surface-secondary">
        <button 
          onClick={openQuickAdd}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-content-secondary font-medium hover:bg-surface-primary border border-border rounded-md transition-colors"
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
