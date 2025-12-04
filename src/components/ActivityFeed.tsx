import { useEffect, useState } from 'react'
import { Loader, History } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useActivityStore } from '@/store/activityStore'
import { ActivityItem } from './ActivityItem'

export interface ActivityFeedProps {
  taskId: string
  className?: string
}

export function ActivityFeed({ taskId, className }: ActivityFeedProps) {
  const { isLoading, loadTaskActivities, getTaskActivities } = useActivityStore()
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!hasLoaded) {
      loadTaskActivities(taskId).then(() => setHasLoaded(true))
    }
  }, [taskId, hasLoaded, loadTaskActivities])

  const taskActivities = getTaskActivities(taskId)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <History size={18} className="text-gray-700" />
        <h3 className="font-semibold text-gray-900">
          Activity
          {taskActivities.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({taskActivities.length})
            </span>
          )}
        </h3>
      </div>

      {/* Activity List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader size={20} className="text-gray-400 animate-spin" />
        </div>
      ) : taskActivities.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <History size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-1 border border-gray-200 rounded-lg divide-y divide-gray-200 bg-white">
          {taskActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  )
}
