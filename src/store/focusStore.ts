import { create } from 'zustand'
import { db } from '@/db/database'
import type { FocusSession, FocusSettings, FocusSessionType } from '@/types'

const DEFAULT_SETTINGS: Omit<FocusSettings, 'userId'> = {
  focusDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  soundType: 'bell',
}

interface FocusState {
  isActive: boolean
  isPaused: boolean
  currentSession: FocusSession | null
  linkedTaskId: string | null
  timeRemaining: number
  sessionCount: number
  settings: FocusSettings | null
  sessions: FocusSession[]
  loading: boolean
  error: string | null
}

interface FocusActions {
  initializeSettings: (userId: string) => Promise<void>
  startFocus: (userId: string, taskId?: string) => Promise<void>
  startBreak: (userId: string, type: 'short-break' | 'long-break') => Promise<void>
  pauseFocus: () => void
  resumeFocus: () => void
  stopFocus: () => Promise<void>
  skipToBreak: (userId: string) => Promise<void>
  recordInterruption: () => Promise<void>
  updateSettings: (userId: string, settings: Partial<FocusSettings>) => Promise<void>
  tick: () => void
  completeSession: () => Promise<void>
  loadSessions: (userId: string) => Promise<void>
  getSessionsByTask: (taskId: string) => Promise<FocusSession[]>
}

export const useFocusStore = create<FocusState & FocusActions>((set, get) => ({
  isActive: false,
  isPaused: false,
  currentSession: null,
  linkedTaskId: null,
  timeRemaining: 25 * 60,
  sessionCount: 0,
  settings: null,
  sessions: [],
  loading: false,
  error: null,

  initializeSettings: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      let settings = await db.focusSettings?.get(userId)

      if (!settings) {
        settings = { userId, ...DEFAULT_SETTINGS }
        await db.focusSettings?.add(settings)
      }

      set({
        settings,
        timeRemaining: settings.focusDuration,
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize settings',
        loading: false,
      })
    }
  },

  startFocus: async (userId: string, taskId?: string) => {
    const state = get()
    const settings = state.settings

    if (!settings) {
      await get().initializeSettings(userId)
    }

    const currentSettings = get().settings
    if (!currentSettings) return

    const session: FocusSession = {
      id: `focus-${Date.now()}`,
      userId,
      taskId: taskId ?? null,
      startTime: new Date(),
      endTime: null,
      duration: currentSettings.focusDuration,
      type: 'focus',
      completed: false,
      interruptions: 0,
    }

    try {
      await db.focusSessions?.add(session)
      set({
        isActive: true,
        isPaused: false,
        currentSession: session,
        linkedTaskId: taskId ?? null,
        timeRemaining: currentSettings.focusDuration,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to start focus session' })
    }
  },

  startBreak: async (userId: string, type: 'short-break' | 'long-break') => {
    const state = get()
    const settings = state.settings
    if (!settings) return

    const duration = type === 'short-break' ? settings.shortBreakDuration : settings.longBreakDuration

    const session: FocusSession = {
      id: `break-${Date.now()}`,
      userId,
      taskId: null,
      startTime: new Date(),
      endTime: null,
      duration,
      type,
      completed: false,
      interruptions: 0,
    }

    try {
      await db.focusSessions?.add(session)
      set({
        isActive: true,
        isPaused: false,
        currentSession: session,
        linkedTaskId: null,
        timeRemaining: duration,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to start break' })
    }
  },

  pauseFocus: () => {
    set({ isPaused: true })
  },

  resumeFocus: () => {
    set({ isPaused: false })
  },

  stopFocus: async () => {
    const state = get()
    if (!state.currentSession) return

    const updatedSession: FocusSession = {
      ...state.currentSession,
      endTime: new Date(),
      completed: false,
    }

    try {
      await db.focusSessions?.put(updatedSession)
      set({
        isActive: false,
        isPaused: false,
        currentSession: null,
        linkedTaskId: null,
        timeRemaining: state.settings?.focusDuration ?? 25 * 60,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to stop focus session' })
    }
  },

  skipToBreak: async (userId: string) => {
    const state = get()
    if (!state.currentSession || state.currentSession.type !== 'focus') return

    await get().completeSession()

    const newSessionCount = state.sessionCount + 1
    const settings = state.settings
    if (!settings) return

    const breakType: FocusSessionType =
      newSessionCount % settings.sessionsUntilLongBreak === 0 ? 'long-break' : 'short-break'

    await get().startBreak(userId, breakType)
    set({ sessionCount: newSessionCount })
  },

  recordInterruption: async () => {
    const state = get()
    if (!state.currentSession) return

    const updatedSession: FocusSession = {
      ...state.currentSession,
      interruptions: state.currentSession.interruptions + 1,
    }

    try {
      await db.focusSessions?.put(updatedSession)
      set({ currentSession: updatedSession })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to record interruption' })
    }
  },

  updateSettings: async (userId: string, updates: Partial<FocusSettings>) => {
    const state = get()
    const currentSettings = state.settings ?? { userId, ...DEFAULT_SETTINGS }

    const updatedSettings: FocusSettings = {
      ...currentSettings,
      ...updates,
    }

    try {
      await db.focusSettings?.put(updatedSettings)
      set({ settings: updatedSettings })

      if (!state.isActive && updates.focusDuration !== undefined) {
        set({ timeRemaining: updates.focusDuration })
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update settings' })
    }
  },

  tick: () => {
    const state = get()
    if (!state.isActive || state.isPaused) return

    const newTime = state.timeRemaining - 1
    if (newTime <= 0) {
      get().completeSession()
    } else {
      set({ timeRemaining: newTime })
    }
  },

  completeSession: async () => {
    const state = get()
    if (!state.currentSession) return

    const updatedSession: FocusSession = {
      ...state.currentSession,
      endTime: new Date(),
      completed: true,
    }

    try {
      await db.focusSessions?.put(updatedSession)

      const wasFocusSession = state.currentSession.type === 'focus'
      const newSessionCount = wasFocusSession ? state.sessionCount + 1 : state.sessionCount

      set({
        isActive: false,
        isPaused: false,
        currentSession: null,
        sessionCount: newSessionCount,
        timeRemaining: state.settings?.focusDuration ?? 25 * 60,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to complete session' })
    }
  },

  loadSessions: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const sessions = await db.focusSessions?.where('userId').equals(userId).reverse().sortBy('startTime')
      set({ sessions: sessions ?? [], loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load sessions',
        loading: false,
      })
    }
  },

  getSessionsByTask: async (taskId: string) => {
    try {
      const sessions = await db.focusSessions?.where('taskId').equals(taskId).toArray()
      return sessions ?? []
    } catch {
      return []
    }
  },
}))
