import { useEffect } from 'react'
import { useKeyboardStore } from '@/store/keyboardStore'
import { useQuickAddStore } from '@/store/quickAddStore'
import { useTaskDetailStore } from '@/store/taskDetailStore'
import { useTaskStore } from '@/store/taskStore'

/**
 * Hook to set up global keyboard shortcuts
 * Should be called once in App.tsx
 */
export function useKeyboardShortcuts() {
  const { isHelpOpen, toggleHelp } = useKeyboardStore()
  const { openQuickAdd } = useQuickAddStore()
  const { closeTaskDetail } = useTaskDetailStore()
  const { toggleTask, selectedTaskId, tasks } = useTaskStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input/textarea (unless it's a shortcut)
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      
      // ? - Show help
      if (e.key === '?' && !isInput) {
        e.preventDefault()
        toggleHelp()
        return
      }

      // Skip other shortcuts if help is open or input is focused
      if (isHelpOpen || (isInput && e.key !== 'Escape')) {
        return
      }

      // Escape - Close modal
      if (e.key === 'Escape') {
        closeTaskDetail()
        return
      }

      // Ctrl/Cmd + K - Quick add (handled in QuickAddModal)
      // Q - Quick add
      if (e.key.toLowerCase() === 'q' && !isInput) {
        e.preventDefault()
        openQuickAdd()
        return
      }

      // Ctrl/Cmd + Enter - Complete selected task
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isInput) {
        e.preventDefault()
        if (selectedTaskId) {
          toggleTask(selectedTaskId)
        }
        return
      }

      // Number keys for priority (only if task is selected/editing)
      if (/^[1-4]$/.test(e.key) && !isInput && selectedTaskId) {
        e.preventDefault()
        const priority = ('p' + e.key) as 'p1' | 'p2' | 'p3' | 'p4'
        
        // Find the task and update it
        const task = tasks.find(t => t.id === selectedTaskId)
        if (task) {
          // This would need to be exposed from store
          // For now, this is a placeholder
          console.log(`Would set task priority to ${priority}`)
        }
        return
      }

      // T - Due today (only if task is selected)
      if (e.key.toLowerCase() === 't' && !isInput && selectedTaskId) {
        e.preventDefault()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        console.log('Would set task due date to today')
        return
      }

      // M - Due tomorrow
      if (e.key.toLowerCase() === 'm' && !isInput && selectedTaskId) {
        e.preventDefault()
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        console.log('Would set task due date to tomorrow')
        return
      }

      // W - Due next week
      if (e.key.toLowerCase() === 'w' && !isInput && selectedTaskId) {
        e.preventDefault()
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        nextWeek.setHours(0, 0, 0, 0)
        console.log('Would set task due date to next week')
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isHelpOpen, toggleHelp, openQuickAdd, closeTaskDetail, selectedTaskId, toggleTask, tasks])
}
