/**
 * Core type definitions for Todone application
 */

export type Priority = 'p1' | 'p2' | 'p3' | 'p4' | null

export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
export type ViewType = 'list' | 'board' | 'calendar'
export type UserRole = 'owner' | 'admin' | 'member'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  settings: UserSettings
  karmaPoints: number
  karmaLevel: KarmaLevel
}

export type KarmaLevel =
  | 'beginner'
  | 'novice'
  | 'intermediate'
  | 'advanced'
  | 'professional'
  | 'expert'
  | 'master'
  | 'grandmaster'
  | 'enlightened'

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timeFormat: '12h' | '24h'
  dateFormat: string
  startOfWeek: 0 | 1
  defaultView: ViewType
  defaultProject?: string
  defaultPriority?: Priority
  enableKarma: boolean
  dailyGoal: number
  weeklyGoal: number
  daysOff: number[]
  vacationMode: boolean
  enableNotifications: boolean
}

export interface Project {
  id: string
  name: string
  color: string
  description?: string
  viewType: ViewType
  isFavorite: boolean
  isShared: boolean
  parentProjectId?: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
  order: number
  archived: boolean
}

export interface Section {
  id: string
  projectId: string
  name: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface RecurrencePattern {
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  startDate: Date
  endDate?: Date
  exceptions: Date[]
}

export interface Task {
  id: string
  projectId?: string
  sectionId?: string
  content: string
  description?: string
  priority: Priority
  dueDate?: Date
  dueTime?: string
  completed: boolean
  completedAt?: Date
  duration?: number
  recurrence?: RecurrencePattern
  parentTaskId?: string
  assigneeId?: string
  createdAt: Date
  updatedAt: Date
  order: number
  reminders: Reminder[]
  labels: string[]
  attachments: Attachment[]
}

export interface Reminder {
  id: string
  taskId: string
  type: 'before' | 'at' | 'location'
  minutesBefore?: number
  reminderTime?: string
  location?: string
  notified: boolean
  createdAt: Date
}

export interface Label {
  id: string
  name: string
  color: string
  ownerId: string
  isShared: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  attachments: Attachment[]
  mentions: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Attachment {
  id: string
  fileName: string
  url: string
  type: string
  size: number
  uploadedAt: Date
}

export interface Filter {
  id: string
  name: string
  query: string
  color?: string
  ownerId: string
  isFavorite: boolean
  viewType: ViewType
  createdAt: Date
  updatedAt: Date
}

export interface ActivityLog {
  id: string
  taskId: string
  userId: string
  action: 'created' | 'updated' | 'completed' | 'deleted' | 'moved'
  changes?: Record<string, unknown>
  timestamp: Date
}

export interface ProjectShare {
  id: string
  projectId: string
  userId: string
  role: UserRole
  invitedBy: string
  invitedAt: Date
  acceptedAt?: Date
}

export interface ProductivityStats {
  tasksCompletedToday: number
  tasksCompletedThisWeek: number
  totalTasksCompleted: number
  currentStreak: number
  longestStreak: number
  dailyGoal: number
  weeklyGoal: number
  lastCompletedAt?: Date
}

export interface SyncQueue {
  id: string
  action: 'create' | 'update' | 'delete'
  entityType: 'task' | 'project' | 'section' | 'label'
  entityId: string
  data: unknown
  timestamp: Date
  synced: boolean
}
