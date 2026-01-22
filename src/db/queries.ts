/**
 * Optimized IndexedDB query utilities for large datasets
 *
 * This module provides efficient query methods that use indexed lookups
 * instead of loading all records into memory. These are designed for
 * datasets with 1000+ tasks.
 *
 * Key optimizations:
 * 1. Use compound indexes for common query patterns
 * 2. Leverage .where() clauses instead of .filter() after .toArray()
 * 3. Support pagination with offset/limit
 * 4. Cache frequently accessed data
 * 5. Batch operations for bulk updates
 */

import { db } from './database'
import type { Task, Project, Label } from '@/types'

export interface PaginationOptions {
  offset?: number
  limit?: number
}

export interface TaskQueryOptions extends PaginationOptions {
  projectId?: string
  sectionId?: string
  completed?: boolean
  createdBy?: string
  assigneeId?: string
  dueBefore?: Date
  dueAfter?: Date
  priority?: Task['priority']
  hasLabels?: string[]
}

export interface DateRangeOptions {
  start: Date
  end: Date
}

/**
 * Query tasks with indexed lookups - avoids loading all tasks into memory
 */
export async function queryTasks(options: TaskQueryOptions = {}): Promise<Task[]> {
  const { offset = 0, limit = 100, projectId, sectionId, completed } = options

  let collection = db.tasks.toCollection()

  // Use indexed query if filtering by projectId (most common)
  if (projectId !== undefined) {
    if (sectionId !== undefined) {
      // Use compound index [sectionId+order]
      collection = db.tasks.where('[sectionId+order]').between([sectionId, -Infinity], [sectionId, Infinity])
    } else {
      // Use compound index [projectId+order]
      collection = db.tasks.where('[projectId+order]').between([projectId, -Infinity], [projectId, Infinity])
    }
  } else if (completed !== undefined) {
    // Use the completed index
    collection = db.tasks.where('completed').equals(completed ? 1 : 0)
  }

  // Apply additional filters in memory (these are less common)
  if (options.createdBy !== undefined) {
    collection = collection.filter((task) => task.createdBy === options.createdBy)
  }

  if (options.assigneeId !== undefined) {
    collection = collection.filter(
      (task) => task.assigneeIds?.includes(options.assigneeId!) ?? false
    )
  }

  if (options.dueBefore !== undefined) {
    collection = collection.filter(
      (task) => task.dueDate !== undefined && task.dueDate <= options.dueBefore!
    )
  }

  if (options.dueAfter !== undefined) {
    collection = collection.filter(
      (task) => task.dueDate !== undefined && task.dueDate >= options.dueAfter!
    )
  }

  if (options.priority !== undefined) {
    collection = collection.filter((task) => task.priority === options.priority)
  }

  if (options.hasLabels && options.hasLabels.length > 0) {
    collection = collection.filter((task) =>
      options.hasLabels!.some((label) => task.labels.includes(label))
    )
  }

  // Apply pagination
  return collection.offset(offset).limit(limit).toArray()
}

/**
 * Count tasks matching query - more efficient than loading all and counting
 */
export async function countTasks(options: Omit<TaskQueryOptions, 'offset' | 'limit'> = {}): Promise<number> {
  const { projectId, sectionId, completed } = options

  let collection = db.tasks.toCollection()

  if (projectId !== undefined) {
    if (sectionId !== undefined) {
      collection = db.tasks.where('[sectionId+order]').between([sectionId, -Infinity], [sectionId, Infinity])
    } else {
      collection = db.tasks.where('[projectId+order]').between([projectId, -Infinity], [projectId, Infinity])
    }
  } else if (completed !== undefined) {
    collection = db.tasks.where('completed').equals(completed ? 1 : 0)
  }

  // Apply additional filters
  if (options.createdBy !== undefined) {
    collection = collection.filter((task) => task.createdBy === options.createdBy)
  }

  if (options.assigneeId !== undefined) {
    collection = collection.filter(
      (task) => task.assigneeIds?.includes(options.assigneeId!) ?? false
    )
  }

  return collection.count()
}

/**
 * Get tasks by IDs - batch lookup for known IDs
 */
export async function getTasksByIds(ids: string[]): Promise<Task[]> {
  if (ids.length === 0) return []
  return db.tasks.where('id').anyOf(ids).toArray()
}

/**
 * Get tasks created within a date range - uses indexed query
 */
export async function getTasksInDateRange(
  userId: string,
  dateRange: DateRangeOptions,
  options: PaginationOptions = {}
): Promise<Task[]> {
  const { offset = 0, limit = 500 } = options

  // Use createdBy index and filter by date
  return db.tasks
    .where('createdBy')
    .equals(userId)
    .filter((task) => task.createdAt >= dateRange.start && task.createdAt <= dateRange.end)
    .offset(offset)
    .limit(limit)
    .toArray()
}

/**
 * Get completed tasks in date range - optimized for analytics
 */
export async function getCompletedTasksInRange(
  userId: string,
  dateRange: DateRangeOptions
): Promise<Task[]> {
  return db.tasks
    .where('createdBy')
    .equals(userId)
    .filter(
      (task) =>
        task.completed &&
        task.createdAt >= dateRange.start &&
        task.createdAt <= dateRange.end
    )
    .toArray()
}

/**
 * Get tasks due within a range - for calendar/upcoming views
 */
export async function getTasksDueInRange(dateRange: DateRangeOptions): Promise<Task[]> {
  return db.tasks
    .where('dueDate')
    .between(dateRange.start, dateRange.end, true, true)
    .toArray()
}

/**
 * Get overdue tasks - uses dueDate index
 */
export async function getOverdueTasks(userId?: string): Promise<Task[]> {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  let collection = db.tasks
    .where('dueDate')
    .below(now)
    .filter((task) => !task.completed)

  if (userId) {
    collection = collection.filter(
      (task) => task.createdBy === userId || (task.assigneeIds?.includes(userId) ?? false)
    )
  }

  return collection.toArray()
}

/**
 * Get tasks due today - common query
 */
export async function getTasksDueToday(): Promise<Task[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return db.tasks
    .where('dueDate')
    .between(today, tomorrow, true, false)
    .filter((task) => !task.completed)
    .toArray()
}

/**
 * Get subtasks for a parent task - indexed by parentTaskId
 */
export async function getSubtasks(parentTaskId: string): Promise<Task[]> {
  return db.tasks.where('parentTaskId').equals(parentTaskId).toArray()
}

/**
 * Get tasks by project with sections - returns structured data
 */
export async function getTasksByProjectGrouped(
  projectId: string
): Promise<Map<string | undefined, Task[]>> {
  const tasks = await db.tasks
    .where('[projectId+order]')
    .between([projectId, -Infinity], [projectId, Infinity])
    .toArray()

  const grouped = new Map<string | undefined, Task[]>()

  for (const task of tasks) {
    const sectionId = task.sectionId
    if (!grouped.has(sectionId)) {
      grouped.set(sectionId, [])
    }
    grouped.get(sectionId)!.push(task)
  }

  // Sort each group by order
  for (const [, taskList] of grouped) {
    taskList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }

  return grouped
}

/**
 * Batch update tasks - more efficient than individual updates
 */
export async function batchUpdateTasks(
  updates: Array<{ id: string; changes: Partial<Task> }>
): Promise<void> {
  const now = new Date()

  await db.transaction('rw', db.tasks, async () => {
    for (const { id, changes } of updates) {
      await db.tasks.update(id, { ...changes, updatedAt: now })
    }
  })
}

/**
 * Batch delete tasks - efficient bulk deletion
 */
export async function batchDeleteTasks(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  await db.tasks.where('id').anyOf(ids).delete()
}

/**
 * Get project task counts - efficient aggregation
 */
export async function getProjectTaskCounts(
  projectIds: string[]
): Promise<Map<string, { total: number; completed: number }>> {
  const counts = new Map<string, { total: number; completed: number }>()

  // Initialize counts
  for (const id of projectIds) {
    counts.set(id, { total: 0, completed: 0 })
  }

  // Use single scan with anyOf for efficiency
  const tasks = await db.tasks.where('projectId').anyOf(projectIds).toArray()

  for (const task of tasks) {
    if (task.projectId) {
      const count = counts.get(task.projectId)!
      count.total++
      if (task.completed) {
        count.completed++
      }
    }
  }

  return counts
}

/**
 * Search tasks by content - uses full table scan but with early termination
 */
export async function searchTasks(
  query: string,
  options: PaginationOptions = {}
): Promise<Task[]> {
  const { offset = 0, limit = 50 } = options
  const lowerQuery = query.toLowerCase()

  return db.tasks
    .filter((task) => task.content.toLowerCase().includes(lowerQuery))
    .offset(offset)
    .limit(limit)
    .toArray()
}

/**
 * Get user's projects with task counts
 */
export async function getProjectsWithCounts(
  userId: string
): Promise<Array<Project & { taskCount: number; completedCount: number }>> {
  const projects = await db.projects.where('ownerId').equals(userId).toArray()

  const projectIds = projects.map((p) => p.id)
  const counts = await getProjectTaskCounts(projectIds)

  return projects.map((project) => {
    const count = counts.get(project.id) ?? { total: 0, completed: 0 }
    return {
      ...project,
      taskCount: count.total,
      completedCount: count.completed,
    }
  })
}

/**
 * Get labels for a user
 */
export async function getUserLabels(userId: string): Promise<Label[]> {
  return db.labels.where('ownerId').equals(userId).toArray()
}

/**
 * Statistics aggregation - optimized for analytics
 */
export interface TaskStats {
  total: number
  completed: number
  overdue: number
  dueToday: number
  highPriority: number
}

export async function getTaskStats(userId?: string): Promise<TaskStats> {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  let collection = db.tasks.toCollection()

  if (userId) {
    collection = db.tasks
      .where('createdBy')
      .equals(userId)
  }

  const tasks = await collection.toArray()

  const stats: TaskStats = {
    total: tasks.length,
    completed: 0,
    overdue: 0,
    dueToday: 0,
    highPriority: 0,
  }

  for (const task of tasks) {
    if (task.completed) {
      stats.completed++
    } else {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)

        if (dueDate < now) {
          stats.overdue++
        } else if (dueDate >= now && dueDate < tomorrow) {
          stats.dueToday++
        }
      }
      if (task.priority === 'p1') {
        stats.highPriority++
      }
    }
  }

  return stats
}
