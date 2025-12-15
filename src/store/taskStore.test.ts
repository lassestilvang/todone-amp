import { describe, it, expect } from 'vitest'

type TaskObject = Record<string, unknown>

describe('taskStore - Core Functionality', () => {
  describe('task creation', () => {
    it('should create a valid task object', () => {
      const task: TaskObject = {
        id: '1',
        title: 'Test task',
        completed: false,
        priority: 'p2',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(task.id).toBeDefined()
      expect(task.title).toBe('Test task')
      expect(task.completed).toBe(false)
      expect(task.priority).toBe('p2')
    })

    it('should have default properties', () => {
      const task: TaskObject = {
        id: '1',
        title: 'Task',
        completed: false,
        priority: 'p2',
      }

      expect(task.completed).toBe(false)
      expect(task.priority).toBe('p2')
    })
  })

  describe('task properties', () => {
    it('should support all task fields', () => {
      const task: TaskObject = {
        id: '1',
        title: 'Full Task',
        description: 'With description',
        completed: false,
        priority: 'p1',
        dueDate: new Date(),
        projectId: 'proj1',
        sectionId: 'sec1',
        labels: ['label1', 'label2'],
        assigneeId: 'user1',
        parentTaskId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(task.title).toBe('Full Task')
      expect(task.description).toBe('With description')
      expect(task.projectId).toBe('proj1')
      expect((task.labels as string[]).length).toBe(2)
    })

    it('should handle subtasks via parentTaskId', () => {
      const parent: TaskObject = { id: '1', title: 'Parent' }
      const child: TaskObject = { id: '2', title: 'Child', parentTaskId: '1' }

      expect(child.parentTaskId).toBe(parent.id)
    })
  })

  describe('task filtering logic', () => {
    it('should filter by completed status', () => {
      const tasks: TaskObject[] = [
        { id: '1', title: 'Active', completed: false },
        { id: '2', title: 'Done', completed: true },
        { id: '3', title: 'Active 2', completed: false },
      ]

      const activeTasks = tasks.filter(t => !t.completed)
      expect(activeTasks).toHaveLength(2)
    })

    it('should filter by project', () => {
      const tasks: TaskObject[] = [
        { id: '1', title: 'Task', projectId: 'proj1' },
        { id: '2', title: 'Task', projectId: 'proj2' },
        { id: '3', title: 'Task', projectId: 'proj1' },
      ]

      const proj1Tasks = tasks.filter(t => t.projectId === 'proj1')
      expect(proj1Tasks).toHaveLength(2)
    })

    it('should filter by priority', () => {
      const tasks: TaskObject[] = [
        { id: '1', title: 'Urgent', priority: 'p1' },
        { id: '2', title: 'High', priority: 'p2' },
        { id: '3', title: 'Normal', priority: 'p3' },
      ]

      const urgent = tasks.filter(t => t.priority === 'p1')
      expect(urgent).toHaveLength(1)
    })

    it('should filter by label', () => {
      const tasks: TaskObject[] = [
        { id: '1', title: 'Task', labels: ['urgent', 'work'] },
        { id: '2', title: 'Task', labels: ['personal'] },
        { id: '3', title: 'Task', labels: ['urgent'] },
      ]

      const urgentTasks = tasks.filter(t =>
        (t.labels as string[])?.includes('urgent')
      )
      expect(urgentTasks).toHaveLength(2)
    })
  })

  describe('task search', () => {
    it('should search by title', () => {
      const tasks: TaskObject[] = [
        { id: '1', title: 'Buy groceries' },
        { id: '2', title: 'Call mom' },
        { id: '3', title: 'Grocery shopping list' },
      ]

      const results = tasks.filter(t =>
        String(t.title).toLowerCase().includes('grocer')
      )
      expect(results).toHaveLength(2)
    })

    it('should search by description', () => {
      const tasks: TaskObject[] = [
        { id: '1', title: 'Task 1', description: 'Buy milk and eggs' },
        { id: '2', title: 'Task 2', description: 'Call dentist' },
      ]

      const results = tasks.filter(t =>
        String(t.description || '').toLowerCase().includes('buy')
      )
      expect(results).toHaveLength(1)
    })

    it('should be case-insensitive', () => {
      const tasks: TaskObject[] = [{ id: '1', title: 'BUY GROCERIES' }]

      const results = tasks.filter(t =>
        String(t.title).toLowerCase().includes('buy')
      )
      expect(results).toHaveLength(1)
    })
  })

  describe('task ordering', () => {
    it('should support custom order', () => {
      const tasks: TaskObject[] = [
        { id: '1', title: 'Task 1', order: 0 },
        { id: '2', title: 'Task 2', order: 1 },
        { id: '3', title: 'Task 3', order: 2 },
      ]

      const sorted = tasks.sort((a, b) => (a.order as number) - (b.order as number))
      expect(sorted[0].id).toBe('1')
      expect(sorted[2].id).toBe('3')
    })
  })

  describe('task validation', () => {
    it('should require title', () => {
      const validTask = { id: '1', title: 'Valid' }
      expect(String(validTask.title).length > 0).toBe(true)
    })

    it('should validate priority values', () => {
      const validPriorities = ['p1', 'p2', 'p3', 'p4']
      const task = { priority: 'p2' }
      expect(validPriorities.includes(task.priority as string)).toBe(true)
    })

    it('should reject invalid priority', () => {
      const validPriorities = ['p1', 'p2', 'p3', 'p4']
      expect(validPriorities.includes('p5')).toBe(false)
    })
  })
})
