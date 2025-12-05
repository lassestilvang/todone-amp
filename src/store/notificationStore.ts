import { create } from 'zustand'
import { db } from '@/db/database'
import type { Notification, NotificationPreferencesType } from '@/types'

export type NotificationType = 'task_assigned' | 'task_shared' | 'reminder' | 'comment' | 'system'

interface NotificationStoreState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  preferences: NotificationPreferencesType

  // Query methods
  loadNotifications: (userId: string) => Promise<void>
  loadPreferences: (userId: string) => Promise<void>
  getUnreadNotifications: () => Notification[]
  getNotificationsByType: (type: NotificationType) => Notification[]
  getTaskNotifications: (taskId: string) => Notification[]

  // Notification operations
  addNotification: (
    userId: string,
    message: string,
    type: NotificationType,
    relatedTaskId?: string
  ) => Promise<string>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  archiveNotification: (notificationId: string) => Promise<void>
  deleteAllNotifications: (userId: string) => Promise<void>

  // Preferences
  updatePreferences: (userId: string, preferences: Partial<NotificationPreferencesType>) => Promise<void>
  checkQuietHours: () => boolean
}

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  preferences: {
    enableEmailNotifications: true,
    enableBrowserNotifications: true,
    enableSoundNotifications: true,
    enablePushNotifications: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  },

  loadNotifications: async (userId: string) => {
    set({ isLoading: true })
    try {
      const notifications = await db.notifications
        .where('userId')
        .equals(userId)
        .reverse()
        .toArray()
      const unreadCount = notifications.filter((n) => !n.read).length
      set({ notifications, unreadCount })
    } finally {
      set({ isLoading: false })
    }
  },

  loadPreferences: async (userId: string) => {
    try {
      const user = await db.users.get(userId)
      if (user && user.settings.notificationPreferences) {
        set({ preferences: user.settings.notificationPreferences })
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error)
    }
  },

  getUnreadNotifications: () => {
    const { notifications } = get()
    return notifications.filter((n) => !n.read)
  },

  getNotificationsByType: (type: NotificationType) => {
    const { notifications } = get()
    return notifications.filter((n) => n.type === type)
  },

  getTaskNotifications: (taskId: string) => {
    const { notifications } = get()
    return notifications.filter((n) => n.relatedTaskId === taskId)
  },

  addNotification: async (userId, message, type, relatedTaskId) => {
    const id = `notif-${Date.now()}`
    const now = new Date()

    const newNotification: Notification = {
      id,
      userId,
      message,
      type,
      relatedTaskId,
      read: false,
      archived: false,
      createdAt: now,
    }

    await db.notifications.add(newNotification)
    const { notifications } = get()
    set({
      notifications: [newNotification, ...notifications],
      unreadCount: notifications.filter((n) => !n.read).length + 1,
    })

    return id
  },

  markAsRead: async (notificationId) => {
    await db.notifications.update(notificationId, { read: true })
    const { notifications } = get()
    const updated = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    const unreadCount = updated.filter((n) => !n.read).length
    set({ notifications: updated, unreadCount })
  },

  markAllAsRead: async (userId) => {
    const userNotifications = await db.notifications
      .where('userId')
      .equals(userId)
      .toArray()

    for (const notif of userNotifications) {
      if (!notif.read) {
        await db.notifications.update(notif.id, { read: true })
      }
    }

    const { notifications } = get()
    const updated = notifications.map((n) => ({ ...n, read: true }))
    set({ notifications: updated, unreadCount: 0 })
  },

  deleteNotification: async (notificationId) => {
    await db.notifications.delete(notificationId)
    const { notifications } = get()
    set({ notifications: notifications.filter((n) => n.id !== notificationId) })
  },

  archiveNotification: async (notificationId) => {
    await db.notifications.update(notificationId, { archived: true })
    const { notifications } = get()
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, archived: true } : n
    )
    set({ notifications: updated })
  },

  deleteAllNotifications: async (userId) => {
    const userNotifications = await db.notifications
      .where('userId')
      .equals(userId)
      .toArray()

    for (const notif of userNotifications) {
      await db.notifications.delete(notif.id)
    }

    set({ notifications: [], unreadCount: 0 })
  },

  updatePreferences: async (userId, newPreferences) => {
    const { preferences } = get()
    const updated = { ...preferences, ...newPreferences }
    set({ preferences: updated })

    // Save to user settings
    try {
      const user = await db.users.get(userId)
      if (user) {
        await db.users.update(userId, {
          settings: {
            ...user.settings,
            notificationPreferences: updated,
          },
        })
      }
    } catch (error) {
      console.error('Failed to save notification preferences:', error)
    }
  },

  checkQuietHours: () => {
    const { preferences } = get()
    if (!preferences.quietHours?.enabled) return false

    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const { startTime, endTime } = preferences.quietHours

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime < endTime
    }
  },
}))
