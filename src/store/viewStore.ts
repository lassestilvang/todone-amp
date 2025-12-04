import { create } from 'zustand'

export type ViewType = 'list' | 'board' | 'calendar'

export type BoardColumnType = 'section' | 'priority' | 'assignee' | 'custom'

interface ViewState {
  // Global view preferences
  selectedView: ViewType
  setSelectedView: (view: ViewType) => void

  // Per-project view preferences
  projectViewPreferences: Record<
    string,
    {
      viewType: ViewType
      boardColumnType?: BoardColumnType
    }
  >

  // Board view preferences
  boardColumnType: BoardColumnType
  setBoardColumnType: (type: BoardColumnType) => void

  // List view preferences
  listGroupBy?: 'none' | 'date' | 'project' | 'priority' | 'label'
  listSortBy?: 'due-date' | 'priority' | 'created' | 'alphabetical' | 'custom'
  setListGroupBy: (groupBy: 'none' | 'date' | 'project' | 'priority' | 'label') => void
  setListSortBy: (sortBy: 'due-date' | 'priority' | 'created' | 'alphabetical' | 'custom') => void

  // Collapsed groups in list view
  collapsedGroups: Set<string>
  toggleGroupCollapsed: (groupId: string) => void

  // Save project-specific preference
  setProjectViewPreference: (projectId: string, preference: { viewType: ViewType; boardColumnType?: BoardColumnType }) => void
  getProjectViewPreference: (projectId: string) => { viewType: ViewType; boardColumnType?: BoardColumnType } | null
}

export const useViewStore = create<ViewState>((set, get) => ({
  selectedView: 'list',
  setSelectedView: (view) => {
    set({ selectedView: view })
  },

  projectViewPreferences: {},

  boardColumnType: 'section',
  setBoardColumnType: (type) => {
    set({ boardColumnType: type })
  },

  listGroupBy: 'none',
  listSortBy: 'custom',
  setListGroupBy: (groupBy) => {
    set({ listGroupBy: groupBy })
  },
  setListSortBy: (sortBy) => {
    set({ listSortBy: sortBy })
  },

  collapsedGroups: new Set(),
  toggleGroupCollapsed: (groupId) => {
    const { collapsedGroups } = get()
    const newCollapsed = new Set(collapsedGroups)
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId)
    } else {
      newCollapsed.add(groupId)
    }
    set({ collapsedGroups: newCollapsed })
  },

  setProjectViewPreference: (projectId, preference) => {
    const { projectViewPreferences } = get()
    set({
      projectViewPreferences: {
        ...projectViewPreferences,
        [projectId]: preference,
      },
    })
  },

  getProjectViewPreference: (projectId) => {
    const { projectViewPreferences } = get()
    return projectViewPreferences[projectId] ?? null
  },
}))
