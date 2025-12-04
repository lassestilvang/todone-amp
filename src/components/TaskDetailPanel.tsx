import { useEffect, useState, useCallback } from 'react'
import { X, Trash2, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTaskDetailStore } from '@/store/taskDetailStore'
import { useTaskStore } from '@/store/taskStore'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { DatePickerInput } from '@/components/DatePickerInput'
import { TimePickerInput } from '@/components/TimePickerInput'
import { PrioritySelector } from '@/components/PrioritySelector'
import { ProjectSelector } from '@/components/ProjectSelector'
import { SectionSelector } from '@/components/SectionSelector'
import { LabelSelector } from '@/components/LabelSelector'
import { RecurrenceSelector } from '@/components/RecurrenceSelector'
import { SubTaskList } from '@/components/SubTaskList'

export function TaskDetailPanel() {
  const {
    isOpen,
    selectedTask,
    hasUnsavedChanges,
    closeTaskDetail,
    updateSelectedTask,
    setHasUnsavedChanges,
  } = useTaskDetailStore()
  const { updateTask, deleteTask } = useTaskStore()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = async () => {
    if (!selectedTask) return

    try {
      await updateTask(selectedTask.id, selectedTask)
      setHasUnsavedChanges(false)
      closeTaskDetail()
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const handleDelete = async () => {
    if (!selectedTask) return

    try {
      await deleteTask(selectedTask.id)
      closeTaskDetail()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Discard them?')) {
        closeTaskDetail()
      }
    } else {
      closeTaskDetail()
    }
  }, [hasUnsavedChanges, closeTaskDetail])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleClose])

  if (!isOpen || !selectedTask) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                value={selectedTask.content}
                onChange={(e) => {
                  updateSelectedTask({ content: e.target.value })
                }}
                placeholder="Task title"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={selectedTask.description || ''}
                onChange={(e) => {
                  updateSelectedTask({ description: e.target.value })
                }}
                placeholder="Add notes or details..."
                rows={4}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-md',
                  'text-sm placeholder-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-brand-500',
                  'resize-none'
                )}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <PrioritySelector
                value={selectedTask.priority}
                onChange={(priority) => {
                  updateSelectedTask({ priority })
                }}
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <DatePickerInput
                value={selectedTask.dueDate}
                onChange={(date) => {
                  updateSelectedTask({ dueDate: date })
                }}
              />
            </div>

            {/* Due Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Time</label>
              <TimePickerInput
                value={selectedTask.dueTime}
                onChange={(time) => {
                  updateSelectedTask({ dueTime: time })
                }}
              />
            </div>

            {/* Recurrence */}
            <div>
              <RecurrenceSelector
                value={selectedTask.recurrence}
                onChange={(pattern) => {
                  updateSelectedTask({ recurrence: pattern })
                }}
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <ProjectSelector
                value={selectedTask.projectId}
                onChange={(projectId) => {
                  updateSelectedTask({ projectId, sectionId: undefined })
                }}
              />
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <SectionSelector
                projectId={selectedTask.projectId}
                value={selectedTask.sectionId}
                onChange={(sectionId) => {
                  updateSelectedTask({ sectionId })
                }}
              />
            </div>

            {/* Labels */}
            <div>
              <LabelSelector
                selectedLabelIds={selectedTask.labels}
                onAdd={(labelId) => {
                  const updated = Array.from(new Set([...selectedTask.labels, labelId]))
                  updateSelectedTask({ labels: updated })
                }}
                onRemove={(labelId) => {
                  updateSelectedTask({ labels: selectedTask.labels.filter((id) => id !== labelId) })
                }}
              />
            </div>

            {/* Subtasks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Subtasks</h3>
                <button
                  onClick={() => {
                    const event = new CustomEvent('openQuickAddForSubtask', { detail: { parentId: selectedTask.id } })
                    window.dispatchEvent(event)
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-brand-600 hover:bg-brand-50 rounded transition-colors"
                >
                  <Plus size={16} />
                  Add Subtask
                </button>
              </div>
              <SubTaskList
                parentTaskId={selectedTask.id}
                onSelectTask={(taskId) => {
                  // Load the subtask in detail panel
                  const { tasks } = useTaskStore.getState()
                  const subtask = tasks.find((t) => t.id === taskId)
                  if (subtask) {
                    useTaskDetailStore.getState().openTaskDetail(taskId, subtask)
                  }
                }}
              />
            </div>

            {/* Unsaved Changes Indicator */}
            {hasUnsavedChanges && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">You have unsaved changes</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className={cn(
                'p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors',
                showDeleteConfirm && 'bg-red-50'
              )}
              title="Delete task"
            >
              <Trash2 size={18} />
            </button>

            {showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700">Delete task?</p>
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  size="sm"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            )}

            {!showDeleteConfirm && (
              <div className="flex gap-2">
                <Button
                  onClick={handleClose}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
