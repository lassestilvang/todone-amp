import { create } from 'zustand'
import { db, initializeDatabase } from '@/db/database'
import type { User, UserSettings } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  // Actions
  login: (email: string) => Promise<void>
  signup: (email: string, name: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: (userId: string) => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'en',
  timeFormat: '12h',
  dateFormat: 'MMM d, yyyy',
  startOfWeek: 0,
  defaultView: 'list',
  defaultPriority: null,
  enableKarma: true,
  dailyGoal: 5,
  weeklyGoal: 25,
  daysOff: [6], // Sunday
  vacationMode: false,
  enableNotifications: true,
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string) => {
    set({ isLoading: true })
    try {
      // TODO: Implement actual authentication with backend
      const user = await db.users.where('email').equals(email).first()
      if (!user) throw new Error('User not found')

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  signup: async (email: string, name: string) => {
    set({ isLoading: true })
    try {
      // TODO: Implement actual authentication with backend
      const existingUser = await db.users.where('email').equals(email).first()
      if (existingUser) throw new Error('User already exists')

      const userId = `user-${Date.now()}`
      const newUser: User = {
        id: userId,
        email,
        name,
        createdAt: new Date(),
        settings: defaultSettings,
        karmaPoints: 0,
        karmaLevel: 'beginner',
      }

      await db.users.add(newUser)
      await initializeDatabase(userId)

      set({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    set({
      user: null,
      isAuthenticated: false,
    })
    // TODO: Clear session/tokens
  },

  loadUser: async (userId: string) => {
    try {
      const user = await db.users.get(userId)
      if (user) {
        set({
          user,
          isAuthenticated: true,
        })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  updateUser: async (updates) => {
    const { user } = get()
    if (!user) return

    const updated = { ...user, ...updates }
    await db.users.update(user.id, updated)
    set({ user: updated })
  },

  updateSettings: async (settings) => {
    const { user } = get()
    if (!user) return

    const updatedUser = {
      ...user,
      settings: { ...user.settings, ...settings },
    }
    await db.users.update(user.id, updatedUser)
    set({ user: updatedUser })
  },
}))
