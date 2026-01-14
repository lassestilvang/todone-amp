import React, { useEffect } from 'react'
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useWeeklyReviewStore } from '@/store/weeklyReviewStore'
import {
  WeekSummaryHeader,
  CompletedThisWeek,
  SlippedTasks,
  WeeklyTrends,
  TopProjects,
  KarmaWeekly,
  NextWeekPreview,
} from '@/components/WeeklyReview'

export const WeeklyReviewView: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const {
    metrics,
    completedTasks,
    slippedTasks,
    upcomingTasks,
    topProjects,
    weekStart,
    weekEnd,
    loading,
    loadWeeklyReview,
  } = useWeeklyReviewStore()

  const [weekOffset, setWeekOffset] = React.useState(0)

  useEffect(() => {
    if (user?.id) {
      loadWeeklyReview(user.id, weekOffset)
    }
  }, [user?.id, weekOffset, loadWeeklyReview])

  const handlePreviousWeek = () => setWeekOffset((prev) => prev - 1)
  const handleNextWeek = () => setWeekOffset((prev) => prev + 1)
  const handleCurrentWeek = () => setWeekOffset(0)

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Please sign in to view weekly review</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarRange className="w-6 h-6 text-brand-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Review</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track your weekly progress and productivity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousWeek}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Previous week"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={handleCurrentWeek}
                className="px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
              >
                Current Week
              </button>
            )}
            <button
              onClick={handleNextWeek}
              disabled={weekOffset >= 0}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next week"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        ) : !metrics ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CalendarRange className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No data available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Start completing tasks to see your weekly review statistics.
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            <WeekSummaryHeader weekStart={weekStart} weekEnd={weekEnd} metrics={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CompletedThisWeek tasks={completedTasks} />
              <SlippedTasks tasks={slippedTasks} />
            </div>

            <WeeklyTrends metrics={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TopProjects projects={topProjects} />
              <KarmaWeekly metrics={metrics} />
              <NextWeekPreview tasks={upcomingTasks} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
