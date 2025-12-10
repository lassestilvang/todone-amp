import { describe, it, expect, beforeEach } from 'vitest'
import { useViewStore } from '@/store/viewStore'
import type { ColumnConfig } from '@/utils/columnConfig'

describe('viewStore', () => {
  beforeEach(() => {
    // Reset store
    useViewStore.setState({
      selectedView: 'list',
      listColumns: undefined,
    })
  })

  it('should set list columns', () => {
    const columns: ColumnConfig[] = [
      { id: 'title', label: 'Title', visible: true, sortable: true },
      { id: 'project', label: 'Project', visible: false, sortable: true },
    ]

    useViewStore.getState().setListColumns(columns)

    expect(useViewStore.getState().listColumns).toEqual(columns)
  })

  it('should update column visibility', () => {
    const columns: ColumnConfig[] = [
      { id: 'title', label: 'Title', visible: true, sortable: true },
      { id: 'project', label: 'Project', visible: false, sortable: true },
    ]

    useViewStore.getState().setListColumns(columns)

    // Hide title column
    const state = useViewStore.getState()
    const updated = state.listColumns!.map((col) =>
      col.id === 'title' ? { ...col, visible: false } : col
    )
    useViewStore.getState().setListColumns(updated)

    expect(useViewStore.getState().listColumns![0].visible).toBe(false)
  })

  it('should set selected view', () => {
    useViewStore.getState().setSelectedView('board')

    expect(useViewStore.getState().selectedView).toBe('board')
  })

  it('should set list grouping', () => {
    useViewStore.getState().setListGroupBy('date')

    expect(useViewStore.getState().listGroupBy).toBe('date')
  })

  it('should set list sorting', () => {
    useViewStore.getState().setListSortBy('priority')

    expect(useViewStore.getState().listSortBy).toBe('priority')
  })

  it('should toggle group collapsed state', () => {
    useViewStore.getState().toggleGroupCollapsed('group-1')

    expect(useViewStore.getState().collapsedGroups.has('group-1')).toBe(true)

    useViewStore.getState().toggleGroupCollapsed('group-1')
    expect(useViewStore.getState().collapsedGroups.has('group-1')).toBe(false)
  })
})
