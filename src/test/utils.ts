import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { expect } from 'bun:test'
import type { User, Task, Project, Team } from '@/types'

// Mock data factories
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
  settings: {
    theme: 'light',
    language: 'en',
    timeFormat: '24h',
    dateFormat: 'MM/dd/yyyy',
    startOfWeek: 0,
    defaultView: 'list',
    defaultPriority: 'p3',
    enableKarma: true,
    dailyGoal: 5,
    weeklyGoal: 20,
    daysOff: [],
    vacationMode: false,
    enableNotifications: true,
  },
  karmaPoints: 0,
  karmaLevel: 'beginner',
  ...overrides,
})

export const createMockTask = (overrides?: Partial<Task>): Task => ({
  id: 'task-1',
  content: 'Test task',
  priority: 'p2',
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  order: 0,
  reminders: [],
  labels: [],
  attachments: [],
  ...overrides,
})

export const createMockProject = (overrides?: Partial<Project>): Project => ({
  id: 'project-1',
  name: 'Test Project',
  color: '#10b981',
  viewType: 'list',
  isFavorite: false,
  isShared: false,
  ownerId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  order: 0,
  archived: false,
  ...overrides,
})

export const createMockTeam = (overrides?: Partial<Team>): Team => ({
  id: 'team-1',
  name: 'Test Team',
  ownerId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Custom render function with providers
export const renderWithProviders = (
  ui: ReactElement,
  { ...renderOptions }: Omit<RenderOptions, 'wrapper'> = {}
) => {
  return render(ui, { ...renderOptions })
}

// Wait utilities
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0))

// Assertion helpers
export const expectToBeValidDate = (date: unknown) => {
  expect(date).toBeInstanceOf(Date)
  expect((date as Date).getTime()).not.toBeNaN()
}

export const expectValidUUID = (id: unknown) => {
  const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i
  expect(typeof id).toBe('string')
  if (typeof id === 'string' && id.includes('-')) {
    // UUID format
    expect(id).toMatch(uuidRegex)
  }
}
