import React, { useMemo } from 'react'
import { TrendingUp, Calendar } from 'lucide-react'
import { useGamificationStore } from '@/store/gamificationStore'
import clsx from 'clsx'

interface KarmaHistoryChartProps {
  days?: number
}

/**
 * KarmaHistoryChart displays karma progress over time
 * Simulates historical data based on current stats and karma thresholds
 */
export const KarmaHistoryChart: React.FC<KarmaHistoryChartProps> = ({ days = 30 }) => {
  const { userStats } = useGamificationStore()

  const historyData = useMemo(() => {
    if (!userStats) return []

    // Generate mock historical data based on current karma
    // In production, this would fetch actual history from database
    const data = []
    const dailyGain = Math.max(Math.floor(userStats.karma / days), 5)

    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const historicalKarma = Math.max(userStats.karma - dailyGain * i, 0)
      data.push({
        date,
        karma: historicalKarma,
        dailyGain: i === days ? 0 : dailyGain,
      })
    }

    return data
  }, [userStats, days])

  if (!userStats || historyData.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-surface-tertiary animate-pulse">
        <div className="h-64 bg-interactive-secondary rounded" />
      </div>
    )
  }

  const maxKarma = Math.max(...historyData.map((d) => d.karma), userStats.karma)
  const minKarma = Math.min(...historyData.map((d) => d.karma), 0)
  const karmaRange = maxKarma - minKarma || 1

  return (
    <div className="p-4 rounded-lg bg-semantic-info-light border border-semantic-info">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-semantic-info" />
          <h3 className="font-semibold text-content-primary">Karma Progress</h3>
        </div>
        <span className="text-xs font-medium text-content-secondary">
          Last {days} days
        </span>
      </div>

      {/* Chart Area */}
      <div className="mb-4">
        <div className="flex items-end justify-between h-48 gap-0.5 bg-surface-primary rounded p-4">
          {historyData.map((item, index) => {
            const percentage = ((item.karma - minKarma) / karmaRange) * 100
            const isRecent = index > historyData.length - 8 // Show last 8 days highlighted
            const isToday = index === historyData.length - 1

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1 group"
                title={`${item.date.toLocaleDateString()}: ${Math.round(item.karma)} karma`}
              >
                <div
                  className={clsx(
                    'w-full rounded-t transition-all hover:opacity-80 cursor-pointer',
                    isToday
                      ? 'bg-gradient-to-t from-amber-500 to-amber-400 shadow-lg'
                      : isRecent
                        ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                        : 'bg-interactive-secondary'
                  )}
                  style={{ height: `${Math.max(percentage, 4)}%` }}
                />
                {/* Date label (show every 5th day) */}
                {index % 5 === 0 && (
                  <span className="text-xs text-content-tertiary mt-2">
                    {item.date.getDate()}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 bg-surface-primary rounded">
          <div className="text-content-secondary">Current</div>
          <div className="font-bold text-content-primary">
            {Math.round(userStats.karma)}
          </div>
        </div>
        <div className="p-2 bg-surface-primary rounded">
          <div className="text-content-secondary">Daily Avg</div>
          <div className="font-bold text-content-primary">
            {Math.round(userStats.karma / Math.max(days, 1))}
          </div>
        </div>
        <div className="p-2 bg-surface-primary rounded">
          <div className="text-content-secondary">Total Gain</div>
          <div className="font-bold text-semantic-success">
            +{Math.round(userStats.karma)}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 flex items-start gap-2 text-xs text-content-secondary">
        <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Your karma growth shows your progress over time. Complete more tasks to maintain
          momentum!
        </p>
      </div>
    </div>
  )
}
