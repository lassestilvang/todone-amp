import { create } from 'zustand'
import { db } from '@/db/database'
import type {
  CalendarIntegration,
  CalendarEvent,
  SyncHistory,
  UserIntegration,
} from '@/types'

interface IntegrationState {
  // Calendar Integrations
  calendarIntegrations: CalendarIntegration[]
  calendarEvents: CalendarEvent[]
  syncHistory: SyncHistory[]
  userIntegrations: UserIntegration[]

  // Query methods
  getCalendarIntegrations: (userId: string) => Promise<CalendarIntegration[]>
  getCalendarIntegration: (
    userId: string,
    service: 'google' | 'outlook'
  ) => Promise<CalendarIntegration | undefined>
  getCalendarEvents: (userId: string) => Promise<CalendarEvent[]>
  getSyncHistory: (userId: string, limit?: number) => Promise<SyncHistory[]>
  getUserIntegrations: (userId: string) => Promise<UserIntegration[]>
  getUserIntegration: (
    userId: string,
    service: string
  ) => Promise<UserIntegration | undefined>

  // Mutation methods
  addCalendarIntegration: (integration: CalendarIntegration) => Promise<void>
  updateCalendarIntegration: (
    id: string,
    updates: Partial<CalendarIntegration>
  ) => Promise<void>
  removeCalendarIntegration: (id: string) => Promise<void>
  disconnectCalendar: (userId: string, service: string) => Promise<void>

  addCalendarEvent: (event: CalendarEvent) => Promise<void>
  updateCalendarEvent: (
    id: string,
    updates: Partial<CalendarEvent>
  ) => Promise<void>
  removeCalendarEvent: (id: string) => Promise<void>
  syncCalendarEvents: (userId: string, service: string) => Promise<void>

  addSyncHistory: (history: SyncHistory) => Promise<void>
  getSyncStatus: (userId: string, service: string) => Promise<string>
  resetSync: (userId: string, service: string) => Promise<void>

  addUserIntegration: (integration: UserIntegration) => Promise<void>
  updateUserIntegration: (
    id: string,
    updates: Partial<UserIntegration>
  ) => Promise<void>
  removeUserIntegration: (id: string) => Promise<void>

  // Time-blocked task sync methods
  syncTimeBlockedTasksToCalendar: (userId: string, service: string) => Promise<boolean>
  openCalendarApp: (event: CalendarEvent, service: string) => void
  getCalendarAppUrl: (event: CalendarEvent, service: string) => string

  // UI state
  isLoading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useIntegrationStore = create<IntegrationState>((set) => ({
  calendarIntegrations: [],
  calendarEvents: [],
  syncHistory: [],
  userIntegrations: [],
  isLoading: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Calendar Integration Queries
  getCalendarIntegrations: async (userId) => {
    try {
      const integrations = await db.calendarIntegrations
        .where('userId')
        .equals(userId)
        .toArray()
      set({ calendarIntegrations: integrations })
      return integrations
    } catch (error) {
      set({ error: `Failed to fetch calendar integrations: ${error}` })
      return []
    }
  },

  getCalendarIntegration: async (userId, service) => {
    try {
      const integration = await db.calendarIntegrations
        .where('[userId+service]')
        .equals([userId, service])
        .first()
      return integration
    } catch (error) {
      set({ error: `Failed to fetch calendar integration: ${error}` })
      return undefined
    }
  },

  getCalendarEvents: async (userId) => {
    try {
      const integrations = await db.calendarIntegrations
        .where('userId')
        .equals(userId)
        .toArray()
      const services = integrations.map((i) => i.service)

      let events: CalendarEvent[] = []
      for (const service of services) {
        const serviceEvents = await db.calendarEvents
          .where('service')
          .equals(service)
          .toArray()
        events = [...events, ...serviceEvents]
      }

      set({ calendarEvents: events })
      return events
    } catch (error) {
      set({ error: `Failed to fetch calendar events: ${error}` })
      return []
    }
  },

  getSyncHistory: async (userId, limit = 50) => {
    try {
      const integrations = await db.calendarIntegrations
        .where('userId')
        .equals(userId)
        .toArray()
      const services = integrations.map((i) => i.service)

      let history: SyncHistory[] = []
      for (const service of services) {
        const serviceHistory = await db.syncHistory
          .where('service')
          .equals(service)
          .reverse()
          .limit(limit)
          .toArray()
        history = [...history, ...serviceHistory]
      }

      set({ syncHistory: history.sort((a, b) => b.syncedAt.getTime() - a.syncedAt.getTime()) })
      return history
    } catch (error) {
      set({ error: `Failed to fetch sync history: ${error}` })
      return []
    }
  },

  getUserIntegrations: async (userId) => {
    try {
      const integrations = await db.userIntegrations
        .where('userId')
        .equals(userId)
        .toArray()
      set({ userIntegrations: integrations })
      return integrations
    } catch (error) {
      set({ error: `Failed to fetch user integrations: ${error}` })
      return []
    }
  },

  getUserIntegration: async (userId, service) => {
    try {
      const integration = await db.userIntegrations
        .where('[userId+service]')
        .equals([userId, service])
        .first()
      return integration
    } catch (error) {
      set({ error: `Failed to fetch user integration: ${error}` })
      return undefined
    }
  },

  // Calendar Integration Mutations
  addCalendarIntegration: async (integration) => {
    try {
      await db.calendarIntegrations.add(integration)
      set((state) => ({
        calendarIntegrations: [...state.calendarIntegrations, integration],
      }))
    } catch (error) {
      set({ error: `Failed to add calendar integration: ${error}` })
    }
  },

  updateCalendarIntegration: async (id, updates) => {
    try {
      await db.calendarIntegrations.update(id, updates)
      set((state) => ({
        calendarIntegrations: state.calendarIntegrations.map((i) =>
          i.id === id ? { ...i, ...updates } : i
        ),
      }))
    } catch (error) {
      set({ error: `Failed to update calendar integration: ${error}` })
    }
  },

  removeCalendarIntegration: async (id) => {
    try {
      await db.calendarIntegrations.delete(id)
      set((state) => ({
        calendarIntegrations: state.calendarIntegrations.filter((i) => i.id !== id),
      }))
    } catch (error) {
      set({ error: `Failed to remove calendar integration: ${error}` })
    }
  },

  disconnectCalendar: async (userId, service) => {
    try {
      const integration = await db.calendarIntegrations
        .where('[userId+service]')
        .equals([userId, service])
        .first()

      if (integration) {
        await db.calendarIntegrations.delete(integration.id)
        set((state) => ({
          calendarIntegrations: state.calendarIntegrations.filter(
            (i) => i.id !== integration.id
          ),
        }))
      }
    } catch (error) {
      set({ error: `Failed to disconnect calendar: ${error}` })
    }
  },

  // Calendar Event Mutations
  addCalendarEvent: async (event) => {
    try {
      await db.calendarEvents.add(event)
      set((state) => ({
        calendarEvents: [...state.calendarEvents, event],
      }))
    } catch (error) {
      set({ error: `Failed to add calendar event: ${error}` })
    }
  },

  updateCalendarEvent: async (id, updates) => {
    try {
      await db.calendarEvents.update(id, updates)
      set((state) => ({
        calendarEvents: state.calendarEvents.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      }))
    } catch (error) {
      set({ error: `Failed to update calendar event: ${error}` })
    }
  },

  removeCalendarEvent: async (id) => {
    try {
      await db.calendarEvents.delete(id)
      set((state) => ({
        calendarEvents: state.calendarEvents.filter((e) => e.id !== id),
      }))
    } catch (error) {
      set({ error: `Failed to remove calendar event: ${error}` })
    }
  },

  syncCalendarEvents: async (userId, service) => {
    try {
      set({ isLoading: true, error: null })
      // This is a stub - actual sync would call backend API
      // Update sync status in integration
      const integration = await db.calendarIntegrations
        .where('[userId+service]')
        .equals([userId, service])
        .first()

      if (integration) {
        await db.calendarIntegrations.update(integration.id, {
          syncStatus: 'syncing',
          syncError: undefined,
        })

        // Simulate sync
        await new Promise((resolve) => setTimeout(resolve, 1000))

        await db.calendarIntegrations.update(integration.id, {
          syncStatus: 'idle',
          lastSyncAt: new Date(),
        })
      }

      set({ isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: `Failed to sync calendar events: ${error}`,
      })
    }
  },

  // Sync History
  addSyncHistory: async (history) => {
    try {
      await db.syncHistory.add(history)
      set((state) => ({
        syncHistory: [history, ...state.syncHistory],
      }))
    } catch (error) {
      set({ error: `Failed to add sync history: ${error}` })
    }
  },

  getSyncStatus: async (userId, service) => {
    try {
      const integration = await db.calendarIntegrations
        .where('[userId+service]')
        .equals([userId, service])
        .first()

      return integration?.syncStatus || 'idle'
    } catch {
      return 'error'
    }
  },

  resetSync: async (userId, service) => {
    try {
      const integration = await db.calendarIntegrations
        .where('[userId+service]')
        .equals([userId, service])
        .first()

      if (integration) {
        await db.calendarIntegrations.update(integration.id, {
          syncStatus: 'idle',
          syncError: undefined,
          lastSyncAt: undefined,
        })

        // Clear sync history for this service
        await db.syncHistory.where('service').equals(service).delete()
        set({ syncHistory: [] })
      }
    } catch (err) {
      set({ error: `Failed to reset sync: ${err}` })
    }
  },

  // User Integration Mutations
  addUserIntegration: async (integration) => {
    try {
      await db.userIntegrations.add(integration)
      set((state) => ({
        userIntegrations: [...state.userIntegrations, integration],
      }))
    } catch (error) {
      set({ error: `Failed to add user integration: ${error}` })
    }
  },

  updateUserIntegration: async (id, updates) => {
    try {
      await db.userIntegrations.update(id, updates)
      set((state) => ({
        userIntegrations: state.userIntegrations.map((i) =>
          i.id === id ? { ...i, ...updates } : i
        ),
      }))
    } catch (error) {
      set({ error: `Failed to update user integration: ${error}` })
    }
  },

  removeUserIntegration: async (id) => {
    try {
      await db.userIntegrations.delete(id)
      set((state) => ({
        userIntegrations: state.userIntegrations.filter((i) => i.id !== id),
      }))
    } catch (error) {
      set({ error: `Failed to remove user integration: ${error}` })
    }
  },

  // Time-blocked task sync implementations
  syncTimeBlockedTasksToCalendar: async (userId, service) => {
    try {
      set({ isLoading: true })

      // Get the calendar integration for this service
      const integration = await db.calendarIntegrations
        .where('[userId+service]')
        .equals([userId, service])
        .first()

      if (!integration || !integration.syncEnabled) {
        set({ error: `Calendar not connected: ${service}` })
        return false
      }

      // Record sync history
      const syncRecord: SyncHistory = {
        id: `sync-${Date.now()}`,
        service: service as 'google' | 'outlook' | 'slack' | 'email',
        action: 'create',
        direction: 'to-service',
        syncedAt: new Date(),
        status: 'success',
      }

      await db.syncHistory.add(syncRecord)

      set({
        isLoading: false,
        error: null,
      })

      return true
    } catch (error) {
      const errorMsg = `Failed to sync time-blocked tasks: ${error}`
      set({
        isLoading: false,
        error: errorMsg,
      })
      return false
    }
  },

  openCalendarApp: (event, service) => {
    const url = useIntegrationStore.getState().getCalendarAppUrl(event, service)
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  },

  getCalendarAppUrl: (event, service) => {
    const startDate = event.startTime.toISOString().replace(/[-:]/g, '').split('.')[0]
    const endDate = event.endTime.toISOString().replace(/[-:]/g, '').split('.')[0]

    const title = encodeURIComponent(event.title)
    const description = encodeURIComponent(event.description || '')

    if (service === 'google') {
      return `https://calendar.google.com/calendar/r/eventedit?text=${title}&details=${description}&dates=${startDate}/${endDate}`
    } else if (service === 'outlook') {
      return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${description}&startTime=${event.startTime.toISOString()}&endTime=${event.endTime.toISOString()}`
    }

    return ''
  },
}))
