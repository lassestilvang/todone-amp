/**
 * Core type definitions for Todone application
 */

export type Priority = 'p1' | 'p2' | 'p3' | 'p4' | null

export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
export type ViewType = 'list' | 'board' | 'calendar'
export type UserRole = 'owner' | 'admin' | 'member'
export type TeamRole = 'owner' | 'admin' | 'member'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  currentTeamId?: string
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

export interface Team {
  id: string
  name: string
  description?: string
  avatar?: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: TeamRole
  joinedAt: Date
  email?: string
  name?: string
  avatar?: string
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
  teamId?: string
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

export interface RecurrenceException {
  date: Date
  reason: 'skipped' | 'rescheduled' | 'deleted'
  newDate?: Date // For rescheduled exceptions
  createdAt: Date
}

export interface RecurrencePattern {
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  startDate: Date
  endDate?: Date
  exceptions: Date[]
  exceptionDetails?: RecurrenceException[]
}

export interface RecurrenceInstance {
  id: string
  taskId: string
  dueDate: Date
  baseTaskId: string
  isException: boolean
  exceptionReason?: 'skipped' | 'rescheduled' | 'deleted'
  completed: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
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
  assigneeIds?: string[]
  createdBy?: string
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
  mentions: string[]
  attachments: Attachment[]
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  isDeleted?: boolean
}

export interface Attachment {
  id: string
  fileName: string
  url: string
  type: string
  size: number
  uploadedAt: Date
}

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'completed'
  | 'deleted'
  | 'moved'
  | 'assigned'
  | 'unassigned'
  | 'commented'
  | 'labeled'
  | 'unlabeled'
  | 'priorityChanged'
  | 'dateChanged'
  | 'statusChanged'

export interface Activity {
  id: string
  taskId: string
  userId: string
  action: ActivityAction
  changes?: Record<string, unknown>
  oldValue?: unknown
  newValue?: unknown
  timestamp: Date
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

export type TemplateCategory =
  | 'work'
  | 'personal'
  | 'education'
  | 'management'
  | 'marketing'
  | 'support'
  | 'health'
  | 'finance'
  | 'custom'

export interface TemplateTask {
  content: string
  description?: string
  priority: Priority
  labels?: string[]
}

export interface TemplateSection {
  name: string
  tasks: TemplateTask[]
}

export interface TemplateData {
  sections: TemplateSection[]
  labels?: string[]
  description?: string
}

export interface Template {
  id: string
  name: string
  description?: string
  category: TemplateCategory
  data: TemplateData
  isPrebuilt: boolean
  ownerId: string
  thumbnail?: string
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface UserTemplate {
  id: string
  userId: string
  templateId: string
  isFavorite: boolean
  lastUsedAt?: Date
  createdAt: Date
}
