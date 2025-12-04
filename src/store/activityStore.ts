import { create } from 'zustand'
import { db } from '@/db/database'
import type { Activity, ActivityAction } from '@/types'

interface ActivityState {
  activities: Activity[]
  isLoading: boolean
  // Actions
  loadTaskActivities: (taskId: string) => Promise<void>
  addActivity: (
    taskId: string,
    userId: string,
    action: ActivityAction,
    changes?: Record<string, unknown>,
    oldValue?: unknown,
    newValue?: unknown,
  ) => Promise<Activity>
  getTaskActivities: (taskId: string) => Activity[]
  getActivityById: (activityId: string) => Activity | undefined
  getActivityCount: (taskId: string) => number
  getActivitiesByAction: (taskId: string, action: ActivityAction) => Activity[]
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  isLoading: false,

  loadTaskActivities: async (taskId: string) => {
    set({ isLoading: true })
    try {
      const activities = await db.activities.where('taskId').equals(taskId).toArray()

      set({
        activities,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  addActivity: async (
    taskId: string,
    userId: string,
    action: ActivityAction,
    changes?: Record<string, unknown>,
    oldValue?: unknown,
    newValue?: unknown,
  ) => {
    const activityId = `activity-${Date.now()}`
    const now = new Date()

    const activity: Activity = {
      id: activityId,
      taskId,
      userId,
      action,
      changes,
      oldValue,
      newValue,
      timestamp: now,
    }

    await db.activities.add(activity)

    set((state) => ({
      activities: [...state.activities, activity],
    }))

    return activity
  },

  getTaskActivities: (taskId: string) => {
    const { activities } = get()
    return activities
      .filter((a) => a.taskId === taskId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  getActivityById: (activityId: string) => {
    const { activities } = get()
    return activities.find((a) => a.id === activityId)
  },

  getActivityCount: (taskId: string) => {
    const { activities } = get()
    return activities.filter((a) => a.taskId === taskId).length
  },

  getActivitiesByAction: (taskId: string, action: ActivityAction) => {
    const { activities } = get()
    return activities.filter((a) => a.taskId === taskId && a.action === action)
  },
}))
