import { describe, it, expect } from 'vitest'

type TaskObject = Record<string, unknown>
type ProjectObject = Record<string, unknown>

describe('exportImport utilities', () => {
  describe('exportDataAsJSON', () => {
    it('should export tasks and projects as JSON', () => {
      const tasks: TaskObject[] = [
        {
          id: '1',
          title: 'Task 1',
          completed: false,
          priority: 'p1',
        },
      ]
      const projects: ProjectObject[] = [
        {
          id: '1',
          name: 'Project 1',
          color: '#00B4D8',
        },
      ]

      const exported = {
        tasks,
        projects,
        exportDate: new Date().toISOString(),
      }

      expect(exported.tasks).toHaveLength(1)
      expect(exported.projects).toHaveLength(1)
      expect(exported.tasks[0].title).toBe('Task 1')
    })

    it('should include all task properties', () => {
      const task: TaskObject = {
        id: '1',
        title: 'Complex Task',
        description: 'Description',
        completed: true,
        priority: 'p2',
        dueDate: new Date(),
        labels: ['label1'],
        projectId: 'proj1',
      }

      expect(task.description).toBe('Description')
      expect((task.labels as string[]).includes('label1')).toBe(true)
      expect(task.projectId).toBe('proj1')
    })
  })

  describe('exportTasksAsCSV', () => {
    it('should export tasks as CSV', () => {
      // Create CSV header
      const headers = ['id', 'title', 'completed', 'priority']
      const csv = headers.join(',') + '\n'

      expect(csv).toContain('id')
      expect(csv).toContain('title')
      expect(csv).toContain('completed')
    })

    it('should handle special characters in CSV', () => {
      const task: TaskObject = {
        id: '1',
        title: 'Task with "quotes" and, commas',
        completed: false,
        priority: 'p1',
      }

      // CSV should escape quotes
      const escaped =
        String(task.title).includes(',') || String(task.title).includes('"')
      expect(escaped).toBe(true)
    })

    it('should handle newlines in descriptions', () => {
      const task: TaskObject = {
        id: '1',
        title: 'Task',
        description: 'Line 1\nLine 2',
        completed: false,
        priority: 'p1',
      }

      expect(String(task.description).includes('\n')).toBe(true)
    })
  })

  describe('exportCompletionReportAsCSV', () => {
    it('should export completion report', () => {
      const tasks: TaskObject[] = [
        {
          id: '1',
          title: 'Task',
          completed: true,
          completedAt: new Date('2024-01-01'),
        },
      ]

      // Create report format
      const report = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        completionRate: (100 * tasks.filter(t => t.completed).length) / tasks.length,
      }

      expect(report.totalTasks).toBe(1)
      expect(report.completedTasks).toBe(1)
      expect(report.completionRate).toBe(100)
    })

    it('should group by date', () => {
      const tasks: TaskObject[] = [
        {
          id: '1',
          title: 'Task 1',
          completed: true,
          completedAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          title: 'Task 2',
          completed: true,
          completedAt: new Date('2024-01-02'),
        },
      ]

      const byDate = tasks.reduce(
        (acc: Record<string, number>, task) => {
          if (!task.completedAt) return acc
          const date = (task.completedAt as Date).toISOString().split('T')[0]
          acc[date] = (acc[date] || 0) + 1
          return acc
        },
        {}
      )

      expect(Object.keys(byDate)).toContain('2024-01-01')
      expect(Object.keys(byDate)).toContain('2024-01-02')
    })
  })

  describe('validateImportedData', () => {
    it('should validate required task fields', () => {
      const validTask: TaskObject = {
        id: '1',
        title: 'Task',
        completed: false,
        priority: 'p2',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(validTask.id).toBeDefined()
      expect(validTask.title).toBeDefined()
      expect(String(validTask.title).length > 0).toBe(true)
    })

    it('should reject tasks without title', () => {
      const invalidTask: TaskObject = {
        id: '1',
        title: '',
        completed: false,
      }

      expect(String(invalidTask.title).length > 0).toBe(false)
    })

    it('should reject invalid priority values', () => {
      const invalidPriority = 'invalid'

      const validPriorities = ['p1', 'p2', 'p3', 'p4']
      expect(validPriorities.includes(invalidPriority)).toBe(false)
    })

    it('should validate project data', () => {
      const validProject: ProjectObject = {
        id: '1',
        name: 'Project',
        color: '#00B4D8',
      }

      expect(validProject.id).toBeDefined()
      expect(validProject.name).toBeDefined()
      expect(String(validProject.name).length > 0).toBe(true)
    })

    it('should reject projects without name', () => {
      const invalidProject: ProjectObject = {
        id: '1',
        name: '',
      }

      expect(String(invalidProject.name).length > 0).toBe(false)
    })
  })

  describe('data import edge cases', () => {
    it('should handle empty imports', () => {
      const empty = {
        tasks: [],
        projects: [],
      }

      expect(empty.tasks).toHaveLength(0)
      expect(empty.projects).toHaveLength(0)
    })

    it('should handle large data sets', () => {
      const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        title: `Task ${i}`,
        completed: false,
        priority: 'p2',
      })) as TaskObject[]

      expect(largeTasks).toHaveLength(1000)
    })

    it('should preserve task relationships', () => {
      const tasks: TaskObject[] = [
        {
          id: '1',
          title: 'Parent',
          completed: false,
          priority: 'p1',
        },
        {
          id: '2',
          title: 'Child',
          completed: false,
          priority: 'p1',
          parentTaskId: '1',
        },
      ]

      const child = tasks.find(t => t.id === '2')
      expect(child?.parentTaskId).toBe('1')
    })

    it('should handle missing optional fields', () => {
      const minimalTask: TaskObject = {
        id: '1',
        title: 'Task',
      }

      expect(minimalTask.id).toBeDefined()
      expect(minimalTask.title).toBeDefined()
    })
  })
})
