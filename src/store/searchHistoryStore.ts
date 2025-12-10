import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SearchHistoryItem {
  query: string
  timestamp: number
  type: 'task' | 'project' | 'label' | 'filter'
}

interface SearchHistoryState {
  items: SearchHistoryItem[]
  // Actions
  addSearch: (query: string, type: SearchHistoryItem['type']) => void
  removeSearch: (query: string) => void
  clearHistory: () => void
  getRecentSearches: (limit?: number) => SearchHistoryItem[]
  getSearchesByType: (type: SearchHistoryItem['type'], limit?: number) => SearchHistoryItem[]
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      items: [],

      addSearch: (query: string, type: SearchHistoryItem['type']) => {
        const { items } = get()
        // Remove if already exists to avoid duplicates, but update timestamp
        const filtered = items.filter((item) => item.query !== query || item.type !== type)
        const newItem: SearchHistoryItem = {
          query,
          type,
          timestamp: Date.now(),
        }
        // Keep only last 50 searches
        const updated = [newItem, ...filtered].slice(0, 50)
        set({ items: updated })
      },

      removeSearch: (query: string) => {
        const { items } = get()
        set({ items: items.filter((item) => item.query !== query) })
      },

      clearHistory: () => {
        set({ items: [] })
      },

      getRecentSearches: (limit = 10) => {
        const { items } = get()
        return items
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit)
      },

      getSearchesByType: (type: SearchHistoryItem['type'], limit = 10) => {
        const { items } = get()
        return items
          .filter((item) => item.type === type)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit)
      },
    }),
    {
      name: 'search-history-store',
    }
  )
)
