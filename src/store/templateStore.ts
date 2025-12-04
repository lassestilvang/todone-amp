import { create } from 'zustand'
import { db } from '@/db/database'
import type { Template, UserTemplate, TemplateCategory } from '@/types'

interface TemplateStoreState {
  templates: Template[]
  userTemplates: UserTemplate[]
  isLoading: boolean
  searchQuery: string

  // Query methods
  loadAllTemplates(): Promise<void>
  loadUserTemplates(userId: string): Promise<void>
  getTemplatesByCategory(category: TemplateCategory): Template[]
  getFavoriteTemplates(userId: string): Template[]
  searchTemplates(query: string): Template[]

  // Template operations
  createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template>
  updateTemplate(templateId: string, updates: Partial<Template>): Promise<void>
  deleteTemplate(templateId: string): Promise<void>

  // Favorite operations
  addFavorite(userId: string, templateId: string): Promise<void>
  removeFavorite(userId: string, templateId: string): Promise<void>
  isFavorite(userId: string, templateId: string): boolean

  // Template application
  applyTemplate(templateId: string, projectName: string, userId: string): Promise<string>

  // Utility
  setSearchQuery(query: string): void
}

export const useTemplateStore = create<TemplateStoreState>((set, get) => ({
  templates: [],
  userTemplates: [],
  isLoading: false,
  searchQuery: '',

  loadAllTemplates: async () => {
    set({ isLoading: true })
    try {
      const templates = await db.templates.toArray()
      set({ templates })
    } finally {
      set({ isLoading: false })
    }
  },

  loadUserTemplates: async (userId: string) => {
    set({ isLoading: true })
    try {
      const userTemplates = await db.userTemplates
        .where('userId')
        .equals(userId)
        .toArray()
      set({ userTemplates })
    } finally {
      set({ isLoading: false })
    }
  },

  getTemplatesByCategory: (category: TemplateCategory) => {
    return get().templates.filter((t) => t.category === category)
  },

  getFavoriteTemplates: (userId: string) => {
    const favorites = get().userTemplates
      .filter((ut) => ut.userId === userId && ut.isFavorite)
      .map((ut) => ut.templateId)

    return get().templates.filter((t) => favorites.includes(t.id))
  },

  searchTemplates: (query: string) => {
    const lowerQuery = query.toLowerCase()
    return get().templates.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        (t.description?.toLowerCase().includes(lowerQuery) ?? false)
    )
  },

  createTemplate: async (template) => {
    const now = new Date()
    const newTemplate: Template = {
      ...template,
      id: `template-${Date.now()}`,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    await db.templates.add(newTemplate)
    const templates = await db.templates.toArray()
    set({ templates })

    return newTemplate
  },

  updateTemplate: async (templateId: string, updates) => {
    await db.templates.update(templateId, {
      ...updates,
      updatedAt: new Date(),
    })

    const templates = await db.templates.toArray()
    set({ templates })
  },

  deleteTemplate: async (templateId: string) => {
    // Delete template
    await db.templates.delete(templateId)

    // Delete user template associations
    const userTemplates = await db.userTemplates
      .where('templateId')
      .equals(templateId)
      .toArray()

    for (const ut of userTemplates) {
      await db.userTemplates.delete(ut.id)
    }

    const templates = await db.templates.toArray()
    const updatedUserTemplates = await db.userTemplates.toArray()
    set({ templates, userTemplates: updatedUserTemplates })
  },

  addFavorite: async (userId: string, templateId: string) => {
    const existing = await db.userTemplates
      .where('userId')
      .equals(userId)
      .and((ut) => ut.templateId === templateId)
      .first()

    if (existing) {
      await db.userTemplates.update(existing.id, { isFavorite: true })
    } else {
      await db.userTemplates.add({
        id: `ut-${Date.now()}`,
        userId,
        templateId,
        isFavorite: true,
        createdAt: new Date(),
      })
    }

    const userTemplates = await db.userTemplates
      .where('userId')
      .equals(userId)
      .toArray()
    set({ userTemplates })
  },

  removeFavorite: async (userId: string, templateId: string) => {
    const existing = await db.userTemplates
      .where('userId')
      .equals(userId)
      .and((ut) => ut.templateId === templateId)
      .first()

    if (existing) {
      await db.userTemplates.update(existing.id, { isFavorite: false })
    }

    const userTemplates = await db.userTemplates
      .where('userId')
      .equals(userId)
      .toArray()
    set({ userTemplates })
  },

  isFavorite: (userId: string, templateId: string) => {
    return get().userTemplates.some(
      (ut) => ut.userId === userId && ut.templateId === templateId && ut.isFavorite
    )
  },

  applyTemplate: async (templateId: string, projectName: string, userId: string) => {
    const template = await db.templates.get(templateId)
    if (!template) throw new Error('Template not found')

    // Import stores to create project structure
    const { useProjectStore } = await import('@/store/projectStore')
    const { useSectionStore } = await import('@/store/sectionStore')
    const { useTaskStore } = await import('@/store/taskStore')

    // Create new project from template
    const projectState = useProjectStore.getState()
    const projectId = await projectState.createProject({
      name: projectName,
      color: '#3b82f6',
      description: template.description,
      viewType: 'list',
      isFavorite: false,
      isShared: false,
      ownerId: userId,
      order: 0,
      archived: false,
    })

    // Create sections and tasks from template data
    const sectionState = useSectionStore.getState()
    const taskState = useTaskStore.getState()

    for (const section of template.data.sections) {
      const sectionId = await sectionState.createSection({
        projectId,
        name: section.name,
        order: 0,
      })

      for (const task of section.tasks) {
        await taskState.createTask({
          projectId,
          sectionId,
          content: task.content,
          description: task.description,
          priority: task.priority,
          labels: task.labels || [],
          completed: false,
          reminders: [],
          attachments: [],
          order: 0,
        })
      }
    }

    // Update usage count
    await db.templates.update(templateId, {
      usageCount: (template.usageCount || 0) + 1,
      updatedAt: new Date(),
    })

    // Track last used
    const userTemplate = await db.userTemplates
      .where('userId')
      .equals(userId)
      .and((ut) => ut.templateId === templateId)
      .first()

    if (userTemplate) {
      await db.userTemplates.update(userTemplate.id, {
        lastUsedAt: new Date(),
      })
    } else {
      // Create new user template entry
      await db.userTemplates.add({
        id: `ut-${Date.now()}`,
        userId,
        templateId,
        isFavorite: false,
        lastUsedAt: new Date(),
        createdAt: new Date(),
      })
    }

    return projectId
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },
}))
