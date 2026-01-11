import { useEffect } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useBulkActionStore } from '@/store/bulkActionStore'

interface ShortcutActions {
  onQuickAdd?: () => void
  onComplete?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onSearch?: () => void
  onToggleFavorite?: () => void
  onFocusMode?: () => void
}

export function useKeyboardShortcuts(
  selectedTaskId: string | null,
  actions: ShortcutActions = {}
) {
  const taskStore = useTaskStore()
  const bulkStore = useBulkActionStore()

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const isCtrlCmd = isMac ? e.metaKey : e.ctrlKey

      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement
      const isInputField =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement

      // Ctrl/Cmd + K: Quick add modal
      if (isCtrlCmd && e.key === 'k') {
        e.preventDefault()
        actions.onQuickAdd?.()
      }

      // Q: Quick add task (skip if typing in input)
      if (e.key === 'q' && !e.ctrlKey && !e.metaKey && !isInputField) {
        e.preventDefault()
        actions.onQuickAdd?.()
      }

      // Ctrl/Cmd + Shift + F: Toggle Focus Mode
      if (isCtrlCmd && e.shiftKey && e.key === 'f') {
        e.preventDefault()
        actions.onFocusMode?.()
      }

      // Escape: Close dialogs/deselect
      if (e.key === 'Escape') {
        bulkStore.clearSelection()
      }

      // Ctrl/Cmd + Enter: Complete selected task
      if (isCtrlCmd && e.key === 'Enter' && selectedTaskId) {
        e.preventDefault()
        await taskStore.toggleTask(selectedTaskId)
        actions.onComplete?.()
      }

      // 1-4: Set priority (only if task selected)
      if (selectedTaskId && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault()
        const priorityMap: Record<string, 'p1' | 'p2' | 'p3' | 'p4'> = { '1': 'p1', '2': 'p2', '3': 'p3', '4': 'p4' }
        await taskStore.updateTask(selectedTaskId, { priority: priorityMap[e.key] })
      }

      // T: Set due date to today (skip if typing in input)
      if (e.key === 't' && !e.ctrlKey && !e.metaKey && selectedTaskId && !isInputField) {
        e.preventDefault()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        await taskStore.updateTask(selectedTaskId, { dueDate: today })
      }

      // M: Set due date to tomorrow (skip if typing in input)
      if (e.key === 'm' && !e.ctrlKey && !e.metaKey && selectedTaskId && !isInputField) {
        e.preventDefault()
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        await taskStore.updateTask(selectedTaskId, { dueDate: tomorrow })
      }

      // W: Set due date to next week (skip if typing in input)
      if (e.key === 'w' && !e.ctrlKey && !e.metaKey && selectedTaskId && !isInputField) {
        e.preventDefault()
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        nextWeek.setHours(0, 0, 0, 0)
        await taskStore.updateTask(selectedTaskId, { dueDate: nextWeek })
      }

      // /: Focus search (skip if typing in input)
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !isInputField) {
        e.preventDefault()
        actions.onSearch?.()
      }

      // ?: Show keyboard shortcuts help
      if (e.shiftKey && e.key === '?') {
        e.preventDefault()
        // Will be handled by component
      }

      // Delete: Delete selected task(s) (skip if typing in input)
      if (e.key === 'Delete' && selectedTaskId && !isInputField) {
        e.preventDefault()
        const selectedCount = bulkStore.getSelectedCount()
        if (selectedCount > 0) {
          await bulkStore.deleteSelected()
        } else {
          await taskStore.deleteTask(selectedTaskId)
        }
        actions.onDelete?.()
      }

      // Ctrl/Cmd + D: Duplicate task
      if (isCtrlCmd && e.key === 'd' && selectedTaskId) {
        e.preventDefault()
        await taskStore.duplicateTask(selectedTaskId, true)
        actions.onDuplicate?.()
      }

      // Note: Toggle favorite is handled at project level, not task level
      // Tasks don't have isFavorite property

      // A: Toggle multi-select mode (skip if typing in input)
      if (e.key === 'a' && !e.ctrlKey && !e.metaKey && !isInputField) {
        e.preventDefault()
        if (bulkStore.isSelectMode) {
          bulkStore.exitSelectMode()
        } else {
          bulkStore.enterSelectMode()
        }
      }

      // Shift + A: Select all visible (skip if typing in input)
      if (e.shiftKey && e.key === 'A' && !isInputField) {
        e.preventDefault()
        const tasks = taskStore.tasks
        bulkStore.selectMultiple(tasks.map((t) => t.id))
      }

      // Arrow Up/Down: Navigate (handled elsewhere, but can be extended)
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        // Navigation logic handled by component
      }

      // Ctrl/Cmd + Up/Down: Move task up/down in list (skip if typing in input)
      if (isCtrlCmd && ['ArrowUp', 'ArrowDown'].includes(e.key) && selectedTaskId && !isInputField) {
        e.preventDefault()
        const tasks = taskStore.tasks
        const currentIndex = tasks.findIndex((t) => t.id === selectedTaskId)
        if (currentIndex === -1) return
        
        if (e.key === 'ArrowUp' && currentIndex > 0) {
          const taskAbove = tasks[currentIndex - 1]
          await taskStore.reorderTasks(selectedTaskId, taskAbove.id)
        } else if (e.key === 'ArrowDown' && currentIndex < tasks.length - 1) {
          const taskBelow = tasks[currentIndex + 1]
          await taskStore.reorderTasks(selectedTaskId, taskBelow.id)
        }
      }

      // Ctrl/Cmd + ] / [: Indent/outdent (skip if typing in input)
      if (isCtrlCmd && (e.key === ']' || e.key === '[') && selectedTaskId && !isInputField) {
        e.preventDefault()
        const tasks = taskStore.tasks
        const currentIndex = tasks.findIndex((t) => t.id === selectedTaskId)
        if (currentIndex === -1) return
        
        if (e.key === ']') {
          // Indent: Make this task a subtask of the task above
          if (currentIndex > 0) {
            const taskAbove = tasks[currentIndex - 1]
            await taskStore.indentTask(selectedTaskId, taskAbove.id)
          }
        } else if (e.key === '[') {
          // Outdent: Remove parent task
          const task = tasks.find((t) => t.id === selectedTaskId)
          if (task?.parentTaskId) {
            await taskStore.promoteSubtask(selectedTaskId)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedTaskId, actions, taskStore, bulkStore])
}
