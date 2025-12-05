import { create } from 'zustand'

export type WidgetType =
  | 'completion-stats'
  | 'productivity-chart'
  | 'at-risk-tasks'
  | 'team-analytics'
  | 'comparison-analytics'
  | 'recent-activity'
  | 'top-performers'
  | 'member-performance'

export interface DashboardWidget {
  id: string
  type: WidgetType
  position: number
  minimized: boolean
  customSettings?: Record<string, unknown>
}

export interface DashboardLayout {
  id: string
  userId: string
  name: string
  widgets: DashboardWidget[]
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

interface DashboardState {
  layouts: DashboardLayout[]
  activeLayoutId: string | null
  editMode: boolean

  // Layout management
  loadLayouts: (userId: string) => Promise<void>
  createLayout: (userId: string, name: string) => Promise<string>
  updateLayout: (id: string, updates: Partial<DashboardLayout>) => Promise<void>
  deleteLayout: (id: string) => Promise<void>
  setActiveLayout: (layoutId: string | null) => void

  // Widget management
  addWidget: (layoutId: string, widget: Omit<DashboardWidget, 'id'>) => Promise<void>
  removeWidget: (layoutId: string, widgetId: string) => Promise<void>
  updateWidget: (layoutId: string, widgetId: string, updates: Partial<DashboardWidget>) => Promise<void>
  reorderWidgets: (layoutId: string, widgets: DashboardWidget[]) => Promise<void>
  toggleWidgetMinimize: (layoutId: string, widgetId: string) => Promise<void>

  // UI state
  setEditMode: (enabled: boolean) => void
  getActiveLayout: () => DashboardLayout | undefined
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  layouts: [],
  activeLayoutId: null,
  editMode: false,

  loadLayouts: async (userId: string) => {
    try {
      // In production, fetch from backend
      // For now, use localStorage
      const stored = localStorage.getItem(`dashboard-layouts-${userId}`)
      const layouts = stored ? JSON.parse(stored) : []
      set({ layouts })

      // Set first layout as active, or create default
      if (layouts.length > 0) {
        set({ activeLayoutId: layouts[0].id })
      }
    } catch (error) {
      console.error('Failed to load dashboard layouts:', error)
    }
  },

  createLayout: async (userId: string, name: string) => {
    try {
      const id = `layout-${Date.now()}`
      const now = new Date()

      const newLayout: DashboardLayout = {
        id,
        userId,
        name,
        widgets: [
          {
            id: `widget-completion-${Date.now()}`,
            type: 'completion-stats',
            position: 0,
            minimized: false,
          },
          {
            id: `widget-productivity-${Date.now()}`,
            type: 'productivity-chart',
            position: 1,
            minimized: false,
          },
          {
            id: `widget-at-risk-${Date.now()}`,
            type: 'at-risk-tasks',
            position: 2,
            minimized: false,
          },
        ],
        isDefault: get().layouts.length === 0,
        createdAt: now,
        updatedAt: now,
      }

      const { layouts } = get()
      const updated = [...layouts, newLayout]
      set({ layouts: updated, activeLayoutId: id })

      // Persist to localStorage
      localStorage.setItem(`dashboard-layouts-${userId}`, JSON.stringify(updated))

      return id
    } catch (error) {
      console.error('Failed to create dashboard layout:', error)
      return ''
    }
  },

  updateLayout: async (id, updates) => {
    try {
      const { layouts } = get()
      const updated = layouts.map((l) =>
        l.id === id ? { ...l, ...updates, updatedAt: new Date() } : l
      )
      set({ layouts: updated })

      // Persist to localStorage
      const userId = layouts.find((l) => l.id === id)?.userId
      if (userId) {
        localStorage.setItem(`dashboard-layouts-${userId}`, JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Failed to update dashboard layout:', error)
    }
  },

  deleteLayout: async (id) => {
    try {
      const { layouts, activeLayoutId } = get()
      const deleted = layouts.filter((l) => l.id !== id)
      set({
        layouts: deleted,
        activeLayoutId: activeLayoutId === id ? null : activeLayoutId,
      })

      // Persist to localStorage
      const userId = layouts.find((l) => l.id === id)?.userId
      if (userId) {
        localStorage.setItem(`dashboard-layouts-${userId}`, JSON.stringify(deleted))
      }
    } catch (error) {
      console.error('Failed to delete dashboard layout:', error)
    }
  },

  setActiveLayout: (layoutId: string | null) => {
    set({ activeLayoutId: layoutId })
  },

  addWidget: async (layoutId, widget) => {
    try {
      const { layouts } = get()
      const updated = layouts.map((l) => {
        if (l.id === layoutId) {
          const widgetId = `widget-${Date.now()}`
          return {
            ...l,
            widgets: [...l.widgets, { ...widget, id: widgetId }],
            updatedAt: new Date(),
          }
        }
        return l
      })
      set({ layouts: updated })

      const userId = layouts.find((l) => l.id === layoutId)?.userId
      if (userId) {
        localStorage.setItem(`dashboard-layouts-${userId}`, JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Failed to add widget:', error)
    }
  },

  removeWidget: async (layoutId, widgetId) => {
    try {
      const { layouts } = get()
      const updated = layouts.map((l) => {
        if (l.id === layoutId) {
          return {
            ...l,
            widgets: l.widgets.filter((w) => w.id !== widgetId),
            updatedAt: new Date(),
          }
        }
        return l
      })
      set({ layouts: updated })

      const userId = layouts.find((l) => l.id === layoutId)?.userId
      if (userId) {
        localStorage.setItem(`dashboard-layouts-${userId}`, JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Failed to remove widget:', error)
    }
  },

  updateWidget: async (layoutId, widgetId, updates) => {
    try {
      const { layouts } = get()
      const updated = layouts.map((l) => {
        if (l.id === layoutId) {
          return {
            ...l,
            widgets: l.widgets.map((w) =>
              w.id === widgetId ? { ...w, ...updates } : w
            ),
            updatedAt: new Date(),
          }
        }
        return l
      })
      set({ layouts: updated })

      const userId = layouts.find((l) => l.id === layoutId)?.userId
      if (userId) {
        localStorage.setItem(`dashboard-layouts-${userId}`, JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Failed to update widget:', error)
    }
  },

  reorderWidgets: async (layoutId, widgets) => {
    try {
      const { layouts } = get()
      const updated = layouts.map((l) => {
        if (l.id === layoutId) {
          return {
            ...l,
            widgets: widgets.map((w, idx) => ({ ...w, position: idx })),
            updatedAt: new Date(),
          }
        }
        return l
      })
      set({ layouts: updated })

      const userId = layouts.find((l) => l.id === layoutId)?.userId
      if (userId) {
        localStorage.setItem(`dashboard-layouts-${userId}`, JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Failed to reorder widgets:', error)
    }
  },

  toggleWidgetMinimize: async (layoutId, widgetId) => {
    try {
      const { layouts } = get()
      const updated = layouts.map((l) => {
        if (l.id === layoutId) {
          return {
            ...l,
            widgets: l.widgets.map((w) =>
              w.id === widgetId ? { ...w, minimized: !w.minimized } : w
            ),
            updatedAt: new Date(),
          }
        }
        return l
      })
      set({ layouts: updated })

      const userId = layouts.find((l) => l.id === layoutId)?.userId
      if (userId) {
        localStorage.setItem(`dashboard-layouts-${userId}`, JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Failed to toggle widget minimize:', error)
    }
  },

  setEditMode: (enabled) => {
    set({ editMode: enabled })
  },

  getActiveLayout: () => {
    const { layouts, activeLayoutId } = get()
    return layouts.find((l) => l.id === activeLayoutId)
  },
}))
