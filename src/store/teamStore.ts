import { create } from 'zustand'
import { db } from '@/db/database'
import type { Team } from '@/types'

interface TeamState {
  teams: Team[]
  currentTeamId: string | null
  isLoading: boolean
  // Actions
  loadTeams: (userId: string) => Promise<void>
  createTeam: (name: string, description?: string) => Promise<Team>
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>
  deleteTeam: (teamId: string) => Promise<void>
  setCurrentTeam: (teamId: string | null) => void
  getTeamById: (teamId: string) => Team | undefined
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentTeamId: null,
  isLoading: false,

  loadTeams: async (userId: string) => {
    set({ isLoading: true })
    try {
      // Load teams where user is owner or member
      const userTeams = await db.teams.where('ownerId').equals(userId).toArray()
      const memberTeams = await db.teamMembers
        .where('userId')
        .equals(userId)
        .toArray()

      const memberTeamIds = memberTeams.map((m) => m.teamId)
      const allTeamIds = [
        ...userTeams.map((t) => t.id),
        ...memberTeamIds,
      ]

      const teams = await db.teams.bulkGet(allTeamIds)
      const validTeams = teams.filter((t): t is Team => t !== undefined)

      set({
        teams: validTeams,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  createTeam: async (name: string, description?: string) => {
    const teamId = `team-${Date.now()}`
    const userId = localStorage.getItem('userId') || ''

    const team: Team = {
      id: teamId,
      name,
      description,
      ownerId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.teams.add(team)

    // Add owner as team member
    const teamMemberId = `tm-${Date.now()}`
    const user = await db.users.get(userId)
    await db.teamMembers.add({
      id: teamMemberId,
      teamId,
      userId,
      role: 'owner',
      joinedAt: new Date(),
      email: user?.email,
      name: user?.name,
      avatar: user?.avatar,
    })

    set((state) => ({
      teams: [...state.teams, team],
    }))

    return team
  },

  updateTeam: async (teamId: string, updates) => {
    const team = get().getTeamById(teamId)
    if (!team) return

    const updated = {
      ...team,
      ...updates,
      updatedAt: new Date(),
    }

    await db.teams.update(teamId, updated)

    set((state) => ({
      teams: state.teams.map((t) => (t.id === teamId ? updated : t)),
    }))
  },

  deleteTeam: async (teamId: string) => {
    // Delete team members
    await db.teamMembers.where('teamId').equals(teamId).delete()
    // Delete team
    await db.teams.delete(teamId)

    set((state) => ({
      teams: state.teams.filter((t) => t.id !== teamId),
      currentTeamId:
        state.currentTeamId === teamId ? null : state.currentTeamId,
    }))
  },

  setCurrentTeam: (teamId: string | null) => {
    set({ currentTeamId: teamId })
    if (teamId) {
      localStorage.setItem('currentTeamId', teamId)
    } else {
      localStorage.removeItem('currentTeamId')
    }
  },

  getTeamById: (teamId: string) => {
    return get().teams.find((t) => t.id === teamId)
  },
}))
