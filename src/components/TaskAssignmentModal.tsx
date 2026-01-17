import { useState } from 'react'
import { User, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/Button'
import { useAuthStore } from '@/store/authStore'
import { useProjectStore } from '@/store/projectStore'
import { useTaskStore } from '@/store/taskStore'
import type { Task } from '@/types'

interface TaskAssignmentModalProps {
  task: Task
  projectId: string
  onClose: () => void
}

export function TaskAssignmentModal({
  task,
  projectId,
  onClose,
}: TaskAssignmentModalProps) {
  const { user } = useAuthStore()
  const { projects } = useProjectStore()
  const { updateTask } = useTaskStore()
  // Project could be used for additional features in the future
  void projects.find((p) => p.id === projectId)
  const [selectedAssignee, setSelectedAssignee] = useState<string | undefined>(
    task.assigneeIds?.[0],
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const projectMembers: Array<{ id: string; name: string; email: string }> = [] // TODO: Get from project.sharedWith when available

  // Include current user as assignee option
  const assigneeOptions = user
    ? [
        { id: user.id, name: user.name, email: user.email },
        ...projectMembers,
      ]
    : projectMembers

  const handleAssign = async (assigneeId: string) => {
    setIsSaving(true)
    setError(null)
    try {
      updateTask(task.id, { assigneeIds: [assigneeId] })
      setSelectedAssignee(assigneeId)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to assign task',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveAssignee = async () => {
    setIsSaving(true)
    setError(null)
    try {
      updateTask(task.id, { assigneeIds: [] })
      setSelectedAssignee(undefined)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to remove assignment',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-surface-primary p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-content-primary">
              Assign Task
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-content-tertiary hover:text-content-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Task Info */}
        <div className="mb-4 rounded-lg bg-surface-secondary p-3">
          <p className="text-sm font-medium text-content-primary">
            {task.content}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-light p-3">
            <AlertCircle className="h-4 w-4 text-semantic-error" />
            <p className="text-sm text-semantic-error">{error}</p>
          </div>
        )}

        {/* Assignee Options */}
        <div className="mb-4 max-h-64 space-y-2 overflow-y-auto">
          {assigneeOptions.length === 0 ? (
            <p className="py-4 text-center text-sm text-content-tertiary">
              No team members to assign
            </p>
          ) : (
            assigneeOptions.map((assignee) => (
              <button
                key={assignee.id}
                onClick={() => handleAssign(assignee.id)}
                disabled={isSaving}
                className={`w-full rounded-lg p-3 text-left transition-colors ${
                  selectedAssignee === assignee.id
                    ? 'bg-brand-100'
                    : 'bg-surface-secondary hover:bg-surface-tertiary'
                } disabled:opacity-50`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-content-primary">
                      {assignee.name}
                    </p>
                    <p className="text-sm text-content-tertiary">
                      {assignee.email}
                    </p>
                  </div>
                  {selectedAssignee === assignee.id && (
                    <Check className="h-5 w-5 text-brand-600" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Remove Assignment Button */}
        {selectedAssignee && (
          <button
            onClick={handleRemoveAssignee}
            disabled={isSaving}
            className="mb-4 w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-tertiary disabled:opacity-50"
          >
            Remove Assignment
          </button>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
