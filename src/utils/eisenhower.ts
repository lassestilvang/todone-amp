import { Task } from '@/types'
import { isTaskOverdue, isTaskDueToday } from '@/utils/date'

export type QuadrantType = 'do-first' | 'schedule' | 'delegate' | 'eliminate'

export const getQuadrant = (task: Task): QuadrantType => {
  const isUrgent =
    task.priority === 'p1' ||
    task.priority === 'p2' ||
    isTaskOverdue(task.dueDate) ||
    isTaskDueToday(task.dueDate)
  const isImportant =
    task.priority === 'p1' || task.priority === 'p2' || task.labels?.includes('important')

  if (isUrgent && isImportant) return 'do-first'
  if (!isUrgent && isImportant) return 'schedule'
  if (isUrgent && !isImportant) return 'delegate'
  return 'eliminate'
}
