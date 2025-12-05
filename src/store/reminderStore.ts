import { create } from 'zustand'
import { db } from '@/db/database'
import type { Reminder } from '@/types'

export type ReminderType = 'before' | 'at' | 'location' | 'manual'

interface ReminderStoreState {
  reminders: Reminder[]
  isLoading: boolean

  // Query methods
  loadReminders: (taskId?: string) => Promise<void>
  getRemindersForTask: (taskId: string) => Reminder[]
  getRemindersForUser: () => Reminder[]
  getUpcomingReminders: (withinMinutes: number) => Reminder[]

  // Reminder operations
  addReminder: (
    taskId: string,
    type: ReminderType,
    minutesBefore?: number,
    reminderTime?: string,
    location?: string
  ) => Promise<string>
  updateReminder: (reminderId: string, updates: Partial<Reminder>) => Promise<void>
  deleteReminder: (reminderId: string) => Promise<void>
  deleteRemindersForTask: (taskId: string) => Promise<void>

  // Reminder checking
  checkReminders: () => Promise<void>
  markReminderAsNotified: (reminderId: string) => Promise<void>

  // Bulk operations
  addDefaultReminder: (taskId: string) => Promise<string>
}

export const useReminderStore = create<ReminderStoreState>((set, get) => ({
  reminders: [],
  isLoading: false,

  loadReminders: async (taskId?: string) => {
    set({ isLoading: true })
    try {
      let reminders: Reminder[]
      if (taskId) {
        reminders = await db.reminders.where('taskId').equals(taskId).toArray()
      } else {
        reminders = await db.reminders.toArray()
      }
      set({ reminders })
    } finally {
      set({ isLoading: false })
    }
  },

  getRemindersForTask: (taskId: string) => {
    const { reminders } = get()
    return reminders.filter((r) => r.taskId === taskId)
  },

  getRemindersForUser: () => {
    const { reminders } = get()
    // Reminders are task-specific, not user-specific
    // This is a placeholder for future user context
    return reminders
  },

  getUpcomingReminders: (withinMinutes: number) => {
    const { reminders } = get()
    const now = new Date()
    const soon = new Date(now.getTime() + withinMinutes * 60000)

    return reminders.filter((r) => {
      if (!r.remindAt) return false
      const reminderTime = new Date(r.remindAt)
      return reminderTime >= now && reminderTime <= soon && !r.notified
    })
  },

  addReminder: async (taskId, type, minutesBefore, reminderTime, location) => {
    const id = `reminder-${Date.now()}`
    const now = new Date()

    // Calculate remindAt time
    let remindAt: Date
    if (type === 'before' && minutesBefore !== undefined) {
      remindAt = new Date(now.getTime() + minutesBefore * 60000)
    } else if (type === 'at' && reminderTime) {
      const [hours, minutes] = reminderTime.split(':').map(Number)
      remindAt = new Date()
      remindAt.setHours(hours, minutes, 0)
      // If time is in the past, set for tomorrow
      if (remindAt < now) {
        remindAt.setDate(remindAt.getDate() + 1)
      }
    } else if (type === 'location') {
      remindAt = new Date(now.getTime() + 60000) // Default 1 minute
    } else {
      remindAt = new Date(now.getTime() + 30 * 60000) // Default 30 minutes
    }

    const newReminder: Reminder = {
      id,
      taskId,
      type,
      minutesBefore,
      reminderTime,
      location,
      remindAt,
      notified: false,
      createdAt: now,
    }

    await db.reminders.add(newReminder)
    const { reminders } = get()
    set({ reminders: [...reminders, newReminder] })
    return id
  },

  updateReminder: async (reminderId, updates) => {
    await db.reminders.update(reminderId, updates)
    const { reminders } = get()
    set({
      reminders: reminders.map((r) => (r.id === reminderId ? { ...r, ...updates } : r)),
    })
  },

  deleteReminder: async (reminderId) => {
    await db.reminders.delete(reminderId)
    const { reminders } = get()
    set({ reminders: reminders.filter((r) => r.id !== reminderId) })
  },

  deleteRemindersForTask: async (taskId) => {
    const remindersToDelete = await db.reminders.where('taskId').equals(taskId).toArray()
    for (const reminder of remindersToDelete) {
      await db.reminders.delete(reminder.id)
    }
    const { reminders } = get()
    set({ reminders: reminders.filter((r) => r.taskId !== taskId) })
  },

  checkReminders: async () => {
    const upcomingReminders = get().getUpcomingReminders(5) // Check within 5 minutes
    for (const reminder of upcomingReminders) {
      // Mark as notified (real implementation would send notifications)
      await get().markReminderAsNotified(reminder.id)
    }
  },

  markReminderAsNotified: async (reminderId) => {
    await get().updateReminder(reminderId, { notified: true })
  },

  addDefaultReminder: async (taskId) => {
    // Add 30 minutes before default reminder
    return await get().addReminder(taskId, 'before', 30)
  },
}))
