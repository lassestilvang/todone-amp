export interface ColumnConfig {
  id: string
  label: string
  visible: boolean
  sortable: boolean
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'title', label: 'Title', visible: true, sortable: true },
  { id: 'project', label: 'Project', visible: true, sortable: true },
  { id: 'due-date', label: 'Due Date', visible: true, sortable: true },
  { id: 'priority', label: 'Priority', visible: true, sortable: true },
  { id: 'labels', label: 'Labels', visible: false, sortable: false },
  { id: 'assignee', label: 'Assignee', visible: false, sortable: true },
]
