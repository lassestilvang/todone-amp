import { create } from 'zustand'
import { db } from '@/db/database'
import type { DailyReview, DailyReviewSettings, DailyReviewType } from '@/types'

export type MorningStep =
  | 'review-overdue'
  | 'today-preview'
  | 'set-intention'
  | 'review-complete'

export type EveningStep =
  | 'celebrate-completed'
  | 'reschedule-incomplete'
  | 'tomorrow-preview'
  | 'add-reflection'
  | 'evening-complete'

export type ReviewStep = MorningStep | EveningStep

const MORNING_STEPS: MorningStep[] = [
  'review-overdue',
  'today-preview',
  'set-intention',
  'review-complete',
]

const EVENING_STEPS: EveningStep[] = [
  'celebrate-completed',
  'reschedule-incomplete',
  'tomorrow-preview',
  'add-reflection',
  'evening-complete',
]

const DEFAULT_SETTINGS: Omit<DailyReviewSettings, 'userId'> = {
  morningReviewEnabled: true,
  morningReviewTime: '08:00',
  eveningReviewEnabled: true,
  eveningReviewTime: '18:00',
  autoPrompt: true,
}

interface DailyReviewState {
  isOpen: boolean
  currentStep: ReviewStep
  reviewType: DailyReviewType
  settings: DailyReviewSettings | null
  reviews: DailyReview[]
  intention: string
  reflection: string
  rescheduledTaskIds: string[]
  reviewedOverdueTaskIds: string[]
  loading: boolean
  error: string | null
}

interface DailyReviewActions {
  startMorningReview: () => void
  startEveningReview: () => void
  nextStep: () => void
  prevStep: () => void
  setIntention: (intention: string) => void
  setReflection: (reflection: string) => void
  completeReview: (userId: string, completedTaskCount: number) => Promise<void>
  loadSettings: (userId: string) => Promise<void>
  updateSettings: (userId: string, updates: Partial<DailyReviewSettings>) => Promise<void>
  rescheduleTask: (taskId: string) => void
  markOverdueReviewed: (taskId: string) => void
  shouldShowReviewPrompt: (userId: string) => Promise<{ show: boolean; type: DailyReviewType }>
  closeReview: () => void
  loadReviews: (userId: string) => Promise<void>
  getSteps: () => ReviewStep[]
  getCurrentStepIndex: () => number
  getTotalSteps: () => number
}

export const useDailyReviewStore = create<DailyReviewState & DailyReviewActions>((set, get) => ({
  isOpen: false,
  currentStep: 'review-overdue',
  reviewType: 'morning',
  settings: null,
  reviews: [],
  intention: '',
  reflection: '',
  rescheduledTaskIds: [],
  reviewedOverdueTaskIds: [],
  loading: false,
  error: null,

  startMorningReview: () => {
    set({
      isOpen: true,
      reviewType: 'morning',
      currentStep: 'review-overdue',
      intention: '',
      reflection: '',
      rescheduledTaskIds: [],
      reviewedOverdueTaskIds: [],
    })
  },

  startEveningReview: () => {
    set({
      isOpen: true,
      reviewType: 'evening',
      currentStep: 'celebrate-completed',
      intention: '',
      reflection: '',
      rescheduledTaskIds: [],
      reviewedOverdueTaskIds: [],
    })
  },

  nextStep: () => {
    const { reviewType, currentStep } = get()
    const steps = reviewType === 'morning' ? MORNING_STEPS : EVENING_STEPS
    const currentIndex = steps.indexOf(currentStep as MorningStep & EveningStep)

    if (currentIndex < steps.length - 1) {
      set({ currentStep: steps[currentIndex + 1] })
    }
  },

  prevStep: () => {
    const { reviewType, currentStep } = get()
    const steps = reviewType === 'morning' ? MORNING_STEPS : EVENING_STEPS
    const currentIndex = steps.indexOf(currentStep as MorningStep & EveningStep)

    if (currentIndex > 0) {
      set({ currentStep: steps[currentIndex - 1] })
    }
  },

  setIntention: (intention: string) => {
    set({ intention })
  },

  setReflection: (reflection: string) => {
    set({ reflection })
  },

  completeReview: async (userId: string, completedTaskCount: number) => {
    const state = get()
    const now = new Date()

    const review: DailyReview = {
      id: `review-${Date.now()}`,
      userId,
      date: now,
      type: state.reviewType,
      intention: state.intention || undefined,
      reflection: state.reflection || undefined,
      overdueTasks: state.reviewedOverdueTaskIds,
      rescheduledTasks: state.rescheduledTaskIds,
      completedTaskCount,
      completedAt: now,
      createdAt: now,
    }

    try {
      await db.dailyReviews?.add(review)

      const settings = state.settings
      if (settings) {
        const updateData: Partial<DailyReviewSettings> =
          state.reviewType === 'morning'
            ? { lastMorningReview: now }
            : { lastEveningReview: now }
        await db.dailyReviewSettings?.update(userId, updateData)
        set({
          settings: { ...settings, ...updateData },
        })
      }

      set({
        isOpen: false,
        reviews: [...state.reviews, review],
        intention: '',
        reflection: '',
        rescheduledTaskIds: [],
        reviewedOverdueTaskIds: [],
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to complete review',
      })
    }
  },

  loadSettings: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      let settings = await db.dailyReviewSettings?.get(userId)

      if (!settings) {
        settings = { userId, ...DEFAULT_SETTINGS }
        await db.dailyReviewSettings?.add(settings)
      }

      set({ settings, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load settings',
        loading: false,
      })
    }
  },

  updateSettings: async (userId: string, updates: Partial<DailyReviewSettings>) => {
    const state = get()
    const currentSettings = state.settings ?? { userId, ...DEFAULT_SETTINGS }

    const updatedSettings: DailyReviewSettings = {
      ...currentSettings,
      ...updates,
    }

    try {
      await db.dailyReviewSettings?.put(updatedSettings)
      set({ settings: updatedSettings })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update settings',
      })
    }
  },

  rescheduleTask: (taskId: string) => {
    const { rescheduledTaskIds } = get()
    if (!rescheduledTaskIds.includes(taskId)) {
      set({ rescheduledTaskIds: [...rescheduledTaskIds, taskId] })
    }
  },

  markOverdueReviewed: (taskId: string) => {
    const { reviewedOverdueTaskIds } = get()
    if (!reviewedOverdueTaskIds.includes(taskId)) {
      set({ reviewedOverdueTaskIds: [...reviewedOverdueTaskIds, taskId] })
    }
  },

  shouldShowReviewPrompt: async (userId: string) => {
    const state = get()
    let settings = state.settings

    if (!settings) {
      await get().loadSettings(userId)
      settings = get().settings
    }

    if (!settings || !settings.autoPrompt) {
      return { show: false, type: 'morning' as DailyReviewType }
    }

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [morningHour, morningMinute] = settings.morningReviewTime.split(':').map(Number)
    const [eveningHour, eveningMinute] = settings.eveningReviewTime.split(':').map(Number)

    const isMorningTime =
      currentHour > morningHour ||
      (currentHour === morningHour && currentMinute >= morningMinute)
    const isEveningTime =
      currentHour > eveningHour ||
      (currentHour === eveningHour && currentMinute >= eveningMinute)

    const lastMorning = settings.lastMorningReview
      ? new Date(settings.lastMorningReview)
      : null
    const lastEvening = settings.lastEveningReview
      ? new Date(settings.lastEveningReview)
      : null

    const didMorningToday = lastMorning && lastMorning >= today
    const didEveningToday = lastEvening && lastEvening >= today

    if (settings.eveningReviewEnabled && isEveningTime && !didEveningToday) {
      return { show: true, type: 'evening' }
    }

    if (settings.morningReviewEnabled && isMorningTime && !isEveningTime && !didMorningToday) {
      return { show: true, type: 'morning' }
    }

    return { show: false, type: 'morning' }
  },

  closeReview: () => {
    set({
      isOpen: false,
      intention: '',
      reflection: '',
      rescheduledTaskIds: [],
      reviewedOverdueTaskIds: [],
    })
  },

  loadReviews: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const reviews = await db.dailyReviews?.where('userId').equals(userId).reverse().sortBy('date')
      set({ reviews: reviews ?? [], loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load reviews',
        loading: false,
      })
    }
  },

  getSteps: () => {
    const { reviewType } = get()
    return reviewType === 'morning' ? MORNING_STEPS : EVENING_STEPS
  },

  getCurrentStepIndex: () => {
    const { reviewType, currentStep } = get()
    const steps = reviewType === 'morning' ? MORNING_STEPS : EVENING_STEPS
    return steps.indexOf(currentStep as MorningStep & EveningStep)
  },

  getTotalSteps: () => {
    const { reviewType } = get()
    return reviewType === 'morning' ? MORNING_STEPS.length : EVENING_STEPS.length
  },
}))
