import Dexie, { Table } from 'dexie'
import type {
  User,
  Project,
  Section,
  Task,
  Label,
  Comment,
  Filter,
  Activity,
  ProjectShare,
  Reminder,
  Notification,
  SyncQueue,
  Team,
  TeamMember,
  RecurrenceInstance,
  Template,
  UserTemplate,
  CalendarIntegration,
  CalendarEvent,
  SyncHistory,
  UserIntegration,
  UserStats,
  AchievementRecord,
  UserAchievementRecord,
  FocusSession,
  FocusSettings,
  DailyReview,
  DailyReviewSettings,
} from '@/types'

export class TodoneDB extends Dexie {
  users!: Table<User>
  projects!: Table<Project>
  sections!: Table<Section>
  tasks!: Table<Task>
  labels!: Table<Label>
  comments!: Table<Comment>
  activities!: Table<Activity>
  filters!: Table<Filter>
  projectShares!: Table<ProjectShare>
  reminders!: Table<Reminder>
  notifications!: Table<Notification>
  syncQueue!: Table<SyncQueue>
  teams!: Table<Team>
  teamMembers!: Table<TeamMember>
  recurrenceInstances!: Table<RecurrenceInstance>
  templates!: Table<Template>
  userTemplates!: Table<UserTemplate>
  calendarIntegrations!: Table<CalendarIntegration>
  calendarEvents!: Table<CalendarEvent>
  syncHistory!: Table<SyncHistory>
  userIntegrations!: Table<UserIntegration>
  userStats!: Table<UserStats>
  achievements!: Table<AchievementRecord>
  userAchievements!: Table<UserAchievementRecord>
  focusSessions!: Table<FocusSession>
  focusSettings!: Table<FocusSettings>
  dailyReviews!: Table<DailyReview>
  dailyReviewSettings!: Table<DailyReviewSettings>

  constructor() {
    super('TodoneDB')
    this.version(5).stores({
      users: 'id, email',
      projects: 'id, ownerId, teamId, parentProjectId, syncStatus, [ownerId+createdAt], [teamId+createdAt]',
      sections: 'id, projectId, syncStatus, [projectId+order]',
      tasks: 'id, projectId, sectionId, parentTaskId, syncStatus, [projectId+order], [sectionId+order], completed, dueDate, createdBy',
      labels: 'id, ownerId, syncStatus, [ownerId+name]',
      comments: 'id, taskId, userId, [taskId+createdAt], [taskId+userId]',
      activities: 'id, taskId, userId, [taskId+timestamp], [userId+timestamp], [taskId+action]',
      filters: 'id, ownerId, [ownerId+createdAt]',
      projectShares: 'id, projectId, userId, [projectId+userId]',
      reminders: 'id, taskId, notified, [taskId+remindAt]',
      notifications: 'id, userId, read, archived, [userId+read], [userId+createdAt]',
      syncQueue: 'id, entityType, synced, [synced+timestamp]',
      teams: 'id, ownerId, [ownerId+createdAt]',
      teamMembers: 'id, teamId, userId, [teamId+userId]',
      recurrenceInstances: 'id, taskId, baseTaskId, dueDate, [taskId+dueDate], [baseTaskId+dueDate], completed',
      templates: 'id, category, isPrebuilt, ownerId, [ownerId+createdAt], [category+isPrebuilt]',
      userTemplates: 'id, userId, templateId, isFavorite, [userId+templateId], [userId+isFavorite]',
      calendarIntegrations: 'id, userId, service, [userId+service]',
      calendarEvents: 'id, service, taskId, externalId, [taskId+externalId], [service+syncedAt]',
      syncHistory: 'id, taskId, externalEventId, service, [taskId+service], [syncedAt+status]',
      userIntegrations: 'id, userId, service, isConnected, [userId+service], [userId+isConnected]',
      userStats: 'userId, [userId+karma], [karma]',
      achievements: 'id, [createdAt]',
      userAchievements: 'id, userId, achievementId, [userId+achievementId], [userId+unlockedAt]',
      focusSessions: 'id, userId, taskId, startTime, type, completed, [userId+startTime], [taskId+startTime]',
      focusSettings: 'userId',
      dailyReviews: 'id, userId, date, type, [userId+date], [userId+type+date]',
      dailyReviewSettings: 'userId',
    })
  }
}

export const db = new TodoneDB()

/**
 * Initialize database with default data for new users
 */
export async function initializeDatabase(userId: string): Promise<void> {
  const existingInbox = await db.projects.where({ ownerId: userId, name: 'Inbox' }).first()
  if (existingInbox) return

  // Create default inbox project
  const inboxProject: Project = {
    id: `project-${Date.now()}`,
    name: 'Inbox',
    color: '#10b981',
    viewType: 'list',
    isFavorite: true,
    isShared: false,
    ownerId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 0,
    archived: false,
  }

  await db.projects.add(inboxProject)
}
