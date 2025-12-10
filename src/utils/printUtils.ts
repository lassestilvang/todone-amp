import { Task } from '@/types'
import { format } from 'date-fns'

/**
 * Print utilities for tasks and reports
 */

interface PrintOptions {
  title?: string
  includeCompleted?: boolean
  includeDescriptions?: boolean
  groupByProject?: boolean
}

/**
 * Format tasks for printing
 */
export function formatTasksForPrint(tasks: Task[], options: PrintOptions = {}): string {
  const {
    title = 'Task List',
    includeCompleted = false,
    includeDescriptions = true,
    groupByProject = false,
  } = options

  const filteredTasks = includeCompleted
    ? tasks
    : tasks.filter((t) => !t.completed)

  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(title)}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          border-bottom: 2px solid #2ecc71;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        h2 {
          margin-top: 20px;
          color: #2ecc71;
          font-size: 1.3em;
        }
        .task-item {
          margin-bottom: 12px;
          padding: 10px;
          border-left: 3px solid #2ecc71;
          background-color: #f9f9f9;
        }
        .task-completed {
          opacity: 0.6;
          text-decoration: line-through;
        }
        .task-header {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
        }
        .task-checkbox {
          margin-right: 8px;
        }
        .task-title {
          font-weight: 500;
          flex: 1;
        }
        .task-priority {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 0.85em;
          margin-right: 8px;
          font-weight: 600;
        }
        .priority-p1 { background-color: #fee; color: #c00; }
        .priority-p2 { background-color: #ffd; color: #970; }
        .priority-p3 { background-color: #efe; color: #060; }
        .priority-p4 { background-color: #eef; color: #006; }
        .task-meta {
          font-size: 0.9em;
          color: #666;
          margin-top: 5px;
        }
        .task-description {
          font-size: 0.95em;
          margin-top: 8px;
          padding: 8px;
          background-color: #fff;
          border-radius: 3px;
        }
        .task-labels {
          display: flex;
          gap: 6px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .label {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.85em;
          background-color: #e8f4f8;
          color: #006;
        }
        .print-date {
          text-align: right;
          color: #999;
          font-size: 0.9em;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        @media print {
          body {
            padding: 0;
          }
          .task-item {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
  `

  if (groupByProject) {
    const grouped = filteredTasks.reduce(
      (acc, task) => {
        const key = task.projectId || 'no-project'
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(task)
        return acc
      },
      {} as Record<string, Task[]>
    )

    Object.entries(grouped).forEach(([, projectTasks]) => {
      projectTasks.forEach((task) => {
        html += formatTaskItemForPrint(task, includeDescriptions)
      })
    })
  } else {
    filteredTasks.forEach((task) => {
      html += formatTaskItemForPrint(task, includeDescriptions)
    })
  }

  html += `
      <div class="print-date">Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
    </body>
    </html>
  `

  return html
}

/**
 * Format a single task item for printing
 */
function formatTaskItemForPrint(task: Task, includeDescription: boolean): string {
  const priorityMap: Record<string, string> = {
    p1: 'Urgent',
    p2: 'High',
    p3: 'Medium',
    p4: 'Low',
  }
  const priorityLabel = (task.priority && priorityMap[task.priority]) || 'No Priority'

  const meta: string[] = []
  if (task.dueDate instanceof Date) {
    meta.push(`Due: ${format(task.dueDate, 'MMM d, yyyy')}`)
  }
  if (task.assigneeIds && task.assigneeIds.length > 0) {
    meta.push(`Assigned to: ${task.assigneeIds.join(', ')}`)
  }

  return `
    <div class="task-item ${task.completed ? 'task-completed' : ''}">
      <div class="task-header">
        <span class="task-checkbox">${task.completed ? '☑' : '☐'}</span>
        <span class="task-title">${escapeHtml(task.content)}</span>
        <span class="task-priority priority-${task.priority}">${priorityLabel}</span>
      </div>
      ${meta.length > 0 ? `<div class="task-meta">${meta.join(' | ')}</div>` : ''}
      ${includeDescription && task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
      ${task.labels && task.labels.length > 0 ? `<div class="task-labels">${task.labels.map((label) => `<span class="label">${escapeHtml(label)}</span>`).join('')}</div>` : ''}
    </div>
  `
}

/**
 * Generate productivity report for printing
 */
export function generateProductivityReport(
  _tasks: Task[],
  completedCount: number,
  totalCount: number,
  streakDays: number
): string {
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Productivity Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.8;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
          background-color: #f5f5f5;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        h1 {
          color: #2ecc71;
          margin-bottom: 10px;
        }
        .date {
          color: #999;
          font-size: 0.95em;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .stat-card {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .stat-value {
          font-size: 2.5em;
          font-weight: 700;
          color: #2ecc71;
          margin: 10px 0;
        }
        .stat-label {
          color: #666;
          font-size: 0.95em;
        }
        .section {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .section h2 {
          color: #2ecc71;
          border-bottom: 2px solid #2ecc71;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .task-list {
          list-style: none;
          padding: 0;
        }
        .task-list li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .task-list li:last-child {
          border-bottom: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Productivity Report</h1>
        <p class="date">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>
      
      <div class="stats">
        <div class="stat-card">
          <div class="stat-label">Tasks Completed</div>
          <div class="stat-value">${completedCount}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Tasks</div>
          <div class="stat-value">${totalCount}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Completion Rate</div>
          <div class="stat-value">${completionRate}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Current Streak</div>
          <div class="stat-value">${streakDays}</div>
        </div>
      </div>

      <div class="section">
        <h2>📝 Summary</h2>
        <p>You have completed <strong>${completedCount}</strong> out of <strong>${totalCount}</strong> total tasks, achieving a <strong>${completionRate}%</strong> completion rate. Your current streak is <strong>${streakDays} day${streakDays === 1 ? '' : 's'}</strong>.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Open print dialog for content
 */
export function printContent(content: string): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    console.error('Failed to open print window')
    return
  }

  printWindow.document.write(content)
  printWindow.document.close()
  printWindow.print()
}

/**
 * Print tasks directly
 */
export function printTasks(tasks: Task[], options?: PrintOptions): void {
  const html = formatTasksForPrint(tasks, options)
  printContent(html)
}

/**
 * Download print content as HTML file
 */
export function downloadPrintContent(content: string, filename: string): void {
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(content))
  element.setAttribute('download', filename)
  element.style.display = 'none'

  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

/**
 * Export tasks to PDF (requires additional library, provides HTML alternative)
 */
export function exportTasksAsHTML(tasks: Task[], filename: string = 'tasks.html', options?: PrintOptions): void {
  const html = formatTasksForPrint(tasks, options)
  downloadPrintContent(html, filename)
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}
