import { create } from 'zustand'
import { db } from '@/db/database'
import type { Filter } from '@/types'

interface FilterState {
  filters: Filter[]
  activeFilterId: string | null

  loadFilters: (userId: string) => Promise<void>
  createFilter: (filter: Omit<Filter, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateFilter: (id: string, updates: Partial<Filter>) => Promise<void>
  deleteFilter: (id: string) => Promise<void>
  setActiveFilter: (filterId: string | null) => void
  toggleFilterFavorite: (filterId: string) => Promise<void>
  getFilter: (id: string) => Filter | undefined
}

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: [],
  activeFilterId: null,

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
}))
