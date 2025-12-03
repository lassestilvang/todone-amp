import { create } from 'zustand'
import { db } from '@/db/database'
import type { Project } from '@/types'

interface ProjectState {
  projects: Project[]
  selectedProjectId: string | null
  // Actions
  loadProjects: (userId: string) => Promise<void>
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  selectProject: (id: string | null) => void
  toggleFavorite: (id: string) => Promise<void>
  getProjectsForUser: (userId: string) => Project[]
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProjectId: null,

  loadProjects: async (userId: string) => {
    const projects = await db.projects.where('ownerId').equals(userId).toArray()
    set({ projects: projects.sort((a, b) => a.order - b.order) })
  },

  createProject: async (projectData) => {
    const id = `project-${Date.now()}`
    const now = new Date()
    const newProject: Project = {
      ...projectData,
      id,
      createdAt: now,
      updatedAt: now,
    }
    await db.projects.add(newProject)
    const { projects } = get()
    set({ projects: [...projects, newProject].sort((a, b) => a.order - b.order) })
    return id
  },

  updateProject: async (id, updates) => {
    const now = new Date()
    await db.projects.update(id, { ...updates, updatedAt: now })
    const { projects } = get()
    set({
      projects: projects
        .map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now } : p))
        .sort((a, b) => a.order - b.order),
    })
  },

  deleteProject: async (id) => {
    await db.projects.delete(id)
    const { projects } = get()
    set({ projects: projects.filter((p) => p.id !== id) })
  },

  selectProject: (id) => {
    set({ selectedProjectId: id })
  },

  toggleFavorite: async (id) => {
    const { projects } = get()
    const project = projects.find((p) => p.id === id)
    if (!project) return

    const isFavorite = !project.isFavorite
    await db.projects.update(id, { isFavorite })
    set({
      projects: projects.map((p) => (p.id === id ? { ...p, isFavorite } : p)),
    })
  },

  getProjectsForUser: (userId) => {
    const { projects } = get()
    return projects.filter((p) => p.ownerId === userId)
  },
}))
