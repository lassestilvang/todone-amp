import React from 'react'
import { Sparkles, Flame, Trophy } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { WeeklyMetrics } from '@/store/weeklyReviewStore'

interface KarmaWeeklyProps {
  metrics: WeeklyMetrics
}

export const KarmaWeekly: React.FC<KarmaWeeklyProps> = ({ metrics }) => {
  const { karmaEarned, streakStatus } = metrics

  return (
    <div className="bg-gradient-to-br from-purple-500 to-brand-600 rounded-xl p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Karma Earned</h3>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-4xl font-bold">+{karmaEarned}</p>
          <p className="text-purple-100 text-sm mt-1">points this week</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
            <Flame className={cn('w-5 h-5', streakStatus.current > 0 ? 'text-orange-300' : 'text-white/60')} />
            <div>
              <p className="text-sm font-medium">{streakStatus.current} day streak</p>
              <p className="text-xs text-purple-100">current</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <div>
              <p className="text-sm font-medium">{streakStatus.best} days</p>
              <p className="text-xs text-purple-100">best streak</p>
            </div>
          </div>
        </div>
      </div>

      {karmaEarned >= 100 && (
        <div className="mt-4 p-3 bg-white/20 rounded-lg">
          <p className="text-sm">
            🎉 Amazing week! You earned {karmaEarned} karma points. Keep up the momentum!
          </p>
        </div>
      )}
    </div>
  )
}
