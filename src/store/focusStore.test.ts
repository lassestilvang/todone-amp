import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFocusStore } from './focusStore'

vi.mock('@/db/database', () => ({
  db: {
    focusSessions: {
      add: vi.fn(),
      put: vi.fn(),
      get: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(),
          reverse: vi.fn(() => ({ sortBy: vi.fn() })),
        })),
      })),
    },
    focusSettings: {
      add: vi.fn(),
      put: vi.fn(),
      get: vi.fn(),
    },
  },
}))

describe('FocusStore', () => {
  beforeEach(() => {
    useFocusStore.setState({
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
    })
  })

  describe('initializeSettings', () => {
    it('should create default settings for new users', async () => {
      const { db } = await import('@/db/database')
      vi.mocked(db.focusSettings?.get).mockResolvedValue(undefined)
      vi.mocked(db.focusSettings?.add).mockResolvedValue('settings-1')

      const store = useFocusStore.getState()
      await store.initializeSettings('user-1')

      const state = useFocusStore.getState()
      expect(state.settings).toBeDefined()
      expect(state.settings?.userId).toBe('user-1')
      expect(state.settings?.focusDuration).toBe(25 * 60)
      expect(state.settings?.shortBreakDuration).toBe(5 * 60)
      expect(state.settings?.longBreakDuration).toBe(15 * 60)
      expect(state.loading).toBe(false)
    })

    it('should load existing settings', async () => {
      const { db } = await import('@/db/database')
      const existingSettings = {
        userId: 'user-1',
        focusDuration: 30 * 60,
        shortBreakDuration: 10 * 60,
        longBreakDuration: 20 * 60,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: true,
        autoStartFocus: false,
        soundEnabled: true,
        soundType: 'bell' as const,
      }
      vi.mocked(db.focusSettings?.get).mockResolvedValue(existingSettings)

      const store = useFocusStore.getState()
      await store.initializeSettings('user-1')

      const state = useFocusStore.getState()
      expect(state.settings?.focusDuration).toBe(30 * 60)
      expect(state.timeRemaining).toBe(30 * 60)
    })

    it('should set error on failure', async () => {
      const { db } = await import('@/db/database')
      vi.mocked(db.focusSettings?.get).mockRejectedValue(new Error('DB Error'))

      const store = useFocusStore.getState()
      await store.initializeSettings('user-1')

      const state = useFocusStore.getState()
      expect(state.error).toBe('DB Error')
      expect(state.loading).toBe(false)
    })
  })

  describe('startFocus', () => {
    it('should start a focus session and update state', async () => {
      const { db } = await import('@/db/database')
      const settings = {
        userId: 'user-1',
        focusDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartFocus: false,
        soundEnabled: true,
        soundType: 'bell' as const,
      }
      vi.mocked(db.focusSettings?.get).mockResolvedValue(settings)
      vi.mocked(db.focusSessions?.add).mockResolvedValue('session-1')

      useFocusStore.setState({ settings })

      const store = useFocusStore.getState()
      await store.startFocus('user-1', 'task-123')

      const state = useFocusStore.getState()
      expect(state.isActive).toBe(true)
      expect(state.isPaused).toBe(false)
      expect(state.currentSession).toBeDefined()
      expect(state.currentSession?.type).toBe('focus')
      expect(state.currentSession?.userId).toBe('user-1')
      expect(state.currentSession?.taskId).toBe('task-123')
      expect(state.linkedTaskId).toBe('task-123')
      expect(state.timeRemaining).toBe(25 * 60)
    })

    it('should initialize settings if not present', async () => {
      const { db } = await import('@/db/database')
      const settings = {
        userId: 'user-1',
        focusDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartFocus: false,
        soundEnabled: true,
        soundType: 'bell' as const,
      }
      vi.mocked(db.focusSettings?.get).mockResolvedValue(settings)
      vi.mocked(db.focusSessions?.add).mockResolvedValue('session-1')

      const store = useFocusStore.getState()
      await store.startFocus('user-1')

      const state = useFocusStore.getState()
      expect(state.isActive).toBe(true)
      expect(state.currentSession).toBeDefined()
    })
  })

  describe('pauseFocus / resumeFocus', () => {
    it('should toggle isPaused state when pausing', () => {
      useFocusStore.setState({ isActive: true, isPaused: false })

      const store = useFocusStore.getState()
      store.pauseFocus()

      expect(useFocusStore.getState().isPaused).toBe(true)
    })

    it('should toggle isPaused state when resuming', () => {
      useFocusStore.setState({ isActive: true, isPaused: true })

      const store = useFocusStore.getState()
      store.resumeFocus()

      expect(useFocusStore.getState().isPaused).toBe(false)
    })
  })

  describe('stopFocus', () => {
    it('should stop current session and reset state', async () => {
      const { db } = await import('@/db/database')
      vi.mocked(db.focusSessions?.put).mockResolvedValue('session-1')

      const currentSession = {
        id: 'session-1',
        userId: 'user-1',
        taskId: 'task-123',
        startTime: new Date(),
        endTime: null,
        duration: 25 * 60,
        type: 'focus' as const,
        completed: false,
        interruptions: 0,
      }

      useFocusStore.setState({
        isActive: true,
        isPaused: false,
        currentSession,
        linkedTaskId: 'task-123',
        timeRemaining: 1000,
        settings: {
          userId: 'user-1',
          focusDuration: 25 * 60,
          shortBreakDuration: 5 * 60,
          longBreakDuration: 15 * 60,
          sessionsUntilLongBreak: 4,
          autoStartBreaks: false,
          autoStartFocus: false,
          soundEnabled: true,
          soundType: 'bell',
        },
      })

      const store = useFocusStore.getState()
      await store.stopFocus()

      const state = useFocusStore.getState()
      expect(state.isActive).toBe(false)
      expect(state.isPaused).toBe(false)
      expect(state.currentSession).toBeNull()
      expect(state.linkedTaskId).toBeNull()
      expect(state.timeRemaining).toBe(25 * 60)
    })

    it('should do nothing if no current session', async () => {
      useFocusStore.setState({ currentSession: null })

      const store = useFocusStore.getState()
      await store.stopFocus()

      expect(useFocusStore.getState().isActive).toBe(false)
    })
  })

  describe('tick', () => {
    it('should decrement timeRemaining', () => {
      useFocusStore.setState({
        isActive: true,
        isPaused: false,
        timeRemaining: 100,
        currentSession: {
          id: 'session-1',
          userId: 'user-1',
          taskId: null,
          startTime: new Date(),
          endTime: null,
          duration: 25 * 60,
          type: 'focus',
          completed: false,
          interruptions: 0,
        },
      })

      const store = useFocusStore.getState()
      store.tick()

      expect(useFocusStore.getState().timeRemaining).toBe(99)
    })

    it('should not tick when paused', () => {
      useFocusStore.setState({
        isActive: true,
        isPaused: true,
        timeRemaining: 100,
      })

      const store = useFocusStore.getState()
      store.tick()

      expect(useFocusStore.getState().timeRemaining).toBe(100)
    })

    it('should not tick when not active', () => {
      useFocusStore.setState({
        isActive: false,
        isPaused: false,
        timeRemaining: 100,
      })

      const store = useFocusStore.getState()
      store.tick()

      expect(useFocusStore.getState().timeRemaining).toBe(100)
    })
  })

  describe('completeSession', () => {
    it('should mark session as completed and increment sessionCount for focus sessions', async () => {
      const { db } = await import('@/db/database')
      vi.mocked(db.focusSessions?.put).mockResolvedValue('session-1')

      const currentSession = {
        id: 'session-1',
        userId: 'user-1',
        taskId: null,
        startTime: new Date(),
        endTime: null,
        duration: 25 * 60,
        type: 'focus' as const,
        completed: false,
        interruptions: 0,
      }

      useFocusStore.setState({
        isActive: true,
        currentSession,
        sessionCount: 2,
        settings: {
          userId: 'user-1',
          focusDuration: 25 * 60,
          shortBreakDuration: 5 * 60,
          longBreakDuration: 15 * 60,
          sessionsUntilLongBreak: 4,
          autoStartBreaks: false,
          autoStartFocus: false,
          soundEnabled: true,
          soundType: 'bell',
        },
      })

      const store = useFocusStore.getState()
      await store.completeSession()

      const state = useFocusStore.getState()
      expect(state.isActive).toBe(false)
      expect(state.currentSession).toBeNull()
      expect(state.sessionCount).toBe(3)
    })

    it('should not increment sessionCount for break sessions', async () => {
      const { db } = await import('@/db/database')
      vi.mocked(db.focusSessions?.put).mockResolvedValue('session-1')

      const currentSession = {
        id: 'session-1',
        userId: 'user-1',
        taskId: null,
        startTime: new Date(),
        endTime: null,
        duration: 5 * 60,
        type: 'short-break' as const,
        completed: false,
        interruptions: 0,
      }

      useFocusStore.setState({
        isActive: true,
        currentSession,
        sessionCount: 2,
        settings: {
          userId: 'user-1',
          focusDuration: 25 * 60,
          shortBreakDuration: 5 * 60,
          longBreakDuration: 15 * 60,
          sessionsUntilLongBreak: 4,
          autoStartBreaks: false,
          autoStartFocus: false,
          soundEnabled: true,
          soundType: 'bell',
        },
      })

      const store = useFocusStore.getState()
      await store.completeSession()

      const state = useFocusStore.getState()
      expect(state.sessionCount).toBe(2)
    })

    it('should do nothing if no current session', async () => {
      useFocusStore.setState({ currentSession: null, sessionCount: 2 })

      const store = useFocusStore.getState()
      await store.completeSession()

      expect(useFocusStore.getState().sessionCount).toBe(2)
    })
  })

  describe('recordInterruption', () => {
    it('should increment interruption count on current session', async () => {
      const { db } = await import('@/db/database')
      vi.mocked(db.focusSessions?.put).mockResolvedValue('session-1')

      const currentSession = {
        id: 'session-1',
        userId: 'user-1',
        taskId: null,
        startTime: new Date(),
        endTime: null,
        duration: 25 * 60,
        type: 'focus' as const,
        completed: false,
        interruptions: 2,
      }

      useFocusStore.setState({ currentSession })

      const store = useFocusStore.getState()
      await store.recordInterruption()

      const state = useFocusStore.getState()
      expect(state.currentSession?.interruptions).toBe(3)
    })

    it('should do nothing if no current session', async () => {
      useFocusStore.setState({ currentSession: null })

      const store = useFocusStore.getState()
      await store.recordInterruption()

      expect(useFocusStore.getState().currentSession).toBeNull()
    })
  })

  describe('updateSettings', () => {
    it('should update settings properly', async () => {
      const { db } = await import('@/db/database')
      vi.mocked(db.focusSettings?.put).mockResolvedValue('settings-1')

      const existingSettings = {
        userId: 'user-1',
        focusDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartFocus: false,
        soundEnabled: true,
        soundType: 'bell' as const,
      }

      useFocusStore.setState({ settings: existingSettings, isActive: false })

      const store = useFocusStore.getState()
      await store.updateSettings('user-1', { focusDuration: 30 * 60, soundEnabled: false })

      const state = useFocusStore.getState()
      expect(state.settings?.focusDuration).toBe(30 * 60)
      expect(state.settings?.soundEnabled).toBe(false)
      expect(state.settings?.shortBreakDuration).toBe(5 * 60)
    })

    it('should update timeRemaining when not active and focusDuration changes', async () => {
      const { db } = await import('@/db/database')
      vi.mocked(db.focusSettings?.put).mockResolvedValue('settings-1')

      const existingSettings = {
        userId: 'user-1',
        focusDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartFocus: false,
        soundEnabled: true,
        soundType: 'bell' as const,
      }

      useFocusStore.setState({
        settings: existingSettings,
        isActive: false,
        timeRemaining: 25 * 60,
      })

      const store = useFocusStore.getState()
      await store.updateSettings('user-1', { focusDuration: 45 * 60 })

      const state = useFocusStore.getState()
      expect(state.timeRemaining).toBe(45 * 60)
    })

    it('should not update timeRemaining when active', async () => {
      const { db } = await import('@/db/database')
      vi.mocked(db.focusSettings?.put).mockResolvedValue('settings-1')

      const existingSettings = {
        userId: 'user-1',
        focusDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartFocus: false,
        soundEnabled: true,
        soundType: 'bell' as const,
      }

      useFocusStore.setState({
        settings: existingSettings,
        isActive: true,
        timeRemaining: 1000,
      })

      const store = useFocusStore.getState()
      await store.updateSettings('user-1', { focusDuration: 45 * 60 })

      const state = useFocusStore.getState()
      expect(state.timeRemaining).toBe(1000)
    })

    it('should create default settings if none exist', async () => {
      const { db } = await import('@/db/database')
      vi.mocked(db.focusSettings?.put).mockResolvedValue('settings-1')

      useFocusStore.setState({ settings: null, isActive: false })

      const store = useFocusStore.getState()
      await store.updateSettings('user-1', { soundEnabled: false })

      const state = useFocusStore.getState()
      expect(state.settings?.userId).toBe('user-1')
      expect(state.settings?.soundEnabled).toBe(false)
      expect(state.settings?.focusDuration).toBe(25 * 60)
    })
  })
})
