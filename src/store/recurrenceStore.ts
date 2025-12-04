import { create } from 'zustand'
import { db } from '@/db/database'
import type { RecurrenceInstance, RecurrencePattern, RecurrenceException } from '@/types'
import { isSameDay, startOfDay } from 'date-fns'

interface RecurrenceState {
  instances: RecurrenceInstance[]
  isLoading: boolean
  // Instance management
  loadTaskInstances: (taskId: string) => Promise<void>
  generateInstances: (
    taskId: string,
    baseTaskId: string,
    pattern: RecurrencePattern,
    rangeStart: Date,
    rangeEnd: Date,
  ) => Promise<void>
  getTaskInstances: (taskId: string) => RecurrenceInstance[]
  getInstancesByDateRange: (
    taskId: string,
    startDate: Date,
    endDate: Date,
  ) => RecurrenceInstance[]
  markInstanceCompleted: (instanceId: string, completed: boolean) => Promise<void>
  // Exception handling
  addRecurrenceException: (
    taskId: string,
    date: Date,
    reason: 'skipped' | 'rescheduled' | 'deleted',
    newDate?: Date,
  ) => Promise<void>
  removeRecurrenceException: (taskId: string, date: Date) => Promise<void>
  getRecurrenceExceptions: (taskId: string) => RecurrenceException[]
  skipRecurrenceDate: (taskId: string, date: Date) => Promise<void>
  rescheduleRecurrenceDate: (taskId: string, oldDate: Date, newDate: Date) => Promise<void>
  // Instance deletion
  deleteInstance: (instanceId: string) => Promise<void>
  deleteAllFutureInstances: (taskId: string, fromDate: Date) => Promise<void>
}

export const useRecurrenceStore = create<RecurrenceState>((set, get) => ({
  instances: [],
  isLoading: false,

  loadTaskInstances: async (taskId: string) => {
    set({ isLoading: true })
    try {
      const instances = await db.recurrenceInstances.where('taskId').equals(taskId).toArray()
      set({
        instances,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  generateInstances: async (taskId, baseTaskId, pattern, rangeStart, rangeEnd) => {
    const instances: RecurrenceInstance[] = []
    let current = new Date(pattern.startDate)

    // Generate instances for date range
    while (current < rangeEnd) {
      // Calculate next occurrence
      const nextDate = new Date(current)
      nextDate.setDate(nextDate.getDate() + 1)

      if (nextDate > rangeEnd) break

      // Check if date is in exceptions
      const isException = pattern.exceptions.some((exc) => isSameDay(exc, nextDate))
      if (isException) {
        current = nextDate
        continue
      }

      // Check if date matches pattern (simplified - would need full pattern matching)
      if (matchesSimplePattern(pattern, nextDate)) {
        if (nextDate >= rangeStart && nextDate < rangeEnd) {
          const instanceId = `instance-${taskId}-${nextDate.getTime()}`
          const instance: RecurrenceInstance = {
            id: instanceId,
            taskId,
            baseTaskId,
            dueDate: startOfDay(nextDate),
            isException: false,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          instances.push(instance)
          await db.recurrenceInstances.add(instance)
        }
      }

      current = nextDate

      // Safety limit
      if (instances.length > 366) break
    }

    set((state) => ({
      instances: [...state.instances, ...instances],
    }))
  },

  getTaskInstances: (taskId: string) => {
    const { instances } = get()
    return instances
      .filter((i) => i.taskId === taskId)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  },

  getInstancesByDateRange: (taskId: string, startDate: Date, endDate: Date) => {
    const { instances } = get()
    return instances
      .filter(
        (i) =>
          i.taskId === taskId &&
          i.dueDate >= startOfDay(startDate) &&
          i.dueDate <= startOfDay(endDate),
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  },

  markInstanceCompleted: async (instanceId: string, completed: boolean) => {
    const { instances } = get()
    const instance = instances.find((i) => i.id === instanceId)
    if (!instance) return

    const now = new Date()
    const updated: RecurrenceInstance = {
      ...instance,
      completed,
      completedAt: completed ? now : undefined,
      updatedAt: now,
    }

    await db.recurrenceInstances.update(instanceId, updated)

    set({
      instances: instances.map((i) => (i.id === instanceId ? updated : i)),
    })
  },

  addRecurrenceException: async (
    taskId: string,
    date: Date,
    reason: 'skipped' | 'rescheduled' | 'deleted',
  ) => {
    const { instances } = get()
    const normalizedDate = startOfDay(date)

    // Find instance for this date
    const instance = instances.find(
      (i) => i.taskId === taskId && isSameDay(i.dueDate, normalizedDate),
    )

    if (instance) {
      const updated: RecurrenceInstance = {
        ...instance,
        isException: true,
        exceptionReason: reason,
        updatedAt: new Date(),
      }

      await db.recurrenceInstances.update(instance.id, updated)

      set({
        instances: instances.map((i) => (i.id === instance.id ? updated : i)),
      })
    }
  },

  removeRecurrenceException: async (taskId: string, date: Date) => {
    const { instances } = get()
    const normalizedDate = startOfDay(date)

    const instance = instances.find(
      (i) => i.taskId === taskId && isSameDay(i.dueDate, normalizedDate),
    )

    if (instance) {
      const updated: RecurrenceInstance = {
        ...instance,
        isException: false,
        exceptionReason: undefined,
        updatedAt: new Date(),
      }

      await db.recurrenceInstances.update(instance.id, updated)

      set({
        instances: instances.map((i) => (i.id === instance.id ? updated : i)),
      })
    }
  },

  getRecurrenceExceptions: (taskId: string) => {
    const { instances } = get()
    return instances
      .filter((i) => i.taskId === taskId && i.isException)
      .map((i) => ({
        date: i.dueDate,
        reason: i.exceptionReason || 'skipped',
        createdAt: i.createdAt,
      }))
  },

  skipRecurrenceDate: async (taskId: string, date: Date) => {
    await get().addRecurrenceException(taskId, date, 'skipped')
  },

  rescheduleRecurrenceDate: async (taskId: string, oldDate: Date, rescheduledDate: Date) => {
    const { instances } = get()
    const normalizedOldDate = startOfDay(oldDate)
    const normalizedRescheduledDate = startOfDay(rescheduledDate)

    // Mark old date as rescheduled
    const oldInstance = instances.find(
      (i) => i.taskId === taskId && isSameDay(i.dueDate, normalizedOldDate),
    )

    if (oldInstance) {
      const updated: RecurrenceInstance = {
        ...oldInstance,
        isException: true,
        exceptionReason: 'rescheduled',
        updatedAt: new Date(),
      }

      await db.recurrenceInstances.update(oldInstance.id, updated)

      set({
        instances: instances.map((i) => (i.id === oldInstance.id ? updated : i)),
      })

      // Create new instance for rescheduled date
      const newInstanceId = `instance-${taskId}-${normalizedRescheduledDate.getTime()}`
      const newInstance: RecurrenceInstance = {
        id: newInstanceId,
        taskId,
        baseTaskId: oldInstance.baseTaskId,
        dueDate: normalizedRescheduledDate,
        isException: false,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.recurrenceInstances.add(newInstance)

      set((state) => ({
        instances: [...state.instances, newInstance],
      }))
    }
  },

  deleteInstance: async (instanceId: string) => {
    await db.recurrenceInstances.delete(instanceId)
    set((state) => ({
      instances: state.instances.filter((i) => i.id !== instanceId),
    }))
  },

  deleteAllFutureInstances: async (taskId: string, fromDate: Date) => {
    const { instances } = get()
    const normalizedDate = startOfDay(fromDate)

    const toDelete = instances.filter(
      (i) => i.taskId === taskId && i.dueDate >= normalizedDate,
    )

    for (const instance of toDelete) {
      await db.recurrenceInstances.delete(instance.id)
    }

    set({
      instances: instances.filter((i) => !toDelete.includes(i)),
    })
  },
}))

/**
 * Simplified pattern matching (would be enhanced to match full recurrence logic)
 */
function matchesSimplePattern(pattern: RecurrencePattern, date: Date): boolean {
  const daysDiff = Math.floor(
    (date.getTime() - pattern.startDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  switch (pattern.frequency) {
    case 'daily':
      return daysDiff % pattern.interval === 0

    case 'weekly':
      return Math.floor(daysDiff / 7) % pattern.interval === 0

    case 'monthly':
      return daysDiff % 30 === 0

    case 'yearly':
      return daysDiff % 365 === 0

    default:
      return false
  }
}
