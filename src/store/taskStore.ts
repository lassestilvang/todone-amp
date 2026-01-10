import { create } from 'zustand'
import { db } from '@/db/database'
import type { Task, RecurrencePattern, ActivityAction } from '@/types'
import { getNextOccurrence, validateRecurrencePattern } from '@/utils/recurrence'

// Helper to log activity (will be called from stores)
async function logActivity(
  taskId: string,
  userId: string,
  action: ActivityAction,
  changes?: Record<string, unknown>,
  oldValue?: unknown,
  newValue?: unknown
) {
  const activityId = `activity-${Date.now()}`
  try {
    await db.activities.add({
      id: activityId,
      taskId,
      userId,
      action,
      changes,
      oldValue,
      newValue,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

interface TaskState {
  tasks: Task[]
  selectedTaskId: string | null
  expandedTaskIds: Set<string>
  filter: {
    projectId?: string
    sectionId?: string
    completed?: boolean
    search?: string
  }
  // Actions
  loadTasks: () => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  deleteTaskAndSubtasks: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  selectTask: (id: string | null) => void
  setFilter: (filter: TaskState['filter']) => void
  getFilteredTasks: () => Task[]
  reorderTasks: (fromId: string, toId: string) => Promise<void>
  updateTaskOrder: (id: string, newOrder: number) => Promise<void>
  getSubtasks: (parentId: string) => Task[]
  getParentTask: (id: string) => Task | undefined
  getTaskHierarchy: (taskId: string) => Task[]
  toggleTaskExpanded: (taskId: string) => void
  expandTask: (taskId: string) => void
  collapseTask: (taskId: string) => void
  promoteSubtask: (taskId: string) => Promise<void>
  indentTask: (taskId: string, parentId: string) => Promise<void>
  // Recurrence actions
  addRecurrence: (taskId: string, pattern: RecurrencePattern) => Promise<void>
  removeRecurrence: (taskId: string) => Promise<void>
  toggleRecurringTask: (taskId: string) => Promise<void>
  completeRecurringTask: (taskId: string) => Promise<void>
  // Assignment actions
  assignTask: (taskId: string, userId: string) => Promise<void>
  unassignTask: (taskId: string, userId: string) => Promise<void>
  getTaskAssignees: (taskId: string) => string[]
  getTasksAssignedToUser: (userId: string) => Task[]
  getTasksCreatedByUser: (userId: string) => Task[]
  getUnassignedTasks: () => Task[]
  // Recurrence instance operations
  editRecurringTaskInstance: (
    taskId: string,
    instanceDate: Date,
    updates: Partial<Task>,
    mode: 'single' | 'future' | 'all'
  ) => Promise<void>
  deleteRecurringTaskInstance: (
    taskId: string,
    instanceDate: Date,
    mode: 'single' | 'future' | 'all'
  ) => Promise<void>
  // Shared project queries
  getTasksInSharedProject: (projectId: string) => Task[]
  getMyContributionsInSharedProject: (projectId: string, userId: string) => Task[]
  getTasksAssignedToMeInSharedProject: (projectId: string, userId: string) => Task[]
  // Duplication
  duplicateTask: (taskId: string, includeSubtasks: boolean) => Promise<string>
  duplicateTaskWithSubtasks: (taskId: string) => Promise<string>
  completeAllSubtasks: (taskId: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  expandedTaskIds: new Set(),
  filter: {},

  loadTasks: async () => {
    const tasks = await db.tasks.toArray()
    set({ tasks })
  },

  createTask: async (taskData) => {
    const id = `task-${Date.now()}`
    const now = new Date()
    const userId = taskData.createdBy || 'unknown'
    const newTask: Task = {
      ...taskData,
      id,
      createdAt: now,
      updatedAt: now,
      completed: false,
      reminders: [],
      labels: [],
      attachments: [],
    }
    await db.tasks.add(newTask)

    // Log activity
    await logActivity(id, userId, 'created', { content: taskData.content })

    const { tasks } = get()
    set({ tasks: [...tasks, newTask] })
    return id
  },

  updateTask: async (id, updates) => {
    const now = new Date()
    await db.tasks.update(id, {
      ...updates,
      updatedAt: now,
    })
    const { tasks } = get()
    set({
      tasks: tasks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t)),
    })
  },

  deleteTask: async (id) => {
    await db.tasks.delete(id)
    const { tasks } = get()
    set({ tasks: tasks.filter((t) => t.id !== id) })
  },

  toggleTask: async (id) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const completed = !task.completed
    const completedAt = completed ? new Date() : undefined
    const userId = task.createdBy || 'unknown'

    await db.tasks.update(id, { completed, completedAt })

    // Log activity
    await logActivity(id, userId, completed ? 'completed' : 'updated', {
      status: completed ? 'completed' : 'active',
    })

    // Trigger gamification on task completion
    if (completed) {
      try {
        const { useGamificationStore } = await import('@/store/gamificationStore')
        const gamificationStore = useGamificationStore.getState()
        // Award karma with priority multiplier (base 10 points)
        await gamificationStore.addKarma(userId, 10, task.priority)
        // Update streak and check for achievement unlocks
        await gamificationStore.updateStreak(userId)
      } catch (error) {
        console.warn('Failed to update gamification stats:', error)
      }
    }

    set({
      tasks: tasks.map((t) => (t.id === id ? { ...t, completed, completedAt } : t)),
    })
  },

  selectTask: (id) => {
    set({ selectedTaskId: id })
  },

  setFilter: (filter) => {
    set({ filter })
  },

  getFilteredTasks: () => {
    const { tasks, filter } = get()
    return tasks.filter((task) => {
      if (filter.projectId && task.projectId !== filter.projectId) return false
      if (filter.sectionId && task.sectionId !== filter.sectionId) return false
      if (filter.completed !== undefined && task.completed !== filter.completed) return false
      if (filter.search && !task.content.toLowerCase().includes(filter.search.toLowerCase())) {
        return false
      }
      return true
    })
  },

  reorderTasks: async (fromId: string, toId: string) => {
    const { tasks } = get()
    const fromTask = tasks.find((t) => t.id === fromId)
    const toTask = tasks.find((t) => t.id === toId)

    if (!fromTask || !toTask) return

    // Get tasks in the same scope (same project/section)
    const scopeTasks = tasks.filter(
      (t) => t.projectId === fromTask.projectId && t.sectionId === fromTask.sectionId
    )

    // Find indices
    const fromIndex = scopeTasks.findIndex((t) => t.id === fromId)
    const toIndex = scopeTasks.findIndex((t) => t.id === toId)

    if (fromIndex === -1 || toIndex === -1) return

    // Create a copy and reorder
    const reordered = [...scopeTasks]
    const [removed] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, removed)

    // Update orders
    const now = new Date()
    const updatedTasks = reordered.map((task, index) => ({
      ...task,
      order: index,
      updatedAt: now,
    }))

    // Update database
    for (const task of updatedTasks) {
      await db.tasks.update(task.id, { order: task.order, updatedAt: now })
    }

    // Update state
    const newTasks = tasks.map((task) => {
      const updated = updatedTasks.find((t) => t.id === task.id)
      return updated ? { ...task, order: updated.order, updatedAt: now } : task
    })
    set({ tasks: newTasks })
  },

  updateTaskOrder: async (id: string, newOrder: number) => {
    const now = new Date()
    await db.tasks.update(id, { order: newOrder, updatedAt: now })
    const { tasks } = get()
    set({
      tasks: tasks.map((t) => (t.id === id ? { ...t, order: newOrder, updatedAt: now } : t)),
    })
  },

  getSubtasks: (parentId: string) => {
    const { tasks } = get()
    return tasks.filter((t) => t.parentTaskId === parentId).sort((a, b) => a.order - b.order)
  },

  getParentTask: (id: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === id)
    if (!task || !task.parentTaskId) return undefined
    return tasks.find((t) => t.id === task.parentTaskId)
  },

  getTaskHierarchy: (taskId: string) => {
    const { tasks } = get()
    const hierarchy: Task[] = []
    let current = tasks.find((t) => t.id === taskId)

    while (current) {
      hierarchy.unshift(current)
      if (current.parentTaskId) {
        current = tasks.find((t) => t.id === current!.parentTaskId)
      } else {
        break
      }
    }

    return hierarchy
  },

  toggleTaskExpanded: (taskId: string) => {
    const { expandedTaskIds } = get()
    const newExpanded = new Set(expandedTaskIds)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    set({ expandedTaskIds: newExpanded })
  },

  expandTask: (taskId: string) => {
    const { expandedTaskIds } = get()
    const newExpanded = new Set(expandedTaskIds)
    newExpanded.add(taskId)
    set({ expandedTaskIds: newExpanded })
  },

  collapseTask: (taskId: string) => {
    const { expandedTaskIds } = get()
    const newExpanded = new Set(expandedTaskIds)
    newExpanded.delete(taskId)
    set({ expandedTaskIds: newExpanded })
  },

  deleteTaskAndSubtasks: async (id: string) => {
    const { tasks, getSubtasks } = get()
    const subtasks = getSubtasks(id)
    const allToDelete = [
      id,
      ...subtasks.flatMap((st) => [st.id, ...getSubtasks(st.id).map((s) => s.id)]),
    ]

    for (const taskId of allToDelete) {
      await db.tasks.delete(taskId)
    }

    set({ tasks: tasks.filter((t) => !allToDelete.includes(t.id)) })
  },

  promoteSubtask: async (taskId: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.parentTaskId) return

    const now = new Date()
    await db.tasks.update(taskId, { parentTaskId: undefined, updatedAt: now })
    set({
      tasks: tasks.map((t) =>
        t.id === taskId ? { ...t, parentTaskId: undefined, updatedAt: now } : t
      ),
    })
  },

  indentTask: async (taskId: string, parentId: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const now = new Date()
    await db.tasks.update(taskId, { parentTaskId: parentId, updatedAt: now })
    set({
      tasks: tasks.map((t) =>
        t.id === taskId ? { ...t, parentTaskId: parentId, updatedAt: now } : t
      ),
    })
  },

  // Recurrence methods
  addRecurrence: async (taskId: string, pattern: RecurrencePattern) => {
    if (!validateRecurrencePattern(pattern)) return

    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const now = new Date()
    await db.tasks.update(taskId, { recurrence: pattern, updatedAt: now })
    set({
      tasks: tasks.map((t) =>
        t.id === taskId ? { ...t, recurrence: pattern, updatedAt: now } : t
      ),
    })
  },

  removeRecurrence: async (taskId: string) => {
    const { tasks } = get()
    const now = new Date()
    await db.tasks.update(taskId, { recurrence: undefined, updatedAt: now })
    set({
      tasks: tasks.map((t) =>
        t.id === taskId ? { ...t, recurrence: undefined, updatedAt: now } : t
      ),
    })
  },

  toggleRecurringTask: async (taskId: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.recurrence) return

    // For toggling a recurring task instance, just toggle like normal
    // The "complete recurring task" is handled by completeRecurringTask
    await useTaskStore.getState().toggleTask(taskId)
  },

  completeRecurringTask: async (taskId: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.recurrence) return

    const now = new Date()

    // Calculate next occurrence
    const nextOccurrence = getNextOccurrence(task.dueDate || new Date(), task.recurrence)

    if (nextOccurrence) {
      // Create a new task instance for the next occurrence
      const newTaskId = `task-${Date.now()}`
      const nextTask: Task = {
        ...task,
        id: newTaskId,
        dueDate: nextOccurrence,
        completed: false,
        completedAt: undefined,
        createdAt: now,
        updatedAt: now,
      }

      // Add new task
      await db.tasks.add(nextTask)

      // Mark current as completed
      await db.tasks.update(taskId, { completed: true, completedAt: now, updatedAt: now })

      // Update state
      set({
        tasks: tasks
          .map((t) => (t.id === taskId ? { ...t, completed: true, completedAt: now } : t))
          .concat(nextTask),
      })
    } else {
      // No more occurrences, just complete
      await useTaskStore.getState().toggleTask(taskId)
    }
  },

  // Assignment methods
  assignTask: async (taskId: string, userId: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const assigneeIds = task.assigneeIds || []
    if (assigneeIds.includes(userId)) return // Already assigned

    const newAssigneeIds = [...assigneeIds, userId]
    const now = new Date()
    const actorUserId = task.createdBy || 'unknown'

    await db.tasks.update(taskId, {
      assigneeIds: newAssigneeIds,
      updatedAt: now,
    })

    // Log activity
    await logActivity(taskId, actorUserId, 'assigned', { assignees: newAssigneeIds }, userId)

    set({
      tasks: tasks.map((t) =>
        t.id === taskId ? { ...t, assigneeIds: newAssigneeIds, updatedAt: now } : t
      ),
    })
  },

  unassignTask: async (taskId: string, userId: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const assigneeIds = task.assigneeIds || []
    const newAssigneeIds = assigneeIds.filter((id) => id !== userId)
    const now = new Date()
    const actorUserId = task.createdBy || 'unknown'

    await db.tasks.update(taskId, {
      assigneeIds: newAssigneeIds.length > 0 ? newAssigneeIds : undefined,
      updatedAt: now,
    })

    // Log activity
    await logActivity(taskId, actorUserId, 'unassigned', { assignees: newAssigneeIds }, userId)

    set({
      tasks: tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assigneeIds: newAssigneeIds.length > 0 ? newAssigneeIds : undefined,
              updatedAt: now,
            }
          : t
      ),
    })
  },

  getTaskAssignees: (taskId: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    return task?.assigneeIds || []
  },

  getTasksAssignedToUser: (userId: string) => {
    const { tasks } = get()
    return tasks.filter((t) => t.assigneeIds?.includes(userId) || false)
  },

  getTasksCreatedByUser: (userId: string) => {
    const { tasks } = get()
    return tasks.filter((t) => t.createdBy === userId)
  },

  getUnassignedTasks: () => {
    const { tasks } = get()
    return tasks.filter((t) => !t.assigneeIds || t.assigneeIds.length === 0)
  },

  editRecurringTaskInstance: async (taskId, instanceDate, updates, mode) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.recurrence) return

    const now = new Date()

    if (mode === 'single') {
      // Create a new standalone task with the updates for this specific date
      const instanceTask: Task = {
        ...task,
        id: `task-${Date.now()}-instance`,
        content: updates.content ?? task.content,
        description: updates.description ?? task.description,
        priority: updates.priority ?? task.priority,
        dueDate: updates.dueDate ?? instanceDate,
        dueTime: updates.dueTime ?? task.dueTime,
        labels: updates.labels ?? task.labels,
        recurrence: undefined, // Single instance, no recurrence
        createdAt: now,
        updatedAt: now,
      }

      // Add the instance task to the database
      await db.tasks.add(instanceTask)

      // Add exception for this date in the original recurring task
      const newExceptions = [...task.recurrence.exceptions, instanceDate]
      const updatedRecurrence = {
        ...task.recurrence,
        exceptions: newExceptions,
      }
      await db.tasks.update(taskId, { recurrence: updatedRecurrence, updatedAt: now })

      set({
        tasks: [
          ...tasks.map((t) =>
            t.id === taskId ? { ...t, recurrence: updatedRecurrence, updatedAt: now } : t
          ),
          instanceTask,
        ],
      })
    } else if (mode === 'future') {
      // Remove recurrence after this date
      const updated: Task = {
        ...task,
        recurrence: {
          ...task.recurrence,
          endDate: new Date(instanceDate.getTime() - 1),
        },
        updatedAt: now,
      }
      await db.tasks.update(taskId, updated)
      set({
        tasks: tasks.map((t) => (t.id === taskId ? updated : t)),
      })
    } else if (mode === 'all') {
      // Apply updates to all instances
      const updated: Task = { ...task, ...updates, updatedAt: now }
      await db.tasks.update(taskId, updated)
      set({
        tasks: tasks.map((t) => (t.id === taskId ? updated : t)),
      })
    }
  },

  deleteRecurringTaskInstance: async (taskId, instanceDate, mode) => {
     const { tasks } = get()
     const task = tasks.find((t) => t.id === taskId)
     if (!task || !task.recurrence) return

     const now = new Date()

     if (mode === 'single') {
       // Skip this date
       const newExceptions = [...task.recurrence.exceptions, instanceDate]
       const updated = {
         ...task,
         recurrence: {
           ...task.recurrence,
           exceptions: newExceptions,
         },
         updatedAt: now,
       }
       await db.tasks.update(taskId, updated)
       set({
         tasks: tasks.map((t) => (t.id === taskId ? updated : t)),
       })
     } else if (mode === 'future') {
       // End recurrence at this date
       const updated = {
         ...task,
         recurrence: {
           ...task.recurrence,
           endDate: new Date(instanceDate.getTime() - 1),
         },
         updatedAt: now,
       }
       await db.tasks.update(taskId, updated)
       set({
         tasks: tasks.map((t) => (t.id === taskId ? updated : t)),
       })
     } else if (mode === 'all') {
       // Delete task entirely
       await db.tasks.delete(taskId)
       set({
         tasks: tasks.filter((t) => t.id !== taskId),
       })
     }
   },

  // Shared project query methods
  getTasksInSharedProject: (projectId: string) => {
    const { tasks } = get()
    return tasks.filter((t) => t.projectId === projectId)
  },

  getMyContributionsInSharedProject: (projectId: string, userId: string) => {
    const { tasks } = get()
    return tasks.filter((t) => t.projectId === projectId && t.createdBy === userId)
  },

  getTasksAssignedToMeInSharedProject: (projectId: string, userId: string) => {
    const { tasks } = get()
    return tasks.filter(
      (t) => t.projectId === projectId && t.assigneeIds?.includes(userId)
    )
  },

  duplicateTask: async (taskId: string, includeSubtasks: boolean) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return taskId

    const now = new Date()
    const newId = `task-${Date.now()}`
    const newTask: Task = {
      ...task,
      id: newId,
      content: `${task.content} (copy)`,
      completed: false,
      completedAt: undefined,
      createdAt: now,
      updatedAt: now,
      parentTaskId: task.parentTaskId, // Keep same parent
      reminders: [],
    }

    await db.tasks.add(newTask)
    set({ tasks: [...tasks, newTask] })

    // Duplicate subtasks if requested
    if (includeSubtasks) {
      const subtasks = tasks.filter((t) => t.parentTaskId === taskId)
      for (const subtask of subtasks) {
        const subId = `task-${Date.now() + Math.random()}`
        const newSubtask: Task = {
          ...subtask,
          id: subId,
          content: `${subtask.content} (copy)`,
          completed: false,
          completedAt: undefined,
          createdAt: now,
          updatedAt: now,
          parentTaskId: newId, // Point to new parent
          reminders: [],
        }
        await db.tasks.add(newSubtask)
      }
      // Reload all tasks
      const allTasks = await db.tasks.toArray()
      set({ tasks: allTasks })
    }

    return newId
  },

  duplicateTaskWithSubtasks: async (taskId: string): Promise<string> => {
    return get().duplicateTask(taskId, true)
  },

  completeAllSubtasks: async (taskId: string) => {
    const { tasks, getSubtasks } = get()
    const subtasks = getSubtasks(taskId)
    const now = new Date()
    const userId = tasks.find((t) => t.id === taskId)?.createdBy || 'unknown'

    for (const subtask of subtasks) {
      if (!subtask.completed) {
        await db.tasks.update(subtask.id, {
          completed: true,
          completedAt: now,
          updatedAt: now,
        })

        // Recursively complete nested subtasks
        const nestedSubtasks = getSubtasks(subtask.id)
        if (nestedSubtasks.length > 0) {
          await get().completeAllSubtasks(subtask.id)
        }

        // Log activity
        await logActivity(subtask.id, userId, 'completed', { status: 'completed' })
      }
    }

    // Reload tasks
    const allTasks = await db.tasks.toArray()
    set({ tasks: allTasks })
  },
  }))
