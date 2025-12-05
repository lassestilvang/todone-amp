import { create } from 'zustand'
import { db } from '@/db/database'
import type { Filter, Task } from '@/types'
import {
  parseAndEvaluateFilter,
  applyAdvancedFilter,
  getFilterSuggestions,
  getFieldNameSuggestions,
  getValueSuggestions,
} from '@/utils/filterParser'

interface SavedQuery {
  id: string
  query: string
  label: string
  usageCount: number
  lastUsedAt: Date
}

interface FilterState {
  filters: Filter[]
  activeFilterId: string | null
  savedQueries: SavedQuery[]
  queryCache: Map<string, Task[]>
  recentQueries: string[]

  loadFilters: (userId: string) => Promise<void>
  createFilter: (filter: Omit<Filter, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateFilter: (id: string, updates: Partial<Filter>) => Promise<void>
  deleteFilter: (id: string) => Promise<void>
  setActiveFilter: (filterId: string | null) => void
  toggleFilterFavorite: (filterId: string) => Promise<void>
  getFilter: (id: string) => Filter | undefined
  applyFilterQuery: (query: string, tasks: Task[]) => Task[]
  evaluateTask: (task: Task, query: string) => boolean

  // Query caching and suggestions
  saveQuery: (query: string, label: string) => void
  deleteSavedQuery: (id: string) => void
  getSuggestions: (partial: string) => string[]
  getFieldSuggestions: () => string[]
  getValueSuggestions: (field: string) => string[]
  clearQueryCache: () => void
  addRecentQuery: (query: string) => void
  getRecentQueries: () => string[]
}

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: [],
  activeFilterId: null,
  savedQueries: [],
  queryCache: new Map(),
  recentQueries: [],

  loadFilters: async (userId: string) => {
    const filters = await db.filters.where('ownerId').equals(userId).toArray()
    set({ filters })
  },

  createFilter: async (filterData) => {
    const id = `filter-${Date.now()}`
    const now = new Date()
    const newFilter: Filter = {
      ...filterData,
      id,
      createdAt: now,
      updatedAt: now,
    }
    await db.filters.add(newFilter)
    const { filters } = get()
    set({ filters: [...filters, newFilter] })
    return id
  },

  updateFilter: async (id, updates) => {
    const now = new Date()
    await db.filters.update(id, {
      ...updates,
      updatedAt: now,
    })
    const { filters } = get()
    set({
      filters: filters.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: now } : f)),
    })
  },

  deleteFilter: async (id) => {
    await db.filters.delete(id)
    const { filters, activeFilterId } = get()
    set({
      filters: filters.filter((f) => f.id !== id),
      activeFilterId: activeFilterId === id ? null : activeFilterId,
    })
  },

  setActiveFilter: (filterId: string | null) => {
    set({ activeFilterId: filterId })
  },

  toggleFilterFavorite: async (filterId: string) => {
    const { filters } = get()
    const filter = filters.find((f) => f.id === filterId)
    if (!filter) return

    const now = new Date()
    const updated = !filter.isFavorite
    await db.filters.update(filterId, {
      isFavorite: updated,
      updatedAt: now,
    })
    set({
      filters: filters.map((f) =>
        f.id === filterId ? { ...f, isFavorite: updated, updatedAt: now } : f
      ),
    })
  },

  getFilter: (id: string) => {
    const { filters } = get()
    return filters.find((f) => f.id === id)
  },

  applyFilterQuery: (query: string, tasks: Task[]) => {
    const { queryCache } = get()
    const cached = queryCache.get(query)
    if (cached) {
      return cached
    }

    const result = applyAdvancedFilter(query, tasks)
    queryCache.set(query, result)
    return result
  },

  evaluateTask: (task: Task, query: string) => {
    return parseAndEvaluateFilter(query, task)
  },

  // Query caching and suggestions
  saveQuery: (query: string, label: string) => {
    const { savedQueries } = get()
    const id = `query-${Date.now()}`
    const newQuery: SavedQuery = {
      id,
      query,
      label,
      usageCount: 0,
      lastUsedAt: new Date(),
    }
    set({ savedQueries: [...savedQueries, newQuery] })
  },

  deleteSavedQuery: (id: string) => {
    const { savedQueries } = get()
    set({ savedQueries: savedQueries.filter((q) => q.id !== id) })
  },

  getSuggestions: (partial: string) => {
    if (!partial.trim()) {
      return getFilterSuggestions()
    }

    const { savedQueries } = get()
    const lowerPartial = partial.toLowerCase()

    // Combine saved queries and default suggestions
    const allSuggestions = [
      ...getFilterSuggestions(),
      ...savedQueries.map((q) => q.query),
    ]

    return allSuggestions.filter((s) => s.toLowerCase().includes(lowerPartial))
  },

  getFieldSuggestions: () => {
    return getFieldNameSuggestions()
  },

  getValueSuggestions: (field: string) => {
    return getValueSuggestions(field)
  },

  clearQueryCache: () => {
    set({ queryCache: new Map() })
  },

  addRecentQuery: (query: string) => {
    const { recentQueries } = get()
    const updated = [query, ...recentQueries.filter((q) => q !== query)].slice(0, 10)
    set({ recentQueries: updated })
  },

  getRecentQueries: () => {
    const { recentQueries } = get()
    return recentQueries
  },
}))
