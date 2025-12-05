import { create } from 'zustand'
import { db } from '@/db/database'

export interface CompletionStats {
  totalTasks: number
  completedTasks: number
  completionRate: number
  averagePerDay: number
  averagePerWeek: number
}

export interface ProductivityData {
  date: Date
  tasksCompleted: number
  tasksCreated: number
  averagePriority: string
}

export interface MemberStats {
  userId: string
  name: string
  avatar?: string
  tasksCompleted: number
  tasksCreated: number
  completionRate: number
  averageCompletionTime: number
}

export interface AtRiskTask {
  id: string
  content: string
  dueDate: Date
  priority: string
  assigneeIds?: string[]
  daysOverdue: number
}

export interface ComparisonStats {
  period1: {
    label: string
    tasksCompleted: number
    completionRate: number
  }
  period2: {
    label: string
    tasksCompleted: number
    completionRate: number
  }
  changePercentage: number
}

export interface AnalyticsReport {
  id: string
  title: string
  dateRange: {
    start: Date
    end: Date
  }
  format: 'pdf' | 'csv'
  generatedAt: Date
  status: 'pending' | 'completed' | 'failed'
  fileUrl?: string
}

interface AnalyticsState {
  // Data
  completionStats: CompletionStats | null
  productivityData: ProductivityData[]
  memberStats: MemberStats[]
  atRiskTasks: AtRiskTask[]
  comparisonStats: ComparisonStats | null
  reports: AnalyticsReport[]

  // Calculation methods
  getPersonalAnalytics: (userId: string, dateRange?: { start: Date; end: Date }) => Promise<void>
  getTeamAnalytics: (teamId: string, dateRange?: { start: Date; end: Date }) => Promise<void>
  getProductivityTimeline: (
    userId: string,
    granularity: 'daily' | 'weekly' | 'monthly',
    dateRange?: { start: Date; end: Date }
  ) => Promise<void>
  getAtRiskTasks: (userId: string) => Promise<void>
  getComparisonAnalytics: (
    userId: string,
    period1: { start: Date; end: Date },
    period2: { start: Date; end: Date }
  ) => Promise<void>
  getMemberStats: (teamId: string, dateRange?: { start: Date; end: Date }) => Promise<void>

  // Report generation
  generateReport: (
    userId: string,
    format: 'pdf' | 'csv',
    dateRange: { start: Date; end: Date }
  ) => Promise<string>
  exportAsCSV: (data: unknown, filename: string) => void
  exportAsPDF: (data: unknown, filename: string) => void
  getReports: (userId: string) => Promise<void>

  // UI state
  isLoading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  completionStats: null,
  productivityData: [],
  memberStats: [],
  atRiskTasks: [],
  comparisonStats: null,
  reports: [],
  isLoading: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Personal Analytics: completion rate, total tasks, average daily tasks
  getPersonalAnalytics: async (_userId, dateRange) => {
    try {
      set({ isLoading: true, error: null })

      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const start = dateRange?.start || thirtyDaysAgo
      const end = dateRange?.end || now

      const userTasks = await db.tasks.toArray()
      const tasksInRange = userTasks.filter((task) => {
        const createdAt = task.createdAt
        return createdAt >= start && createdAt <= end
      })

      const completedTasks = tasksInRange.filter((task) => task.completed)
      const daysDiff = Math.max(
        1,
        Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
      )

      const stats: CompletionStats = {
        totalTasks: tasksInRange.length,
        completedTasks: completedTasks.length,
        completionRate:
          tasksInRange.length > 0 ? (completedTasks.length / tasksInRange.length) * 100 : 0,
        averagePerDay: Math.round((tasksInRange.length / daysDiff) * 100) / 100,
        averagePerWeek: Math.round((tasksInRange.length / daysDiff) * 7 * 100) / 100,
      }

      set({ completionStats: stats, isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: `Failed to calculate personal analytics: ${error}` })
    }
  },

  // Team Analytics: team completion rates, member comparison
  getTeamAnalytics: async (teamId, dateRange) => {
    try {
      set({ isLoading: true, error: null })

      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const start = dateRange?.start || thirtyDaysAgo
      const end = dateRange?.end || now

      const teamMembers = await db.teamMembers.where('teamId').equals(teamId).toArray()
      const allTasks = await db.tasks.toArray()

      const memberStatsArray: MemberStats[] = []

      for (const member of teamMembers) {
        const memberTasks = allTasks.filter(
          (task) =>
            task.createdBy === member.userId ||
            (task.assigneeIds && task.assigneeIds.includes(member.userId))
        )

        const tasksInRange = memberTasks.filter((task) => {
          const createdAt = task.createdAt
          return createdAt >= start && createdAt <= end
        })

        const completedTasks = tasksInRange.filter((task) => task.completed)

        memberStatsArray.push({
          userId: member.userId,
          name: member.name || 'Unknown',
          avatar: member.avatar,
          tasksCompleted: completedTasks.length,
          tasksCreated: tasksInRange.length,
          completionRate:
            tasksInRange.length > 0 ? (completedTasks.length / tasksInRange.length) * 100 : 0,
          averageCompletionTime:
            tasksInRange.length > 0
              ? Math.floor(
                  (end.getTime() - start.getTime()) / tasksInRange.length / (60 * 60 * 1000)
                )
              : 0,
        })
      }

      set({ memberStats: memberStatsArray, isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: `Failed to calculate team analytics: ${error}` })
    }
  },

  // Productivity Timeline: daily/weekly/monthly granularity
  getProductivityTimeline: async (userId, granularity, dateRange) => {
    try {
      set({ isLoading: true, error: null })

      const now = new Date()
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

      const start = dateRange?.start || ninetyDaysAgo
      const end = dateRange?.end || now

      const allTasks = await db.tasks.toArray()
      const userTasks = allTasks.filter((task) => task.createdBy === userId)

      const dataMap = new Map<string, ProductivityData>()

      userTasks.forEach((task) => {
        const createdAt = new Date(task.createdAt)
        if (createdAt >= start && createdAt <= end) {
          let dateKey = ''

          if (granularity === 'daily') {
            dateKey = createdAt.toISOString().split('T')[0]
          } else if (granularity === 'weekly') {
            const weekStart = new Date(createdAt)
            weekStart.setDate(weekStart.getDate() - weekStart.getDay())
            dateKey = weekStart.toISOString().split('T')[0]
          } else if (granularity === 'monthly') {
            dateKey = createdAt.toISOString().slice(0, 7)
          }

          if (!dataMap.has(dateKey)) {
            dataMap.set(dateKey, {
              date: new Date(dateKey),
              tasksCompleted: 0,
              tasksCreated: 0,
              averagePriority: 'p3',
            })
          }

          const data = dataMap.get(dateKey)!
          data.tasksCreated += 1
          if (task.completed) {
            data.tasksCompleted += 1
          }
        }
      })

      const timeline = Array.from(dataMap.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      )

      set({ productivityData: timeline, isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: `Failed to calculate productivity timeline: ${error}` })
    }
  },

  // At-Risk Tasks: overdue tasks, approaching deadlines
  getAtRiskTasks: async (userId) => {
    try {
      set({ isLoading: true, error: null })

      const now = new Date()
      const allTasks = await db.tasks.toArray()

      const userTasks = allTasks.filter(
        (task) =>
          task.createdBy === userId || (task.assigneeIds && task.assigneeIds.includes(userId))
      )

      const atRisk: AtRiskTask[] = []

      userTasks.forEach((task) => {
        if (!task.completed && task.dueDate) {
          const dueDate = new Date(task.dueDate)
          const daysUntilDue = Math.floor(
            (dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
          )

          if (daysUntilDue < 3) {
            const daysOverdue = daysUntilDue < 0 ? Math.abs(daysUntilDue) : 0

            atRisk.push({
              id: task.id,
              content: task.content,
              dueDate,
              priority: task.priority || 'p3',
              assigneeIds: task.assigneeIds,
              daysOverdue,
            })
          }
        }
      })

      set({
        atRiskTasks: atRisk.sort((a, b) => b.daysOverdue - a.daysOverdue),
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false, error: `Failed to get at-risk tasks: ${error}` })
    }
  },

  // Comparison Analytics: this week vs last week, this month vs last month
  getComparisonAnalytics: async (userId, period1, period2) => {
    try {
      set({ isLoading: true, error: null })

      const allTasks = await db.tasks.toArray()

      const getTasks = (start: Date, end: Date) => {
        return allTasks.filter((task) => {
          const createdAt = task.createdAt
          return createdAt >= start && createdAt <= end && task.createdBy === userId
        })
      }

      const tasks1 = getTasks(period1.start, period1.end)
      const tasks2 = getTasks(period2.start, period2.end)

      const completed1 = tasks1.filter((t) => t.completed).length
      const completed2 = tasks2.filter((t) => t.completed).length

      const rate1 = tasks1.length > 0 ? (completed1 / tasks1.length) * 100 : 0
      const rate2 = tasks2.length > 0 ? (completed2 / tasks2.length) * 100 : 0

      const comparison: ComparisonStats = {
        period1: {
          label: `${period1.start.toLocaleDateString()} - ${period1.end.toLocaleDateString()}`,
          tasksCompleted: completed1,
          completionRate: rate1,
        },
        period2: {
          label: `${period2.start.toLocaleDateString()} - ${period2.end.toLocaleDateString()}`,
          tasksCompleted: completed2,
          completionRate: rate2,
        },
        changePercentage: rate2 - rate1,
      }

      set({ comparisonStats: comparison, isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: `Failed to calculate comparison analytics: ${error}` })
    }
  },

  // Member Stats: for team dashboards
  getMemberStats: async (teamId, dateRange) => {
    try {
      set({ isLoading: true, error: null })
      // Delegates to getTeamAnalytics for consistency
      await get().getTeamAnalytics(teamId, dateRange)
      set({ isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: `Failed to get member stats: ${error}` })
    }
  },

  // Report Generation
  generateReport: async (userId, format, dateRange) => {
    try {
      set({ isLoading: true, error: null })

      const reportId = `report-${Date.now()}`
      const report: AnalyticsReport = {
        id: reportId,
        title: `Analytics Report - ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`,
        dateRange,
        format,
        generatedAt: new Date(),
        status: 'pending',
      }

      // Fetch analytics data
      await get().getPersonalAnalytics(userId, dateRange)
      const completionStats = get().completionStats

      // Generate file (stub - in production would use backend)
      if (format === 'csv') {
        const csvContent = [
          ['Analytics Report'],
          [
            'Date Range',
            `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`,
          ],
          ['Total Tasks', completionStats?.totalTasks || 0],
          ['Completed Tasks', completionStats?.completedTasks || 0],
          ['Completion Rate', `${(completionStats?.completionRate || 0).toFixed(2)}%`],
          ['Average Per Day', completionStats?.averagePerDay || 0],
          ['Average Per Week', completionStats?.averagePerWeek || 0],
        ]
          .map((row) => row.join(','))
          .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)

        report.fileUrl = url
        report.status = 'completed'
      } else if (format === 'pdf') {
        // PDF generation stub
        report.status = 'completed'
        report.fileUrl = '#'
      }

      set((state) => ({
        reports: [...state.reports, report],
        isLoading: false,
      }))

      return report.id
    } catch (error) {
      set({ isLoading: false, error: `Failed to generate report: ${error}` })
      return ''
    }
  },

  // Export as CSV
  exportAsCSV: (data, filename) => {
    try {
      const csv = JSON.stringify(data, null, 2)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export CSV:', error)
    }
  },

  // Export as PDF (stub - would use a PDF library in production)
  exportAsPDF: (data, filename) => {
    try {
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export PDF:', error)
    }
  },

  // Get reports for user
  getReports: async () => {
    try {
      set({ isLoading: true, error: null })
      // In production, fetch from backend
      const userReports = get().reports.filter((r) => r.generatedAt.getTime() > 0)
      set({ reports: userReports, isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: `Failed to fetch reports: ${error}` })
    }
  },
}))
