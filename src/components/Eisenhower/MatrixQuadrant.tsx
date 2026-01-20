import React from 'react'
import { Task } from '@/types'
import { cn } from '@/utils/cn'
import { QuadrantType } from '@/utils/eisenhower'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { MatrixTaskCard } from './MatrixTaskCard'

interface QuadrantConfig {
  title: string
  subtitle: string
  headerBg: string
  headerText: string
  borderColor: string
  emptyMessage: string
}

const quadrantConfigs: Record<QuadrantType, QuadrantConfig> = {
  'do-first': {
    title: 'Do First',
    subtitle: 'Urgent & Important',
    headerBg: 'bg-semantic-error-light',
    headerText: 'text-semantic-error',
    borderColor: 'border-semantic-error-light',
    emptyMessage: 'No urgent & important tasks',
  },
  schedule: {
    title: 'Schedule',
    subtitle: 'Important, Not Urgent',
    headerBg: 'bg-semantic-info-light',
    headerText: 'text-semantic-info',
    borderColor: 'border-semantic-info-light',
    emptyMessage: 'No tasks to schedule',
  },
  delegate: {
    title: 'Delegate',
    subtitle: 'Urgent, Not Important',
    headerBg: 'bg-semantic-warning-light',
    headerText: 'text-semantic-warning',
    borderColor: 'border-semantic-warning-light',
    emptyMessage: 'No tasks to delegate',
  },
  eliminate: {
    title: 'Eliminate',
    subtitle: 'Not Urgent & Not Important',
    headerBg: 'bg-surface-tertiary',
    headerText: 'text-content-secondary',
    borderColor: 'border-border',
    emptyMessage: 'No low-priority tasks',
  },
}

interface MatrixQuadrantProps {
  quadrant: QuadrantType
  tasks: Task[]
  selectedTaskId: string | null
  onToggle: (id: string) => void
  onSelect: (id: string) => void
}

export const MatrixQuadrant: React.FC<MatrixQuadrantProps> = ({
  quadrant,
  tasks,
  selectedTaskId,
  onToggle,
  onSelect,
}) => {
  const config = quadrantConfigs[quadrant]

  const { setNodeRef, isOver } = useDroppable({
    id: `quadrant-${quadrant}`,
    data: { quadrant },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-lg border overflow-hidden min-h-[200px]',
        config.borderColor,
        isOver && 'ring-2 ring-brand-500 ring-offset-2'
      )}
    >
      <div className={cn('px-4 py-3 border-b', config.headerBg, config.borderColor)}>
        <h3 className={cn('font-semibold', config.headerText)}>{config.title}</h3>
        <p className="text-xs text-content-tertiary">{config.subtitle}</p>
        <span className="text-xs font-medium text-content-secondary mt-1 block">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto bg-surface-secondary/50">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <MatrixTaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onSelect={onSelect}
                isSelected={selectedTaskId === task.id}
              />
            ))
          ) : (
            <p className="text-sm text-content-tertiary text-center py-8">{config.emptyMessage}</p>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
