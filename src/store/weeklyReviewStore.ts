import { create } from 'zustand'
import { db } from '@/db/database'
import type { Task, Project } from '@/types'

export interface WeeklyMetrics {
  tasksCompleted: number
  tasksCreated: number
  completionRate: number
  averageCompletionTime: number
  busiestDay: string
  topProject: { name: string; tasksCompleted: number } | null
  karmaEarned: number
  streakStatus: { current: number; best: number }
  comparedToLastWeek: {
    tasksCompleted: number
    completionRate: number
  }
}

interface WeeklyReviewState {
  metrics: WeeklyMetrics | null
  completedTasks: Task[]
  slippedTasks: Task[]
  upcomingTasks: Task[]
  topProjects: Array<{ project: Project; tasksCompleted: number }>
  loading: boolean
  error: string | null
  weekStart: Date
  weekEnd: Date
}

interface WeeklyReviewActions {
  loadWeeklyReview: (userId: string, weekOffset?: number) => Promise<void>
  getWeekBoundaries: (offset?: number) => { start: Date; end: Date }
  calculateMetrics: (
    tasks: Task[],
    projects: Project[],
    weekStart: Date,
    weekEnd: Date,
    previousWeekMetrics?: { completed: number; completionRate: number }
  ) => WeeklyMetrics
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const useWeeklyReviewStore = create<WeeklyReviewState & WeeklyReviewActions>(
  (set, get) => ({
    metrics: null,
    completedTasks: [],
    slippedTasks: [],
    upcomingTasks: [],
    topProjects: [],
    loading: false,
    error: null,
    weekStart: new Date(),
    weekEnd: new Date(),

    getWeekBoundaries: (offset = 0) => {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

      const start = new Date(now)
      start.setDate(now.getDate() + diffToMonday + offset * 7)
      start.setHours(0, 0, 0, 0)

      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)

      return { start, end }
    },

    calculateMetrics: (tasks, projects, weekStart, weekEnd, previousWeekMetrics) => {
      const completedThisWeek = tasks.filter(
        (t) =>
          t.completed &&
          t.completedAt &&
          new Date(t.completedAt) >= weekStart &&
          new Date(t.completedAt) <= weekEnd
      )

      const createdThisWeek = tasks.filter(
        (t) => new Date(t.createdAt) >= weekStart && new Date(t.createdAt) <= weekEnd
      )

      const overdueThisWeek = tasks.filter(
        (t) =>
          !t.completed &&
          t.dueDate &&
          new Date(t.dueDate) >= weekStart &&
          new Date(t.dueDate) <= weekEnd
      )

      const tasksCompleted = completedThisWeek.length
      const tasksCreated = createdThisWeek.length
      const completionRate =
        tasksCompleted + overdueThisWeek.length > 0
          ? Math.round((tasksCompleted / (tasksCompleted + overdueThisWeek.length)) * 100)
          : 0

      // Calculate average completion time
      let totalCompletionTime = 0
      let completedWithTime = 0
      for (const task of completedThisWeek) {
        if (task.completedAt) {
          const created = new Date(task.createdAt).getTime()
          const completed = new Date(task.completedAt).getTime()
          totalCompletionTime += (completed - created) / (1000 * 60 * 60)
          completedWithTime++
        }
      }
      const averageCompletionTime =
        completedWithTime > 0 ? Math.round(totalCompletionTime / completedWithTime) : 0

      // Find busiest day
      const dayCount: Record<number, number> = {}
      for (const task of completedThisWeek) {
        if (task.completedAt) {
          const day = new Date(task.completedAt).getDay()
          dayCount[day] = (dayCount[day] || 0) + 1
        }
      }
      const busiestDayNum = Object.entries(dayCount).sort(([, a], [, b]) => b - a)[0]?.[0]
      const busiestDay = busiestDayNum ? DAYS[parseInt(busiestDayNum)] : 'N/A'

      // Find top project
      const projectCount: Record<string, number> = {}
      for (const task of completedThisWeek) {
        if (task.projectId) {
          projectCount[task.projectId] = (projectCount[task.projectId] || 0) + 1
        }
      }
      const topProjectId = Object.entries(projectCount).sort(([, a], [, b]) => b - a)[0]?.[0]
      const topProjectData = projects.find((p) => p.id === topProjectId)
      const topProject = topProjectData
        ? { name: topProjectData.name, tasksCompleted: projectCount[topProjectId] }
        : null

      // Calculate karma earned (estimate: 10 base + priority multipliers)
      let karmaEarned = 0
      for (const task of completedThisWeek) {
        const multiplier =
          task.priority === 'p1' ? 3 : task.priority === 'p2' ? 2 : task.priority === 'p3' ? 1.5 : 1
        karmaEarned += Math.round(10 * multiplier)
      }

      // Compared to last week
      const comparedToLastWeek = {
        tasksCompleted: previousWeekMetrics
          ? tasksCompleted - previousWeekMetrics.completed
          : tasksCompleted,
        completionRate: previousWeekMetrics
          ? completionRate - previousWeekMetrics.completionRate
          : 0,
      }

      return {
        tasksCompleted,
        tasksCreated,
        completionRate,
        averageCompletionTime,
        busiestDay,
        topProject,
        karmaEarned,
        streakStatus: { current: 0, best: 0 },
        comparedToLastWeek,
      }
    },

    loadWeeklyReview: async (userId: string, weekOffset = 0) => {
      set({ loading: true, error: null })
      try {
        const { start: weekStart, end: weekEnd } = get().getWeekBoundaries(weekOffset)
        const { start: prevWeekStart, end: prevWeekEnd } = get().getWeekBoundaries(weekOffset - 1)

        // Load tasks and projects
        const allTasks = await db.tasks.toArray()
        const projects = await db.projects.where('ownerId').equals(userId).toArray()

        // Get user stats for streak info
        const userStats = await db.userStats?.get(userId)

        // Calculate previous week metrics for comparison
        const prevCompletedTasks = allTasks.filter(
          (t) =>
            t.completed &&
            t.completedAt &&
            new Date(t.completedAt) >= prevWeekStart &&
            new Date(t.completedAt) <= prevWeekEnd
        )
        const prevOverdueTasks = allTasks.filter(
          (t) =>
            !t.completed &&
            t.dueDate &&
            new Date(t.dueDate) >= prevWeekStart &&
            new Date(t.dueDate) <= prevWeekEnd
        )
        const previousWeekMetrics = {
          completed: prevCompletedTasks.length,
          completionRate:
            prevCompletedTasks.length + prevOverdueTasks.length > 0
              ? Math.round(
                  (prevCompletedTasks.length /
                    (prevCompletedTasks.length + prevOverdueTasks.length)) *
                    100
                )
              : 0,
        }

        // Calculate current week metrics
        const metrics = get().calculateMetrics(
          allTasks,
          projects,
          weekStart,
          weekEnd,
          previousWeekMetrics
        )

        // Update streak info from user stats
        if (userStats) {
          metrics.streakStatus = {
            current: userStats.currentStreak,
            best: userStats.longestStreak,
          }
        }

        // Get completed tasks this week
        const completedTasks = allTasks.filter(
          (t) =>
            t.completed &&
            t.completedAt &&
            new Date(t.completedAt) >= weekStart &&
            new Date(t.completedAt) <= weekEnd
        )

        // Get slipped/overdue tasks (due this week but not completed)
        const slippedTasks = allTasks.filter(
          (t) =>
            !t.completed &&
            t.dueDate &&
            new Date(t.dueDate) >= weekStart &&
            new Date(t.dueDate) <= weekEnd
        )

        // Get upcoming tasks for next week
        const { start: nextWeekStart, end: nextWeekEnd } = get().getWeekBoundaries(weekOffset + 1)
        const upcomingTasks = allTasks.filter(
          (t) =>
            !t.completed &&
            t.dueDate &&
            new Date(t.dueDate) >= nextWeekStart &&
            new Date(t.dueDate) <= nextWeekEnd
        )

        // Get top projects
        const projectCompletions: Record<string, number> = {}
        for (const task of completedTasks) {
          if (task.projectId) {
            projectCompletions[task.projectId] = (projectCompletions[task.projectId] || 0) + 1
          }
        }
        const topProjects = Object.entries(projectCompletions)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([projectId, count]) => ({
            project: projects.find((p) => p.id === projectId)!,
            tasksCompleted: count,
          }))
          .filter((tp) => tp.project)

        set({
          metrics,
          completedTasks,
          slippedTasks,
          upcomingTasks,
          topProjects,
          weekStart,
          weekEnd,
          loading: false,
        })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load weekly review',
          loading: false,
        })
      }
    },
  })
)
