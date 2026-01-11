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

export interface NotificationPreferencesType {
  enableEmailNotifications: boolean
  enableBrowserNotifications: boolean
  enableSoundNotifications: boolean
  enablePushNotifications: boolean
  quietHours?: {
    enabled: boolean
    startTime: string
    endTime: string
  }
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  accentColor?: string
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
  experimentalFeatures?: boolean
  enableNotifications: boolean
  notificationPreferences?: NotificationPreferencesType
  showOnLeaderboard?: boolean
  allowAnalytics?: boolean
  shareAchievements?: boolean
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
  syncStatus?: 'synced' | 'pending' | 'syncing' | 'error'
}

export interface Section {
  id: string
  projectId: string
  name: string
  order: number
  createdAt: Date
  updatedAt: Date
  syncStatus?: 'synced' | 'pending' | 'syncing' | 'error'
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

export interface AIMetadata {
  parsedFromText?: string
  extractedAt?: Date
  confidence?: number
  suggestedAlternatives?: ParsedTaskSuggestion[]
  suggestedProjectId?: string
  suggestedLabels?: string[]
  suggestedParentTaskId?: string
  suggestedDependencyTaskIds?: string[]
  sourceType?: 'manual' | 'email' | 'natural_language'
}

export interface ParsedTaskSuggestion {
  content: string
  priority?: Priority
  dueDate?: Date
  dueTime?: string
  confidence: number
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
  aiMetadata?: AIMetadata
  syncStatus?: 'synced' | 'pending' | 'syncing' | 'error'
}

export interface Reminder {
  id: string
  taskId: string
  type: 'before' | 'at' | 'location' | 'manual'
  minutesBefore?: number
  reminderTime?: string
  location?: string
  remindAt: Date
  notified: boolean
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  message: string
  type: 'task_assigned' | 'task_shared' | 'reminder' | 'comment' | 'system'
  relatedTaskId?: string
  read: boolean
  archived: boolean
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
  syncStatus?: 'synced' | 'pending' | 'syncing' | 'error'
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
  | 'shared'
  | 'unshared'
  | 'permissionChanged'
  | 'memberAdded'
  | 'memberRemoved'

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

export type IntegrationService = 'google' | 'outlook' | 'slack' | 'email'
export type SyncDirection = 'one-way' | 'two-way'
export type SyncFrequency = 'realtime' | 'hourly' | 'daily'

export interface CalendarIntegration {
  id: string
  userId: string
  service: 'google' | 'outlook'
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  calendarId: string
  calendarName: string
  displayColor: string
  selectedCalendars: string[]
  syncEnabled: boolean
  syncDirection: SyncDirection
  syncFrequency: SyncFrequency
  showExternalEvents: boolean
  timeZone: string
  connectedAt: Date
  lastSyncAt?: Date
  syncStatus: 'idle' | 'syncing' | 'error'
  syncError?: string
}

export interface CalendarEvent {
  id: string
  externalId: string
  service: 'google' | 'outlook'
  taskId?: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  duration: number
  location?: string
  attendees?: string[]
  isAllDay: boolean
  color?: string
  syncedAt: Date
}

export interface SyncHistory {
  id: string
  taskId?: string
  externalEventId?: string
  service: IntegrationService
  action: 'create' | 'update' | 'delete'
  direction: 'to-service' | 'from-service'
  syncedAt: Date
  status: 'success' | 'failed' | 'pending'
  error?: string
  metadata?: Record<string, unknown>
}

export interface UserIntegration {
  id: string
  userId: string
  service: IntegrationService
  isConnected: boolean
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
  settings: Record<string, unknown>
  connectedAt?: Date
  disconnectedAt?: Date
}

export interface EmailIntegration extends UserIntegration {
  forwardingAddress?: string
  forwardingEnabled: boolean
  parseEmailBody: boolean
  extractDueDate: boolean
  assignLabels: boolean
  defaultProject?: string
}

export interface SlackIntegration extends UserIntegration {
  teamId: string
  teamName: string
  slackUserId: string
  slackWorkspaceUrl: string
  notifyOnAssignment: boolean
  notifyOnMention: boolean
  notifyOnComments: boolean
  notifyOnOverdue: boolean
  dailyDigestEnabled: boolean
  dailyDigestTime: string
  digestChannel?: string
}

export interface UserStats {
  userId: string
  karma: number
  karmaLevel: KarmaLevel
  currentStreak: number
  longestStreak: number
  totalCompleted: number
  lastCompletedAt?: Date
  achievements: AchievementRecord[] | string[]
  updatedAt: Date
}

export interface AchievementRecord {
  id: string
  name: string
  description: string
  icon: string
  points: number
  unlockCriteria?: Record<string, unknown>
  createdAt: Date
}

export interface UserAchievementRecord {
  id: string
  userId: string
  achievementId: string
  unlockedAt: Date
  progress?: number
}

export type FocusSessionType = 'focus' | 'short-break' | 'long-break'

export type FocusSoundType = 'bell' | 'chime' | 'none'

export interface FocusSession {
  id: string
  userId: string
  taskId: string | null
  startTime: Date
  endTime: Date | null
  duration: number
  type: FocusSessionType
  completed: boolean
  interruptions: number
}

export interface FocusSettings {
  userId: string
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
  soundEnabled: boolean
  soundType: FocusSoundType
}
