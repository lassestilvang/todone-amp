import { create } from 'zustand'
import { db } from '@/db/database'
import type { ProjectShare, UserRole } from '@/types'

interface ShareStoreState {
  projectShares: ProjectShare[]
  isLoading: boolean

  // Query methods
  loadProjectShares(projectId: string): Promise<void>
  getProjectShares(projectId: string): ProjectShare[]
  getProjectsSharedWithUser(userId: string): ProjectShare[]
  getSharePermission(projectId: string, userId: string): ProjectShare | undefined

  // Share operations
  shareProject(projectId: string, userId: string, role: UserRole): Promise<void>
  updateSharePermission(shareId: string, role: UserRole): Promise<void>
  unshareProject(shareId: string): Promise<void>
  unshareProjectFromUser(projectId: string, userId: string): Promise<void>

  // Batch operations
  shareProjectWithMultiple(projectId: string, userIds: string[], role: UserRole): Promise<void>
  shareProjectWithTeam(projectId: string, teamId: string, role: UserRole): Promise<void>

  // Share link operations
  generateShareLink(projectId: string): string
  revokeShareLink(projectId: string): Promise<void>

  // Utility
  canEditProject(projectId: string, userId: string): boolean
  canAdminProject(projectId: string, userId: string): boolean
  canViewProject(projectId: string, userId: string): boolean
}

export const useShareStore = create<ShareStoreState>((set, get) => ({
  projectShares: [],
  isLoading: false,

  loadProjectShares: async (projectId: string) => {
    set({ isLoading: true })
    try {
      const shares = await db.projectShares.where('projectId').equals(projectId).toArray()
      set({ projectShares: shares })
    } finally {
      set({ isLoading: false })
    }
  },

  getProjectShares: (projectId: string) => {
    return get().projectShares.filter((s) => s.projectId === projectId)
  },

  getProjectsSharedWithUser: (userId: string) => {
    return get().projectShares.filter((s) => s.userId === userId)
  },

  getSharePermission: (projectId: string, userId: string) => {
    return get().projectShares.find((s) => s.projectId === projectId && s.userId === userId)
  },

  shareProject: async (projectId: string, userId: string, role: UserRole) => {
    // Check if already shared
    const existing = await db.projectShares
      .where('projectId')
      .equals(projectId)
      .and((s) => s.userId === userId)
      .first()

    if (existing) {
      // Update existing share
      await db.projectShares.update(existing.id, { role })
      // Log activity
      await logShareActivity(projectId, userId, 'permissionChanged', existing.role, role)
    } else {
      // Create new share
      await db.projectShares.add({
        id: `share-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        projectId,
        userId,
        role,
        invitedBy: '', // Will be set by caller
        invitedAt: new Date(),
      })
      // Log activity
      await logShareActivity(projectId, userId, 'shared', undefined, role)
    }

    // Reload shares
    const shares = await db.projectShares.where('projectId').equals(projectId).toArray()
    set({ projectShares: shares })
  },

  updateSharePermission: async (shareId: string, role: UserRole) => {
    await db.projectShares.update(shareId, { role })

    const shares = await db.projectShares.toArray()
    set({ projectShares: shares })
  },

  unshareProject: async (shareId: string) => {
    const share = await db.projectShares.get(shareId)
    if (!share) return

    await db.projectShares.delete(shareId)
    // Log activity
    await logShareActivity(share.projectId, share.userId, 'unshared', share.role, undefined)

    const shares = await db.projectShares.where('projectId').equals(share.projectId).toArray()
    set({ projectShares: shares })
  },

  unshareProjectFromUser: async (projectId: string, userId: string) => {
    const share = await db.projectShares
      .where('projectId')
      .equals(projectId)
      .and((s) => s.userId === userId)
      .first()

    if (share) {
      await db.projectShares.delete(share.id)
      const shares = await db.projectShares.where('projectId').equals(projectId).toArray()
      set({ projectShares: shares })
    }
  },

  shareProjectWithMultiple: async (projectId: string, userIds: string[], role: UserRole) => {
    const shares: ProjectShare[] = userIds.map((userId) => ({
      id: `share-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      projectId,
      userId,
      role,
      invitedBy: '',
      invitedAt: new Date(),
    }))

    // Check for existing shares and only add new ones
    const existing = await db.projectShares.where('projectId').equals(projectId).toArray()

    const newShares = shares.filter(
      (s) => !existing.some((e) => e.userId === s.userId && e.projectId === s.projectId)
    )

    if (newShares.length > 0) {
      await db.projectShares.bulkAdd(newShares)
    }

    const updated = await db.projectShares.where('projectId').equals(projectId).toArray()
    set({ projectShares: updated })
  },

  shareProjectWithTeam: async (projectId: string, teamId: string, role: UserRole) => {
    const { useTeamMemberStore } = await import('@/store/teamMemberStore')
    const memberState = useTeamMemberStore.getState()
    const teamMembers = memberState.members.filter((m) => m.teamId === teamId)

    if (teamMembers.length === 0) return

    const userIds = teamMembers.map((m) => m.userId)
    await get().shareProjectWithMultiple(projectId, userIds, role)
  },

  generateShareLink: (projectId: string) => {
    const linkId = `link-${projectId}-${Date.now()}`
    return `${window.location.origin}/shared/${linkId}`
  },

  revokeShareLink: async (projectId: string) => {
    // Remove all member-level shares for this project
    const shares = await db.projectShares
      .where('projectId')
      .equals(projectId)
      .and((s) => s.role === 'member')
      .toArray()

    for (const share of shares) {
      await db.projectShares.delete(share.id)
    }

    const updated = await db.projectShares.where('projectId').equals(projectId).toArray()
    set({ projectShares: updated })
  },

  canEditProject: (projectId: string, userId: string) => {
    const share = get().getSharePermission(projectId, userId)
    return share ? share.role === 'member' || share.role === 'admin' : false
  },

  canAdminProject: (projectId: string, userId: string) => {
    const share = get().getSharePermission(projectId, userId)
    return share ? share.role === 'admin' || share.role === 'owner' : false
  },

  canViewProject: (projectId: string, userId: string) => {
    const share = get().getSharePermission(projectId, userId)
    return share ? share.role === 'member' || share.role === 'admin' || share.role === 'owner' : false
  },
}))

/**
 * Helper to log share-related activities
 */
async function logShareActivity(
  projectId: string,
  userId: string,
  action: 'shared' | 'unshared' | 'permissionChanged' | 'memberAdded' | 'memberRemoved',
  oldValue?: unknown,
  newValue?: unknown,
): Promise<void> {
  try {
    const { useActivityStore } = await import('@/store/activityStore')
    const activityState = useActivityStore.getState()
    // Use projectId as taskId for sharing activities
    await activityState.addActivity(projectId, userId, action, undefined, oldValue, newValue)
  } catch {
    // Activity logging is non-critical, silently fail
  }
}
