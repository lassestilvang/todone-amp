import { useEffect, useState } from 'react'
import { LayoutGrid, Settings } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { useProjectStore } from '@/store/projectStore'
import { useSectionStore } from '@/store/sectionStore'
import { useViewStore, type BoardColumnType } from '@/store/viewStore'
import { BoardColumn } from './BoardColumn'
import type { Task, Section } from '@/types'

interface Column {
  id: string
  title: string
  color: string
  tasks: Task[]
}

interface BoardViewProps {
  projectId?: string
}

export function BoardView({ projectId }: BoardViewProps) {
  const tasks = useTaskStore((state) => state.tasks)
  const { toggleTaskExpanded, expandedTaskIds, updateTask } = useTaskStore()
  const { projects } = useProjectStore()
  const { getSectionsByProject } = useSectionStore()
  const { boardColumnType, setBoardColumnType } = useViewStore()
  const [columns, setColumns] = useState<Column[]>([])
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  // Generate columns based on columnType
  useEffect(() => {
    const visibleTasks = projectId
      ? tasks.filter((t) => t.projectId === projectId && !t.parentTaskId)
      : tasks.filter((t) => !t.parentTaskId)

    let newColumns: Column[] = []

    if (boardColumnType === 'priority') {
      // Group by priority
      const priorities = [
        { id: 'p1', title: 'P1 - Urgent', color: 'red' },
        { id: 'p2', title: 'P2 - High', color: 'orange' },
        { id: 'p3', title: 'P3 - Medium', color: 'blue' },
        { id: 'p4', title: 'P4 - Low', color: 'gray' },
      ]

      newColumns = priorities.map((p) => ({
        id: p.id,
        title: p.title,
        color: p.color,
        tasks: visibleTasks.filter((t) => t.priority === p.id || (p.id === 'p4' && !t.priority)),
      }))
    } else if (boardColumnType === 'section') {
      // Group by section within project
      if (projectId) {
        const sections: Section[] = getSectionsByProject(projectId)

        newColumns = sections.map((section) => ({
          id: section.id,
          title: section.name,
          color: 'gray',
          tasks: visibleTasks.filter((t) => t.sectionId === section.id),
        }))

        // Add "No Section" column
        const unassignedTasks = visibleTasks.filter((t) => !t.sectionId)
        if (unassignedTasks.length > 0 || sections.length === 0) {
          newColumns.push({
            id: 'no-section',
            title: 'No Section',
            color: 'gray',
            tasks: unassignedTasks,
          })
        }
      } else {
        // Show by first project's sections
        const firstProject = projects[0]
        if (firstProject) {
          const sections: Section[] = getSectionsByProject(firstProject.id)
          newColumns = sections.map((section) => ({
            id: section.id,
            title: section.name,
            color: 'gray',
            tasks: visibleTasks.filter((t) => t.projectId === firstProject.id && t.sectionId === section.id),
          }))
        }
      }
    } else if (boardColumnType === 'assignee') {
      // Group by assignee (placeholder for Phase 3)
      newColumns = [
        {
          id: 'unassigned',
          title: 'Unassigned',
          color: 'gray',
          tasks: visibleTasks,
        },
      ]
    }

    setColumns(newColumns)
  }, [tasks, projectId, boardColumnType, projects, getSectionsByProject])

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault()
    if (!draggedTask) return

    // Update task's section or priority based on columnType
    const updates: Partial<Task> = {}

    if (boardColumnType === 'priority') {
      updates.priority = columnId as 'p1' | 'p2' | 'p3' | 'p4'
    } else if (boardColumnType === 'section') {
      if (columnId !== 'no-section') {
        updates.sectionId = columnId
      } else {
        updates.sectionId = undefined
      }
    }

    if (Object.keys(updates).length > 0) {
      await updateTask(draggedTask.id, updates)
    }

    setDraggedTask(null)
  }

  const handleAddTask = (columnId: string) => {
    // Trigger quick add modal with column context
    const event = new CustomEvent('openQuickAddForColumn', {
      detail: { columnId, projectId },
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="h-full flex flex-col bg-surface-secondary">
      {/* Header */}
      <div className="px-6 py-4 bg-surface-primary border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid size={20} className="text-content-primary" />
            <h1 className="text-xl font-bold text-content-primary">Board View</h1>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-content-secondary">Group by:</label>
            <select
              value={boardColumnType}
              onChange={(e) => setBoardColumnType(e.target.value as BoardColumnType)}
              className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-focus"
            >
              <option value="section">Section</option>
              <option value="priority">Priority</option>
              <option value="assignee">Assignee (Phase 3)</option>
            </select>

            <button
              className="p-2 text-content-secondary hover:bg-surface-tertiary rounded-md transition-colors"
              title="Board settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Board Container */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 min-h-full">
          {columns.length === 0 ? (
            <div className="col-span-full flex items-center justify-center h-96 text-content-tertiary">
              <p>No columns available. Create a project or sections first.</p>
            </div>
          ) : (
            columns.map((column) => (
              <BoardColumn
                key={column.id}
                columnId={column.id}
                title={column.title}
                tasks={column.tasks}
                color={column.color}
                count={column.tasks.length}
                expandedTaskIds={expandedTaskIds}
                onToggleExpanded={toggleTaskExpanded}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onAddTask={handleAddTask}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
