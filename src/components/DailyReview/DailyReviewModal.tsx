import { useEffect, useCallback, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Sun, Moon, Settings } from 'lucide-react'
import { useDailyReviewStore } from '@/store/dailyReviewStore'
import { useTaskStore } from '@/store/taskStore'
import { OverdueTasksReview } from './OverdueTasksReview'
import { TodayTasksPreview } from './TodayTasksPreview'
import { DailyIntention } from './DailyIntention'
import { CompletedTasksCelebration } from './CompletedTasksCelebration'
import { IncompleteTasksReview } from './IncompleteTasksReview'
import { TomorrowPreview } from './TomorrowPreview'
import { ReflectionInput } from './ReflectionInput'
import { ReviewSummary } from './ReviewSummary'
import { DailyReviewSettings } from './DailyReviewSettings'
import { cn } from '@/utils/cn'

interface DailyReviewModalProps {
  userId: string
}

export function DailyReviewModal({ userId }: DailyReviewModalProps) {
  const [showSettings, setShowSettings] = useState(false)
  const {
    isOpen,
    reviewType,
    currentStep,
    nextStep,
    prevStep,
    completeReview,
    closeReview,
    getCurrentStepIndex,
    getTotalSteps,
  } = useDailyReviewStore()

  const tasks = useTaskStore((state) => state.tasks)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        closeReview()
      } else if (e.key === 'ArrowRight') {
        nextStep()
      } else if (e.key === 'ArrowLeft') {
        prevStep()
      }
    },
    [isOpen, nextStep, prevStep, closeReview]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentIndex = getCurrentStepIndex()
  const totalSteps = getTotalSteps()
  const isMorning = reviewType === 'morning'
  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === totalSteps - 1

  const getCompletedTodayCount = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return tasks.filter((task) => {
      if (!task.completed || !task.completedAt) return false
      const completedDate = new Date(task.completedAt)
      completedDate.setHours(0, 0, 0, 0)
      return completedDate.getTime() === today.getTime()
    }).length
  }

  const handleComplete = async () => {
    await completeReview(userId, getCompletedTodayCount())
  }

  const renderStep = () => {
    if (isMorning) {
      switch (currentStep) {
        case 'review-overdue':
          return <OverdueTasksReview onNext={nextStep} />
        case 'today-preview':
          return <TodayTasksPreview onNext={nextStep} />
        case 'set-intention':
          return <DailyIntention onNext={nextStep} />
        case 'review-complete':
          return <ReviewSummary onComplete={handleComplete} type="morning" />
        default:
          return null
      }
    } else {
      switch (currentStep) {
        case 'celebrate-completed':
          return <CompletedTasksCelebration onNext={nextStep} />
        case 'reschedule-incomplete':
          return <IncompleteTasksReview onNext={nextStep} />
        case 'tomorrow-preview':
          return <TomorrowPreview onNext={nextStep} />
        case 'add-reflection':
          return <ReflectionInput onNext={nextStep} />
        case 'evening-complete':
          return <ReviewSummary onComplete={handleComplete} type="evening" />
        default:
          return null
      }
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div
          className={cn(
            'bg-surface-primary rounded-xl shadow-2xl',
            'w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden'
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="daily-review-title"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  isMorning
                    ? 'bg-yellow-100 dark:bg-yellow-900/30'
                    : 'bg-indigo-100 dark:bg-indigo-900/30'
                )}
              >
                {isMorning ? (
                  <Sun className="w-5 h-5 text-icon-yellow" />
                ) : (
                  <Moon className="w-5 h-5 text-icon-indigo" />
                )}
              </div>
              <div>
                <h2
                  id="daily-review-title"
                  className="font-semibold text-content-primary"
                >
                  {isMorning ? 'Morning Review' : 'Evening Review'}
                </h2>
                <p className="text-xs text-content-tertiary">
                  Step {currentIndex + 1} of {totalSteps}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-content-tertiary" />
              </button>
              <button
                onClick={closeReview}
                className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-content-tertiary" />
              </button>
            </div>
          </div>

          <div className="px-4 pt-3">
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    index <= currentIndex
                      ? isMorning
                        ? 'bg-yellow-500'
                        : 'bg-indigo-500'
                      : 'bg-interactive-secondary'
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">{renderStep()}</div>

          {!isLastStep && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <button
                onClick={prevStep}
                disabled={isFirstStep}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isFirstStep
                    ? 'text-content-tertiary cursor-not-allowed'
                    : 'text-content-secondary hover:bg-surface-tertiary'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <div className="text-xs text-content-tertiary">
                Use ← → arrows to navigate
              </div>
              <button
                onClick={nextStep}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'text-content-secondary hover:bg-surface-tertiary'
                )}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <DailyReviewSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userId={userId}
      />
    </>
  )
}
