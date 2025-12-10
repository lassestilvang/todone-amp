import { useEffect, useState } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { useUndoRedoStore } from '@/store/undoRedoStore'
import { useTaskStore } from '@/store/taskStore'
import { Button } from '@/components/Button'

export function UndoNotification() {
  const { deletedTasks, removeDeletedTask } = useUndoRedoStore()
  const { createTask } = useTaskStore()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(deletedTasks.length > 0)
  }, [deletedTasks])

  if (!visible || deletedTasks.length === 0) {
    return null
  }

  const latestDeleted = deletedTasks[0]
  const remainingTasks = deletedTasks.length - 1

  const handleUndo = async () => {
    try {
      const {
        content,
        priority,
        dueDate,
        dueTime,
        projectId,
        sectionId,
        labels,
        reminders,
        attachments,
      } = latestDeleted.task
      await createTask({
        content,
        priority,
        dueDate,
        dueTime,
        projectId,
        sectionId,
        labels,
        completed: false,
        reminders,
        attachments,
        order: 0,
      })
      removeDeletedTask(latestDeleted.task.id)
    } catch (error) {
      console.error('Failed to restore task:', error)
    }
  }

  const handleDismiss = () => {
    removeDeletedTask(latestDeleted.task.id)
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-md z-40">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          Deleted "{latestDeleted.task.content}"
        </p>
        {remainingTasks > 0 && (
          <p className="text-xs text-gray-500">{remainingTasks} more in undo history</p>
        )}
      </div>

      <Button onClick={handleUndo} variant="secondary" size="sm">
        <RotateCcw size={14} className="mr-1" />
        Undo
      </Button>

      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  )
}
