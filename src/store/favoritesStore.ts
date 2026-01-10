import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from '@/db/database'
import { logger } from '@/utils/logger'

import type { Task, Project } from '@/types'

interface FavoritesState {
  favoriteTaskIds: Set<string>
  favoriteProjectIds: Set<string>
  // Task actions
  toggleFavoriteTask: (taskId: string) => Promise<void>
  isFavoriteTask: (taskId: string) => boolean
  getFavoriteTasks: () => Promise<Task[]>
  // Project actions
  toggleFavoriteProject: (projectId: string) => Promise<void>
  isFavoriteProject: (projectId: string) => boolean
  getFavoriteProjects: () => Promise<Project[]>
  // Sync
  loadFavorites: () => Promise<void>
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteTaskIds: new Set(),
      favoriteProjectIds: new Set(),

      toggleFavoriteTask: async (taskId: string) => {
        const { favoriteTaskIds } = get()
        const newFavorites = new Set(favoriteTaskIds)

        if (newFavorites.has(taskId)) {
          newFavorites.delete(taskId)
        } else {
          newFavorites.add(taskId)
        }

        // Persist to database
        try {
          const task = await db.tasks.get(taskId)
          if (task) {
            await db.tasks.update(taskId, { isFavorite: newFavorites.has(taskId) })
          }
        } catch (error) {
          logger.error('Failed to update favorite:', error)
        }

        set({ favoriteTaskIds: newFavorites })
      },

      isFavoriteTask: (taskId: string) => {
        return get().favoriteTaskIds.has(taskId)
      },

      getFavoriteTasks: async () => {
        try {
          const tasks = await db.tasks.toArray()
          return tasks.filter((t) => (t as Task & { isFavorite?: boolean }).isFavorite === true) as Task[]
        } catch (error) {
          logger.error('Failed to get favorite tasks:', error)
          return []
        }
      },

      toggleFavoriteProject: async (projectId: string) => {
        const { favoriteProjectIds } = get()
        const newFavorites = new Set(favoriteProjectIds)

        if (newFavorites.has(projectId)) {
          newFavorites.delete(projectId)
        } else {
          newFavorites.add(projectId)
        }

        // Persist to database
        try {
          const project = await db.projects.get(projectId)
          if (project) {
            await db.projects.update(projectId, { isFavorite: newFavorites.has(projectId) })
          }
        } catch (error) {
          logger.error('Failed to update favorite:', error)
        }

        set({ favoriteProjectIds: newFavorites })
      },

      isFavoriteProject: (projectId: string) => {
        return get().favoriteProjectIds.has(projectId)
      },

      getFavoriteProjects: async () => {
        try {
          const projects = await db.projects.toArray()
          return projects.filter((p) => p.isFavorite === true) as Project[]
        } catch (error) {
          logger.error('Failed to get favorite projects:', error)
          return []
        }
      },

      loadFavorites: async () => {
        try {
          const tasks = await db.tasks.toArray()
          const projects = await db.projects.toArray()
          const favoriteTasks = tasks.filter((t) => (t as Task & { isFavorite?: boolean }).isFavorite === true)
          const favoriteProjects = projects.filter((p) => p.isFavorite === true)

          set({
            favoriteTaskIds: new Set(favoriteTasks.map((t) => t.id)),
            favoriteProjectIds: new Set(favoriteProjects.map((p) => p.id)),
          })
        } catch (error) {
          logger.error('Failed to load favorites:', error)
        }
      },
    }),
    {
      name: 'favorites-store',
    }
  )
)
