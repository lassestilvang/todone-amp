import { describe, it, expect, beforeEach, mock, spyOn } from 'bun:test'
import {
  formatTasksForPrint,
  generateProductivityReport,
  printContent,
  downloadPrintContent,
  exportTasksAsHTML,
} from './printUtils'
import { Task } from '@/types'
import * as loggerModule from './logger'

describe('Print Utilities', () => {
  let mockTasks: Task[]

  beforeEach(() => {
    mockTasks = [
      {
        id: '1',
        content: 'Test Task 1',
        description: 'Description 1',
        completed: false,
        priority: 'p1',
        dueDate: new Date('2025-12-25'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        labels: ['urgent', 'work'],
        order: 1,
        reminders: [],
        attachments: [],
      } as Task,
      {
        id: '2',
        content: 'Test Task 2',
        description: 'Description 2',
        completed: true,
        priority: 'p3',
        dueDate: new Date('2025-12-26'),
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
        labels: ['personal'],
        order: 2,
        reminders: [],
        attachments: [],
      } as Task,
      {
        id: '3',
        content: 'Test Task 3 with & special < chars > "quotes" & apostrophe',
        description: undefined,
        completed: false,
        priority: 'p4',
        dueDate: undefined,
        createdAt: new Date('2025-01-03'),
        updatedAt: new Date('2025-01-03'),
        labels: [],
        order: 3,
        reminders: [],
        attachments: [],
      } as Task,
    ]
  })

  describe('formatTasksForPrint', () => {
    it('should format incomplete tasks by default', () => {
      const html = formatTasksForPrint(mockTasks)
      expect(html).toContain('Test Task 1')
      expect(html).toContain('Test Task 3')
      // Task 2 is completed and not included by default
    })

    it('should exclude completed tasks when includeCompleted is false', () => {
      const html = formatTasksForPrint(mockTasks, { includeCompleted: false })
      // Should include incomplete tasks
      expect(html).toContain('Test Task 1')
      expect(html).toContain('Test Task 3')
      // Should not include completed task
      expect(html).not.toContain('Test Task 2')
    })

    it('should include completed tasks when includeCompleted is true', () => {
      const html = formatTasksForPrint(mockTasks, { includeCompleted: true })
      expect(html).toContain('Test Task 2')
    })

    it('should exclude descriptions when includeDescriptions is false', () => {
      const html = formatTasksForPrint(mockTasks, { includeDescriptions: false })
      expect(html).not.toContain('Description 1')
    })

    it('should include descriptions when includeDescriptions is true', () => {
      const html = formatTasksForPrint(mockTasks, { includeDescriptions: true })
      expect(html).toContain('Description 1')
    })

    it('should escape HTML special characters', () => {
      const html = formatTasksForPrint(mockTasks)
      expect(html).toContain('&amp;')
      expect(html).toContain('&lt;')
      expect(html).toContain('&gt;')
      expect(html).toContain('&quot;')
    })

    it('should include custom title', () => {
      const html = formatTasksForPrint(mockTasks, { title: 'Custom Title' })
      expect(html).toContain('Custom Title')
    })

    it('should display priority labels correctly', () => {
      const html = formatTasksForPrint(mockTasks)
      expect(html).toContain('Urgent')
      expect(html).toContain('priority-p1')
      expect(html).toContain('Low')
      expect(html).toContain('priority-p4')
    })

    it('should display labels for tasks', () => {
      const html = formatTasksForPrint(mockTasks, { includeCompleted: true })
      expect(html).toContain('urgent')
      expect(html).toContain('work')
      expect(html).toContain('personal')
    })

    it('should display due dates', () => {
      const html = formatTasksForPrint(mockTasks)
      expect(html).toContain('Due:')
    })

    it('should include HTML structure', () => {
      const html = formatTasksForPrint(mockTasks)
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('</html>')
      expect(html).toContain('<style>')
      expect(html).toContain('Printed on')
    })

    it('should handle empty task list', () => {
      const html = formatTasksForPrint([])
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('Task List')
    })

    it('should render checkboxes for completed and incomplete tasks', () => {
      const html = formatTasksForPrint(mockTasks, { includeCompleted: true })
      expect(html).toContain('☐') // Unchecked
      expect(html).toContain('☑') // Checked
    })
  })

  describe('generateProductivityReport', () => {
    it('should generate productivity report with correct stats', () => {
      const report = generateProductivityReport(mockTasks, 50, 100, 7)
      expect(report).toContain('Productivity Report')
      expect(report).toContain('50')
      expect(report).toContain('100')
      expect(report).toContain('50%')
      expect(report).toContain('7')
    })

    it('should handle zero completion rate', () => {
      const report = generateProductivityReport(mockTasks, 0, 100, 0)
      expect(report).toContain('0%')
    })

    it('should handle 100% completion rate', () => {
      const report = generateProductivityReport(mockTasks, 100, 100, 14)
      expect(report).toContain('100%')
    })

    it('should include generated date and time', () => {
      const report = generateProductivityReport(mockTasks, 50, 100, 7)
      expect(report).toContain('Generated on')
    })

    it('should include HTML structure', () => {
      const report = generateProductivityReport(mockTasks, 50, 100, 7)
      expect(report).toContain('<!DOCTYPE html>')
      expect(report).toContain('</html>')
      expect(report).toContain('<style>')
    })

    it('should display streak with correct grammar', () => {
      let report = generateProductivityReport(mockTasks, 50, 100, 1)
      expect(report).toContain('1 day')

      report = generateProductivityReport(mockTasks, 50, 100, 5)
      expect(report).toContain('5 days')
    })

    it('should include stat cards', () => {
      const report = generateProductivityReport(mockTasks, 50, 100, 7)
      expect(report).toContain('stat-card')
      expect(report).toContain('Tasks Completed')
      expect(report).toContain('Total Tasks')
      expect(report).toContain('Completion Rate')
      expect(report).toContain('Current Streak')
    })
  })

  describe('printContent', () => {
    it('should open print window and write content', () => {
      const mockPrintWindow = {
        document: {
          write: mock(() => {}),
          close: mock(() => {}),
        },
        print: mock(() => {}),
        close: mock(() => {}),
      }

      spyOn(window, 'open').mockReturnValue(mockPrintWindow as unknown as Window | null)

      const content = '<html><body>Test</body></html>'
      printContent(content)

      expect(window.open).toHaveBeenCalledWith('', '_blank')
      expect(mockPrintWindow.document.write).toHaveBeenCalledWith(content)
      expect(mockPrintWindow.document.close).toHaveBeenCalled()
      expect(mockPrintWindow.print).toHaveBeenCalled()
    })

    it('should handle print window being blocked', () => {
      spyOn(window, 'open').mockReturnValue(null)
      const loggerSpy = spyOn(loggerModule.logger, 'error').mockImplementation(() => {})

      printContent('<html><body>Test</body></html>')

      expect(loggerSpy).toHaveBeenCalledWith('Failed to open print window')
      loggerSpy.mockRestore()
    })
  })

  describe('downloadPrintContent', () => {
    it('should create and handle download link', () => {
      const content = '<html><body>Test</body></html>'
      // Should not throw error
      expect(() => {
        downloadPrintContent(content, 'test.html')
      }).not.toThrow()
    })
  })

  describe('exportTasksAsHTML', () => {
    it('should export tasks as HTML file', () => {
      expect(() => {
        exportTasksAsHTML(mockTasks, 'tasks.html')
      }).not.toThrow()
    })

    it('should use default filename if not provided', () => {
      expect(() => {
        exportTasksAsHTML(mockTasks)
      }).not.toThrow()
    })
  })
})
