import { create } from 'zustand'

export interface QuickAddItem {
  id: string
  content: string
  timestamp: Date
}

export interface QuickAddState {
  isOpen: boolean
  recentItems: QuickAddItem[]
  
  openQuickAdd: () => void
  closeQuickAdd: () => void
  addToRecent: (content: string) => void
  clearRecent: () => void
}

export const useQuickAddStore = create<QuickAddState>((set, get) => ({
  isOpen: false,
  recentItems: [],

  openQuickAdd: () => {
    set({ isOpen: true })
  },

  closeQuickAdd: () => {
    set({ isOpen: false })
  },

  addToRecent: (content: string) => {
    const { recentItems } = get()
    const newItem: QuickAddItem = {
      id: `recent-${Date.now()}`,
      content,
      timestamp: new Date(),
    }
    
    // Keep last 10 items
    const updated = [newItem, ...recentItems].slice(0, 10)
    set({ recentItems: updated })
    
    // Persist to localStorage
    try {
      localStorage.setItem('quickAddHistory', JSON.stringify(updated))
    } catch {
      // Silent fail if localStorage not available
    }
  },

  clearRecent: () => {
    set({ recentItems: [] })
    try {
      localStorage.removeItem('quickAddHistory')
    } catch {
      // Silent fail
    }
  },
}))

// Load recent items from localStorage on init
export function initializeQuickAddStore() {
  try {
    const stored = localStorage.getItem('quickAddHistory')
    if (stored) {
      const items = JSON.parse(stored) as Array<{
        id: string
        content: string
        timestamp: string | Date
      }>
      // Convert timestamp strings back to Date objects
      const convertedItems: QuickAddItem[] = items.map((item) => ({
        ...item,
        timestamp: typeof item.timestamp === 'string' ? new Date(item.timestamp) : item.timestamp,
      }))
      useQuickAddStore.setState({ recentItems: convertedItems })
    }
  } catch {
    // Silent fail
  }
}
