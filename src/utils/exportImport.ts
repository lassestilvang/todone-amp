import { Task, Project, Section, Label, Filter } from '@/types'

export interface ExportData {
  version: string
  exportedAt: string
  user: {
    name: string
    email: string
  }
  projects: Project[]
  sections: Section[]
  tasks: Task[]
  labels: Label[]
  filters: Filter[]
  completedTasksCount: number
  totalTasksCount: number
}

/**
 * Export all user data as JSON
 */
export function exportDataAsJSON(
  projects: Project[],
  tasks: Task[],
  sections: Section[],
  labels: Label[],
  filters: Filter[],
  userName: string,
  userEmail: string
): ExportData {
  const completedCount = tasks.filter((t) => t.completed).length

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    user: {
      name: userName,
      email: userEmail,
    },
    projects: projects.filter((p) => !p.archived),
    sections,
    tasks,
    labels,
    filters,
    completedTasksCount: completedCount,
    totalTasksCount: tasks.length,
  }
}

/**
 * Export tasks as CSV
 */
export function exportTasksAsCSV(tasks: Task[], labels: Map<string, Label>): string {
  const headers = ['Title', 'Priority', 'Due Date', 'Status', 'Labels', 'Description']
  const rows = tasks.map((task) => {
    const labelNames = task.labels?.map((id: string) => labels.get(id)?.name).join('; ') || ''
    return [
      `"${task.content.replace(/"/g, '""')}"`,
      task.priority || 'none',
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
      task.completed ? 'Done' : 'Active',
      `"${labelNames}"`,
      `"${(task.description || '').replace(/"/g, '""')}"`,
    ].join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

/**
 * Export completed tasks report as CSV
 */
export function exportCompletionReportAsCSV(
  tasks: Task[],
  labels: Map<string, Label>
): string {
  const completedTasks = tasks.filter((t) => t.completed && t.completedAt)
  const headers = ['Title', 'Completed Date', 'Duration (days)', 'Priority', 'Labels']

  const rows = completedTasks.map((task) => {
    const durationDays = task.dueDate && task.completedAt
      ? Math.floor(
        (new Date(task.completedAt).getTime() - new Date(task.dueDate).getTime()) /
            (1000 * 60 * 60 * 24)
      )
      : 0

    const labelNames = task.labels?.map((id: string) => labels.get(id)?.name).join('; ') || ''

    return [
      `"${task.content.replace(/"/g, '""')}"`,
      task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '',
      durationDays,
      task.priority || 'none',
      `"${labelNames}"`,
    ].join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

/**
 * Download data as file
 */
export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export all data and download as JSON
 */
export function downloadAllData(data: ExportData) {
  const fileName = `todone-export-${new Date().toISOString().split('T')[0]}.json`
  downloadFile(JSON.stringify(data, null, 2), fileName, 'application/json')
}

/**
 * Export tasks as CSV file
 */
export function downloadTasksAsCSV(csv: string) {
  const fileName = `todone-tasks-${new Date().toISOString().split('T')[0]}.csv`
  downloadFile(csv, fileName, 'text/csv')
}

/**
 * Export completion report as CSV file
 */
export function downloadCompletionReport(csv: string) {
  const fileName = `todone-completion-${new Date().toISOString().split('T')[0]}.csv`
  downloadFile(csv, fileName, 'text/csv')
}

/**
 * Parse imported JSON data
 */
export function parseImportedData(jsonString: string): ExportData | null {
  try {
    const data = JSON.parse(jsonString) as ExportData
    if (!data.version || !data.exportedAt) {
      return null
    }
    return data
  } catch {
    return null
  }
}

/**
 * Validate imported data structure
 */
export function validateImportedData(data: ExportData): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data.version) errors.push('Missing version information')
  if (!Array.isArray(data.projects)) errors.push('Invalid projects array')
  if (!Array.isArray(data.tasks)) errors.push('Invalid tasks array')
  if (!Array.isArray(data.sections)) errors.push('Invalid sections array')
  if (!Array.isArray(data.labels)) errors.push('Invalid labels array')
  if (!Array.isArray(data.filters)) errors.push('Invalid filters array')

  return {
    valid: errors.length === 0,
    errors,
  }
}
