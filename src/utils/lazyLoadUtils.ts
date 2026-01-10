import { ComponentType } from 'react'
import { logger } from '@/utils/logger'

/**
 * Create a lazy-loaded component with delay
 * Useful for deferring component load until a certain time has passed
 * @param importFunc Dynamic import function
 * @param delay Delay in milliseconds before loading starts
 * @returns A function that returns a promise
 */
export function lazyWithDelay<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  delay: number = 0
): () => Promise<{ default: ComponentType<T> }> {
  return () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(importFunc())
      }, delay)
    })
}

/**
 * Preload a lazy component before it's needed
 * Useful for improving perceived performance
 * @param importFunc Dynamic import function
 */
export async function preloadComponent(
  importFunc: () => Promise<{ default: ComponentType }>
): Promise<void> {
  try {
    await importFunc()
  } catch (error) {
    logger.warn('Failed to preload component:', error)
  }
}

/**
 * Example patterns for lazy loading components
 * Use these patterns in your code like:
 *
 * const AnalyticsDashboard = lazy(() => import('@/views/AnalyticsDashboard'))
 * const TaskDetailPanel = lazy(() => import('@/components/TaskDetailPanel'))
 *
 * Then wrap with Suspense:
 * <Suspense fallback={<LoadingFallback />}>
 *   <TaskDetailPanel {...props} />
 * </Suspense>
 */
export const lazyLoadPatterns = {
  views: {
    // Example: const AnalyticsDashboard = lazy(() => import('@/views/AnalyticsDashboard'))
  },
  components: {
    // Example: const TaskDetailPanel = lazy(() => import('@/components/TaskDetailPanel'))
  },
}
