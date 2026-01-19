// Skeleton loaders for loading states

interface TaskListSkeletonProps {
  count?: number
  className?: string
  showAvatar?: boolean
}

/**
 * Skeleton loader for task list items
 * Shows animated placeholder content while loading
 */
export function TaskListSkeleton({
  count = 3,
  className,
  showAvatar = true,
}: TaskListSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonTaskItem key={index} showAvatar={showAvatar} />
      ))}
    </div>
  )
}

/**
 * Single skeleton task item
 */
function SkeletonTaskItem({ showAvatar }: { showAvatar?: boolean }) {
  return (
    <div className="animate-pulse border-b border-border p-4">
      <div className="flex items-start gap-3">
        {/* Checkbox skeleton */}
        {showAvatar && (
          <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-sm bg-skeleton-base" />
        )}

        {/* Content skeleton */}
        <div className="flex-1 space-y-2">
          {/* Title */}
          <div className="h-4 w-3/4 rounded bg-skeleton-base" />

          {/* Subtitle/Details row */}
          <div className="flex gap-2">
            <div className="h-3 w-24 rounded bg-skeleton-highlight" />
            <div className="h-3 w-20 rounded bg-skeleton-highlight" />
          </div>
        </div>

        {/* Priority/Menu skeleton */}
        <div className="h-5 w-8 flex-shrink-0 rounded bg-skeleton-base" />
      </div>
    </div>
  )
}

/**
 * Skeleton loader for task detail panel
 */
export function TaskDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse p-4">
      {/* Title */}
      <div className="h-6 w-3/4 rounded bg-skeleton-base" />

      {/* Description placeholder */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-skeleton-highlight" />
        <div className="h-4 w-5/6 rounded bg-skeleton-highlight" />
      </div>

      <div className="my-4 border-t border-border" />

      {/* Properties section */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="h-4 w-20 rounded bg-skeleton-highlight" />
            <div className="h-8 flex-1 rounded bg-skeleton-base" />
          </div>
        ))}
      </div>

      <div className="my-4 border-t border-border" />

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-lg bg-skeleton-base" />
        <div className="h-10 flex-1 rounded-lg bg-skeleton-highlight" />
      </div>
    </div>
  )
}

/**
 * Skeleton loader for board view columns
 */
export function BoardViewSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {Array.from({ length: 3 }).map((_, colIndex) => (
        <div
          key={colIndex}
          className="min-w-72 space-y-3 rounded-lg bg-surface-secondary p-4"
        >
          {/* Column header skeleton */}
          <div className="h-6 w-1/2 rounded bg-skeleton-base" />

          {/* Card skeletons */}
          {Array.from({ length: 3 }).map((_, cardIndex) => (
            <div key={cardIndex} className="animate-pulse space-y-2 rounded-lg bg-surface-primary p-3 shadow-sm">
              <div className="h-4 w-3/4 rounded bg-skeleton-base" />
              <div className="h-3 w-1/2 rounded bg-skeleton-highlight" />
              <div className="flex gap-1">
                <div className="h-2 w-8 rounded bg-skeleton-highlight" />
                <div className="h-2 w-8 rounded bg-skeleton-highlight" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton loader for calendar view
 */
export function CalendarSkeleton() {
  return (
    <div className="space-y-4 animate-pulse p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 rounded bg-skeleton-base" />
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded bg-skeleton-base" />
          <div className="h-8 w-20 rounded bg-skeleton-base" />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {Array.from({ length: 7 }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="aspect-square flex-1 rounded-lg bg-skeleton-highlight"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton loader for dashboard/analytics
 */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg bg-skeleton-highlight p-4">
            <div className="h-4 w-20 rounded bg-skeleton-base" />
            <div className="mt-2 h-6 w-12 rounded bg-skeleton-base" />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="rounded-lg bg-skeleton-base p-6">
        <div className="h-64 w-full rounded bg-skeleton-highlight" />
      </div>
    </div>
  )
}

/**
 * Skeleton loader for comment thread
 */
export function CommentThreadSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          {/* Avatar */}
          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-skeleton-base" />

          {/* Comment content */}
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded bg-skeleton-base" />
            <div className="space-y-1">
              <div className="h-3 w-full rounded bg-skeleton-highlight" />
              <div className="h-3 w-5/6 rounded bg-skeleton-highlight" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton loader for search results
 */
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="rounded-lg border border-border p-3">
          <div className="h-4 w-3/4 rounded bg-skeleton-base" />
          <div className="mt-2 h-3 w-1/2 rounded bg-skeleton-highlight" />
        </div>
      ))}
    </div>
  )
}
