import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateICalFeed,
  downloadICalFeed,
  getICalFeedUrl,
  copyICalFeedToClipboard,
} from '@/utils/icalFeed'
import type { Task } from '@/types'

const mockTask: Task = {
  id: 'task1',
  content: 'Buy groceries',
  description: 'Milk, eggs, bread',
  completed: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  priority: 'p2',
  dueDate: new Date('2025-01-15T10:00:00Z'),
  duration: undefined,
  order: 0,
  reminders: [],
  labels: [],
  attachments: [],
}

const completedTask: Task = {
  ...mockTask,
  id: 'task2',
  content: 'Complete presentation',
  completed: true,
}

describe('iCal Feed Generation', () => {
  it('generates valid iCal feed', () => {
    const feed = generateICalFeed([mockTask])

    expect(feed).toContain('BEGIN:VCALENDAR')
    expect(feed).toContain('END:VCALENDAR')
    expect(feed).toContain('VERSION:2.0')
    expect(feed).toContain('PRODID:-//Todone//Todone Task Management//EN')
  })

  it('includes task as vevent', () => {
    const feed = generateICalFeed([mockTask])

    expect(feed).toContain('BEGIN:VEVENT')
    expect(feed).toContain('END:VEVENT')
    expect(feed).toContain('Buy groceries')
  })

  it('includes multiple tasks', () => {
    const feed = generateICalFeed([mockTask, completedTask])

    expect(feed).toContain('Buy groceries')
    expect(feed).toContain('Complete presentation')
  })

  it('sets correct status for completed tasks', () => {
    const feed = generateICalFeed([completedTask])

    expect(feed).toContain('STATUS:COMPLETED')
  })

  it('sets correct status for incomplete tasks', () => {
    const feed = generateICalFeed([mockTask])

    expect(feed).toContain('STATUS:IN-PROCESS')
  })

  it('includes task priority', () => {
    const feed = generateICalFeed([mockTask])

    expect(feed).toContain('PRIORITY:5') // p2 = 5
  })

  it('formats due date correctly', () => {
    const feed = generateICalFeed([mockTask])

    expect(feed).toContain('DTSTART:20250115T100000Z')
  })

  it('includes task description', () => {
    const feed = generateICalFeed([mockTask])

    expect(feed).toContain('Milk\\, eggs\\, bread') // escaped commas
  })

  it('escapes special characters', () => {
    const taskWithSpecialChars: Task = {
      ...mockTask,
      content: 'Test; task, with "special" chars\n',
      description: 'Description\\with\\backslash',
    }

    const feed = generateICalFeed([taskWithSpecialChars])

    expect(feed).toContain('Test\\; task\\, with')
    expect(feed).toContain('Description\\\\with\\\\backslash')
  })

  it('includes calendar name in feed', () => {
    const feed = generateICalFeed([mockTask], undefined, 'My Calendar')

    expect(feed).toContain('X-WR-CALNAME:My Calendar')
  })

  it('handles tasks with labels as categories', () => {
    const taskWithLabels: Task = {
      ...mockTask,
      labels: ['work', 'urgent'],
    }

    const feed = generateICalFeed([taskWithLabels])

    expect(feed).toContain('CATEGORIES:work,urgent')
  })

  it('skips parent task with subtasks', () => {
    const parentTask: Task = {
      ...mockTask,
      id: 'parent',
      content: 'Parent Task',
    }

    const childTask: Task = {
      ...mockTask,
      id: 'child',
      content: 'Child Task',
      parentTaskId: 'parent',
    }

    const feed = generateICalFeed([parentTask, childTask])

    expect(feed).toContain('Parent Task')
    expect(feed).not.toContain('Child Task')
  })

  it('handles priority mapping correctly', () => {
    const priorityTests: Array<[string | null, number]> = [
      ['p1', 1],
      ['p2', 5],
      ['p3', 5],
      ['p4', 7],
      [null, 0],
    ]

    priorityTests.forEach(([priority, expectedCode]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const task: Task = { ...mockTask, priority: priority as any }

      const feed = generateICalFeed([task])

      expect(feed).toContain(`PRIORITY:${expectedCode}`)
    })
  })
})

describe('iCal Feed Download', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates feed content', () => {
    const feed = generateICalFeed([mockTask], undefined, 'Test Calendar')
    expect(feed).toContain('BEGIN:VCALENDAR')
    expect(feed).toContain('END:VCALENDAR')
  })
})

describe('iCal Feed URL', () => {
  it('generates valid feed structure', () => {
    const feed = generateICalFeed([mockTask])

    expect(feed).toContain('BEGIN:VCALENDAR')
    expect(feed).toContain('PRODID:-//Todone//Todone Task Management//EN')
    expect(feed).toContain('VERSION:2.0')
    expect(feed).toContain('END:VCALENDAR')
  })
})

describe('iCal Clipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has clipboard utility exported', () => {
    expect(copyICalFeedToClipboard).toBeDefined()
    expect(typeof copyICalFeedToClipboard).toBe('function')
  })

  it('has download utility exported', () => {
    expect(downloadICalFeed).toBeDefined()
    expect(typeof downloadICalFeed).toBe('function')
  })

  it('has URL utility exported', () => {
    expect(getICalFeedUrl).toBeDefined()
    expect(typeof getICalFeedUrl).toBe('function')
  })
})
