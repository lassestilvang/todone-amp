import { create } from 'zustand'
import { db } from '@/db/database'
import type { Comment } from '@/types'

interface CommentState {
  comments: Comment[]
  isLoading: boolean
  // Actions
  loadTaskComments: (taskId: string) => Promise<void>
  addComment: (
    taskId: string,
    userId: string,
    content: string,
    mentions?: string[],
  ) => Promise<Comment>
  updateComment: (commentId: string, content: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
  getTaskComments: (taskId: string) => Comment[]
  getCommentById: (commentId: string) => Comment | undefined
  getCommentCount: (taskId: string) => number
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  isLoading: false,

  loadTaskComments: async (taskId: string) => {
    set({ isLoading: true })
    try {
      const comments = await db.comments.where('taskId').equals(taskId).toArray()
      const activeComments = comments.filter((c) => !c.isDeleted)

      set({
        comments: activeComments,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  addComment: async (taskId: string, userId: string, content: string, mentions?: string[]) => {
    const commentId = `comment-${Date.now()}`
    const now = new Date()

    const comment: Comment = {
      id: commentId,
      taskId,
      userId,
      content,
      mentions: mentions || [],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    }

    await db.comments.add(comment)

    set((state) => ({
      comments: [...state.comments, comment],
    }))

    return comment
  },

  updateComment: async (commentId: string, content: string) => {
    const { comments } = get()
    const comment = comments.find((c) => c.id === commentId)
    if (!comment) return

    const now = new Date()
    const updated = { ...comment, content, updatedAt: now }

    await db.comments.update(commentId, updated)

    set({
      comments: comments.map((c) => (c.id === commentId ? updated : c)),
    })
  },

  deleteComment: async (commentId: string) => {
    const { comments } = get()
    const comment = comments.find((c) => c.id === commentId)
    if (!comment) return

    const now = new Date()
    const updated = { ...comment, isDeleted: true, deletedAt: now }

    await db.comments.update(commentId, updated)

    set({
      comments: comments.filter((c) => c.id !== commentId),
    })
  },

  getTaskComments: (taskId: string) => {
    const { comments } = get()
    return comments.filter((c) => c.taskId === taskId && !c.isDeleted).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  },

  getCommentById: (commentId: string) => {
    const { comments } = get()
    return comments.find((c) => c.id === commentId && !c.isDeleted)
  },

  getCommentCount: (taskId: string) => {
    const { comments } = get()
    return comments.filter((c) => c.taskId === taskId && !c.isDeleted).length
  },
}))
