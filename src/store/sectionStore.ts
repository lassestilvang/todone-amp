import { create } from 'zustand'
import { db } from '@/db/database'
import type { Section } from '@/types'

interface SectionState {
  sections: Section[]
  // Actions
  loadSections: () => Promise<void>
  createSection: (section: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateSection: (id: string, updates: Partial<Section>) => Promise<void>
  deleteSection: (id: string) => Promise<void>
  getSectionsByProject: (projectId: string) => Section[]
  reorderSections: (projectId: string, sectionIds: string[]) => Promise<void>
}

export const useSectionStore = create<SectionState>((set, get) => ({
  sections: [],

  loadSections: async () => {
    const sections = await db.sections.toArray()
    set({ sections })
  },

  createSection: async (sectionData) => {
    const id = `section-${Date.now()}`
    const now = new Date()
    const newSection: Section = {
      ...sectionData,
      id,
      createdAt: now,
      updatedAt: now,
    }
    await db.sections.add(newSection)
    const { sections } = get()
    set({ sections: [...sections, newSection] })
    return id
  },

  updateSection: async (id, updates) => {
    const now = new Date()
    await db.sections.update(id, { ...updates, updatedAt: now })
    const { sections } = get()
    set({
      sections: sections.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: now } : s)),
    })
  },

  deleteSection: async (id) => {
    await db.sections.delete(id)
    const { sections } = get()
    set({ sections: sections.filter((s) => s.id !== id) })
  },

  getSectionsByProject: (projectId: string) => {
    const { sections } = get()
    return sections.filter((s) => s.projectId === projectId).sort((a, b) => a.order - b.order)
  },

  reorderSections: async (_projectId: string, sectionIds: string[]) => {
    const now = new Date()
    const updates: Record<string, Partial<Section>> = {}

    sectionIds.forEach((sectionId, index) => {
      updates[sectionId] = { order: index, updatedAt: now }
    })

    // Update database
    for (const [sectionId, update] of Object.entries(updates)) {
      await db.sections.update(sectionId, update)
    }

    // Update store
    const { sections } = get()
    const updated = sections.map((s) =>
      updates[s.id] ? { ...s, ...updates[s.id] } : s
    )
    set({ sections: updated })
  },
}))
