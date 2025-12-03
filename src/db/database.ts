import Dexie, { Table } from 'dexie'
import type {
  User,
  Project,
  Section,
  Task,
  Label,
  Comment,
  Filter,
  ActivityLog,
  ProjectShare,
  Reminder,
  SyncQueue,
} from '@/types'

export class TodoneDB extends Dexie {
  users!: Table<User>
  projects!: Table<Project>
  sections!: Table<Section>
  tasks!: Table<Task>
  labels!: Table<Label>
  comments!: Table<Comment>
  filters!: Table<Filter>
  activityLogs!: Table<ActivityLog>
  projectShares!: Table<ProjectShare>
  reminders!: Table<Reminder>
  syncQueue!: Table<SyncQueue>

  constructor() {
    super('TodoneDB')
    this.version(1).stores({
      users: 'id, email',
      projects: 'id, ownerId, parentProjectId, [ownerId+createdAt]',
      sections: 'id, projectId, [projectId+order]',
      tasks: 'id, projectId, sectionId, parentTaskId, [projectId+order], [sectionId+order], completed, dueDate',
      labels: 'id, ownerId, [ownerId+name]',
      comments: 'id, taskId, [taskId+createdAt]',
      filters: 'id, ownerId, [ownerId+createdAt]',
      activityLogs: 'id, taskId, [taskId+timestamp], [userId+timestamp]',
      projectShares: 'id, projectId, userId, [projectId+userId]',
      reminders: 'id, taskId, notified',
      syncQueue: 'id, entityType, synced, [synced+timestamp]',
    })
  }
}

export const db = new TodoneDB()

/**
 * Initialize database with default data for new users
 */
export async function initializeDatabase(userId: string): Promise<void> {
  const existingUser = await db.users.get(userId)
  if (existingUser) return

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
