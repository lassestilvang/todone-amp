import { describe, it, expect, beforeEach, mock} from 'bun:test'
import { useFocusStore } from './focusStore'

mock.module('@/db/database', () => ({
  db: {
    focusSessions: {
      add: mock(() => Promise.resolve('session-1')),
      put: mock(() => Promise.resolve('session-1')),
      get: mock(() => Promise.resolve(undefined)),
      where: mock(() => ({
        equals: mock(() => ({
          toArray: mock(() => Promise.resolve([])),
          reverse: mock(() => ({ sortBy: mock(() => Promise.resolve([])) })),
        })),
      })),
    },
    focusSettings: {
      add: mock(() => Promise.resolve('settings-1')),
      put: mock(() => Promise.resolve('settings-1')),
      get: mock(() => Promise.resolve(undefined)),
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
