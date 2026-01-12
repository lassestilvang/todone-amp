import React, { useMemo, useCallback } from 'react'
import { Task } from '@/types'
import { getQuadrant, QuadrantType } from '@/utils/eisenhower'
import { MatrixQuadrant } from './MatrixQuadrant'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { MatrixTaskCard } from './MatrixTaskCard'

interface EisenhowerMatrixProps {
  tasks: Task[]
  selectedTaskId: string | null
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  onQuadrantChange: (taskId: string, quadrant: QuadrantType) => void
}

export const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({
  tasks,
  selectedTaskId,
  onToggle,
  onSelect,
  onQuadrantChange,
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const { doFirst, schedule, delegate, eliminate } = useMemo(() => {
    const result = {
      'do-first': [] as Task[],
      schedule: [] as Task[],
      delegate: [] as Task[],
      eliminate: [] as Task[],
    }

    tasks.forEach((task) => {
      if (!task.completed) {
        const quadrant = getQuadrant(task)
        result[quadrant].push(task)
      }
    })

    return {
      doFirst: result['do-first'],
      schedule: result.schedule,
      delegate: result.delegate,
      eliminate: result.eliminate,
    }
  }, [tasks])

  const activeTask = useMemo(() => {
    if (!activeId) return null
    return tasks.find((t) => t.id === activeId) ?? null
  }, [activeId, tasks])

  const handleDragStart = useCallback((event: { active: { id: string | number } }) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      setActiveId(null)

      if (!over) return

      const overId = over.id as string
      if (overId.startsWith('quadrant-')) {
        const targetQuadrant = overId.replace('quadrant-', '') as QuadrantType
        const taskId = active.id as string
        const task = tasks.find((t) => t.id === taskId)

        if (task && getQuadrant(task) !== targetQuadrant) {
          onQuadrantChange(taskId, targetQuadrant)
        }
      }
    },
    [tasks, onQuadrantChange]
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        <MatrixQuadrant
          quadrant="do-first"
          tasks={doFirst}
          selectedTaskId={selectedTaskId}
          onToggle={onToggle}
          onSelect={onSelect}
        />
        <MatrixQuadrant
          quadrant="schedule"
          tasks={schedule}
          selectedTaskId={selectedTaskId}
          onToggle={onToggle}
          onSelect={onSelect}
        />
        <MatrixQuadrant
          quadrant="delegate"
          tasks={delegate}
          selectedTaskId={selectedTaskId}
          onToggle={onToggle}
          onSelect={onSelect}
        />
        <MatrixQuadrant
          quadrant="eliminate"
          tasks={eliminate}
          selectedTaskId={selectedTaskId}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90">
            <MatrixTaskCard
              task={activeTask}
              onToggle={() => {}}
              onSelect={() => {}}
              isSelected={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
