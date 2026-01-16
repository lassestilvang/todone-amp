import React, { useEffect, useMemo, useState } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useFilterStore } from '@/store/filterStore'
import { useQuickAddStore } from '@/store/quickAddStore'
import { EisenhowerMatrix, MatrixLegend, QuadrantType } from '@/components/Eisenhower'
import { FilterPanel } from '@/components/FilterPanel'
import { Plus, Filter, Grid3X3, HelpCircle } from 'lucide-react'

export const EisenhowerView: React.FC = () => {
  const tasks = useTaskStore((state) => state.getFilteredTasks())
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const updateTask = useTaskStore((state) => state.updateTask)
  const selectTask = useTaskStore((state) => state.selectTask)
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
  const loadTasks = useTaskStore((state) => state.loadTasks)
  const applyFilterQuery = useFilterStore((state) => state.applyFilterQuery)
  const openQuickAdd = useQuickAddStore((state) => state.openQuickAdd)

  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [advancedQuery, setAdvancedQuery] = useState('')
  const [showLegend, setShowLegend] = useState(true)

  useEffect(() => {
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredTasks = useMemo(() => {
    return advancedQuery ? applyFilterQuery(advancedQuery, tasks) : tasks
  }, [tasks, advancedQuery, applyFilterQuery])

  const incompleteTasks = useMemo(() => {
    return filteredTasks.filter((t) => !t.completed)
  }, [filteredTasks])

  const handleQuadrantChange = async (taskId: string, targetQuadrant: QuadrantType) => {
    const priorityMap: Record<QuadrantType, 'p1' | 'p2' | 'p3' | 'p4'> = {
      'do-first': 'p1',
      schedule: 'p2',
      delegate: 'p3',
      eliminate: 'p4',
    }

    const labelUpdates: Record<QuadrantType, { add?: string[]; remove?: string[] }> = {
      'do-first': { add: ['important'] },
      schedule: { add: ['important'] },
      delegate: { remove: ['important'] },
      eliminate: { remove: ['important'] },
    }

    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newPriority = priorityMap[targetQuadrant]
    const labelOps = labelUpdates[targetQuadrant]
    let newLabels = [...(task.labels || [])]

    if (labelOps.add) {
      labelOps.add.forEach((label) => {
        if (!newLabels.includes(label)) {
          newLabels.push(label)
        }
      })
    }

    if (labelOps.remove) {
      newLabels = newLabels.filter((l) => !labelOps.remove?.includes(l))
    }

    await updateTask(taskId, {
      priority: newPriority,
      labels: newLabels,
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Grid3X3 className="w-6 h-6 text-brand-600" />
            <div>
              <h2 className="text-2xl font-bold text-content-primary">Eisenhower Matrix</h2>
              <p className="text-sm text-content-tertiary mt-1">
                {incompleteTasks.length} task{incompleteTasks.length !== 1 ? 's' : ''} to prioritize
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors"
              title={showLegend ? 'Hide legend' : 'Show legend'}
            >
              <HelpCircle size={20} className="text-content-secondary" />
            </button>
            <button
              onClick={() => setShowFilterPanel(true)}
              className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors"
              title="Show filters"
            >
              <Filter size={20} className="text-content-secondary" />
            </button>
          </div>
        </div>

        {showLegend && (
          <div className="mt-4 p-3 bg-surface-secondary rounded-lg">
            <MatrixLegend />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <EisenhowerMatrix
          tasks={filteredTasks}
          selectedTaskId={selectedTaskId}
          onToggle={toggleTask}
          onSelect={selectTask}
          onQuadrantChange={handleQuadrantChange}
        />
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
