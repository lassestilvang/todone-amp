import { describe, it, expect, beforeEach } from 'bun:test'
import { useDailyReviewStore } from './dailyReviewStore'

describe('dailyReviewStore', () => {
  beforeEach(() => {
    useDailyReviewStore.setState({
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
    })
  })

  describe('startMorningReview', () => {
    it('opens the modal with morning review type', () => {
      const store = useDailyReviewStore.getState()
      store.startMorningReview()

      const state = useDailyReviewStore.getState()
      expect(state.isOpen).toBe(true)
      expect(state.reviewType).toBe('morning')
      expect(state.currentStep).toBe('review-overdue')
    })

    it('resets all state when starting', () => {
      useDailyReviewStore.setState({
        intention: 'old intention',
        reflection: 'old reflection',
        rescheduledTaskIds: ['task-1'],
      })

      useDailyReviewStore.getState().startMorningReview()

      const state = useDailyReviewStore.getState()
      expect(state.intention).toBe('')
      expect(state.reflection).toBe('')
      expect(state.rescheduledTaskIds).toEqual([])
    })
  })

  describe('startEveningReview', () => {
    it('opens the modal with evening review type', () => {
      const store = useDailyReviewStore.getState()
      store.startEveningReview()

      const state = useDailyReviewStore.getState()
      expect(state.isOpen).toBe(true)
      expect(state.reviewType).toBe('evening')
      expect(state.currentStep).toBe('celebrate-completed')
    })
  })

  describe('nextStep', () => {
    it('advances to the next morning step', () => {
      useDailyReviewStore.setState({
        reviewType: 'morning',
        currentStep: 'review-overdue',
      })

      useDailyReviewStore.getState().nextStep()
      expect(useDailyReviewStore.getState().currentStep).toBe('today-preview')

      useDailyReviewStore.getState().nextStep()
      expect(useDailyReviewStore.getState().currentStep).toBe('set-intention')

      useDailyReviewStore.getState().nextStep()
      expect(useDailyReviewStore.getState().currentStep).toBe('review-complete')
    })

    it('does not advance past the last step', () => {
      useDailyReviewStore.setState({
        reviewType: 'morning',
        currentStep: 'review-complete',
      })

      useDailyReviewStore.getState().nextStep()
      expect(useDailyReviewStore.getState().currentStep).toBe('review-complete')
    })

    it('advances through evening steps', () => {
      useDailyReviewStore.setState({
        reviewType: 'evening',
        currentStep: 'celebrate-completed',
      })

      useDailyReviewStore.getState().nextStep()
      expect(useDailyReviewStore.getState().currentStep).toBe('reschedule-incomplete')

      useDailyReviewStore.getState().nextStep()
      expect(useDailyReviewStore.getState().currentStep).toBe('tomorrow-preview')
    })
  })

  describe('prevStep', () => {
    it('goes back to the previous step', () => {
      useDailyReviewStore.setState({
        reviewType: 'morning',
        currentStep: 'set-intention',
      })

      useDailyReviewStore.getState().prevStep()
      expect(useDailyReviewStore.getState().currentStep).toBe('today-preview')

      useDailyReviewStore.getState().prevStep()
      expect(useDailyReviewStore.getState().currentStep).toBe('review-overdue')
    })

    it('does not go back before the first step', () => {
      useDailyReviewStore.setState({
        reviewType: 'morning',
        currentStep: 'review-overdue',
      })

      useDailyReviewStore.getState().prevStep()
      expect(useDailyReviewStore.getState().currentStep).toBe('review-overdue')
    })
  })

  describe('setIntention', () => {
    it('sets the intention text', () => {
      useDailyReviewStore.getState().setIntention('Focus on shipping the feature')
      expect(useDailyReviewStore.getState().intention).toBe('Focus on shipping the feature')
    })
  })

  describe('setReflection', () => {
    it('sets the reflection text', () => {
      useDailyReviewStore.getState().setReflection('Good day overall, completed most tasks')
      expect(useDailyReviewStore.getState().reflection).toBe(
        'Good day overall, completed most tasks'
      )
    })
  })

  describe('rescheduleTask', () => {
    it('adds task id to rescheduled list', () => {
      useDailyReviewStore.getState().rescheduleTask('task-1')
      expect(useDailyReviewStore.getState().rescheduledTaskIds).toContain('task-1')
    })

    it('does not add duplicate task ids', () => {
      useDailyReviewStore.getState().rescheduleTask('task-1')
      useDailyReviewStore.getState().rescheduleTask('task-1')
      expect(useDailyReviewStore.getState().rescheduledTaskIds).toEqual(['task-1'])
    })
  })

  describe('markOverdueReviewed', () => {
    it('adds task id to reviewed overdue list', () => {
      useDailyReviewStore.getState().markOverdueReviewed('task-2')
      expect(useDailyReviewStore.getState().reviewedOverdueTaskIds).toContain('task-2')
    })

    it('does not add duplicate task ids', () => {
      useDailyReviewStore.getState().markOverdueReviewed('task-2')
      useDailyReviewStore.getState().markOverdueReviewed('task-2')
      expect(useDailyReviewStore.getState().reviewedOverdueTaskIds).toEqual(['task-2'])
    })
  })

  describe('closeReview', () => {
    it('closes the modal and resets state', () => {
      useDailyReviewStore.setState({
        isOpen: true,
        intention: 'test intention',
        reflection: 'test reflection',
        rescheduledTaskIds: ['task-1'],
        reviewedOverdueTaskIds: ['task-2'],
      })

      useDailyReviewStore.getState().closeReview()

      const state = useDailyReviewStore.getState()
      expect(state.isOpen).toBe(false)
      expect(state.intention).toBe('')
      expect(state.reflection).toBe('')
      expect(state.rescheduledTaskIds).toEqual([])
      expect(state.reviewedOverdueTaskIds).toEqual([])
    })
  })

  describe('getSteps', () => {
    it('returns morning steps for morning review', () => {
      useDailyReviewStore.setState({ reviewType: 'morning' })
      const steps = useDailyReviewStore.getState().getSteps()
      expect(steps).toEqual([
        'review-overdue',
        'today-preview',
        'set-intention',
        'review-complete',
      ])
    })

    it('returns evening steps for evening review', () => {
      useDailyReviewStore.setState({ reviewType: 'evening' })
      const steps = useDailyReviewStore.getState().getSteps()
      expect(steps).toEqual([
        'celebrate-completed',
        'reschedule-incomplete',
        'tomorrow-preview',
        'add-reflection',
        'evening-complete',
      ])
    })
  })

  describe('getCurrentStepIndex', () => {
    it('returns correct index for morning steps', () => {
      useDailyReviewStore.setState({
        reviewType: 'morning',
        currentStep: 'set-intention',
      })
      expect(useDailyReviewStore.getState().getCurrentStepIndex()).toBe(2)
    })

    it('returns correct index for evening steps', () => {
      useDailyReviewStore.setState({
        reviewType: 'evening',
        currentStep: 'tomorrow-preview',
      })
      expect(useDailyReviewStore.getState().getCurrentStepIndex()).toBe(2)
    })
  })

  describe('getTotalSteps', () => {
    it('returns 4 for morning review', () => {
      useDailyReviewStore.setState({ reviewType: 'morning' })
      expect(useDailyReviewStore.getState().getTotalSteps()).toBe(4)
    })

    it('returns 5 for evening review', () => {
      useDailyReviewStore.setState({ reviewType: 'evening' })
      expect(useDailyReviewStore.getState().getTotalSteps()).toBe(5)
    })
  })
})
