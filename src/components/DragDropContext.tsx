import React from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDragStore } from '@/store/dragStore'
import { useTaskStore } from '@/store/taskStore'

interface DragDropContextProviderProps {
  children: React.ReactNode
}

export function DragDropContextProvider({ children }: DragDropContextProviderProps) {
  const { setActiveId, setOverId, reset } = useDragStore()
  const { reorderTasks } = useTaskStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before starting
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      reset()
      return
    }

    // Perform the reorder
    try {
      await reorderTasks(active.id as string, over.id as string)
    } catch (error) {
      console.error('Failed to reorder tasks:', error)
    } finally {
      reset()
    }
  }

  const handleDragCancel = () => {
    reset()
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
    </DndContext>
  )
}
