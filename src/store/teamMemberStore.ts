import { create } from 'zustand'
import { db } from '@/db/database'
import type { TeamMember, TeamRole } from '@/types'

interface TeamMemberState {
  members: TeamMember[]
  isLoading: boolean
  // Actions
  loadTeamMembers: (teamId: string) => Promise<void>
  addTeamMember: (
    teamId: string,
    userId: string,
    role: TeamRole,
    email?: string,
    name?: string,
  ) => Promise<TeamMember>
  updateMemberRole: (teamId: string, userId: string, role: TeamRole) => Promise<void>
  removeMember: (teamId: string, userId: string) => Promise<void>
  getMembersByTeam: (teamId: string) => TeamMember[]
  getMemberById: (memberId: string) => TeamMember | undefined
}

export const useTeamMemberStore = create<TeamMemberState>((set, get) => ({
  members: [],
  isLoading: false,

  loadTeamMembers: async (teamId: string) => {
    set({ isLoading: true })
    try {
      const members = await db.teamMembers.where('teamId').equals(teamId).toArray()

      set({
        members,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  addTeamMember: async (
    teamId: string,
    userId: string,
    role: TeamRole,
    email?: string,
    name?: string,
  ) => {
    const memberId = `tm-${Date.now()}`

    const member: TeamMember = {
      id: memberId,
      teamId,
      userId,
      role,
      joinedAt: new Date(),
      email,
      name,
    }

    await db.teamMembers.add(member)

    set((state) => ({
      members: [...state.members, member],
    }))

    return member
  },

  updateMemberRole: async (teamId: string, userId: string, role: TeamRole) => {
    const member = get().members.find(
      (m) => m.teamId === teamId && m.userId === userId,
    )

    if (!member) return

    const updated = { ...member, role }
    await db.teamMembers.update(member.id, updated)

    set((state) => ({
      members: state.members.map((m) => (m.id === member.id ? updated : m)),
    }))
  },

  removeMember: async (teamId: string, userId: string) => {
    const member = get().members.find(
      (m) => m.teamId === teamId && m.userId === userId,
    )

    if (!member) return

    await db.teamMembers.delete(member.id)

    set((state) => ({
      members: state.members.filter((m) => m.id !== member.id),
    }))
  },

  getMembersByTeam: (teamId: string) => {
    return get().members.filter((m) => m.teamId === teamId)
  },

  getMemberById: (memberId: string) => {
    return get().members.find((m) => m.id === memberId)
  },
}))
