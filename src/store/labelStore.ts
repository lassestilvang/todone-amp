import { create } from 'zustand'
import { db } from '@/db/database'
import type { Label } from '@/types'

interface LabelState {
  labels: Label[]
  selectedLabels: string[] // Array of label IDs

  loadLabels: (userId: string) => Promise<void>
  createLabel: (label: Omit<Label, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>
  deleteLabel: (id: string) => Promise<void>
  toggleSelectedLabel: (labelId: string) => void
  setSelectedLabels: (labelIds: string[]) => void
  clearSelectedLabels: () => void
  getLabel: (id: string) => Label | undefined
  getLabelsByIds: (ids: string[]) => Label[]
}

// Predefined label colors
export const LABEL_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'indigo',
  'purple',
  'pink',
  'gray',
] as const

export type LabelColor = (typeof LABEL_COLORS)[number]

// Color to Tailwind class mapping
export const LABEL_COLOR_MAP: Record<LabelColor, string> = {
  red: 'bg-red-100 text-red-800 border-red-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  green: 'bg-green-100 text-green-800 border-green-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  purple: 'bg-purple-100 text-purple-800 border-purple-300',
  pink: 'bg-pink-100 text-pink-800 border-pink-300',
  gray: 'bg-gray-100 text-gray-800 border-gray-300',
}

export const useLabelStore = create<LabelState>((set, get) => ({
  labels: [],
  selectedLabels: [],

  loadLabels: async (userId: string) => {
    const labels = await db.labels.where('ownerId').equals(userId).toArray()
    set({ labels })
  },

  createLabel: async (labelData) => {
    const id = `label-${Date.now()}`
    const now = new Date()
    const newLabel: Label = {
      ...labelData,
      id,
      createdAt: now,
      updatedAt: now,
    }
    await db.labels.add(newLabel)
    const { labels } = get()
    set({ labels: [...labels, newLabel] })
    return id
  },

  updateLabel: async (id, updates) => {
    const now = new Date()
    await db.labels.update(id, {
      ...updates,
      updatedAt: now,
    })
    const { labels } = get()
    set({
      labels: labels.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: now } : l)),
    })
  },

  deleteLabel: async (id) => {
    await db.labels.delete(id)
    const { labels, selectedLabels } = get()
    set({
      labels: labels.filter((l) => l.id !== id),
      selectedLabels: selectedLabels.filter((lid) => lid !== id),
    })
  },

  toggleSelectedLabel: (labelId: string) => {
    const { selectedLabels } = get()
    if (selectedLabels.includes(labelId)) {
      set({ selectedLabels: selectedLabels.filter((id) => id !== labelId) })
    } else {
      set({ selectedLabels: [...selectedLabels, labelId] })
    }
  },

  setSelectedLabels: (labelIds: string[]) => {
    set({ selectedLabels: labelIds })
  },

  clearSelectedLabels: () => {
    set({ selectedLabels: [] })
  },

  getLabel: (id: string) => {
    const { labels } = get()
    return labels.find((l) => l.id === id)
  },

  getLabelsByIds: (ids: string[]) => {
    const { labels } = get()
    return labels.filter((l) => ids.includes(l.id))
  },
}))
