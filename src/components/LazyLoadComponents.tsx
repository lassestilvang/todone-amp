import { lazy, Suspense, ComponentType, ReactNode, FC } from 'react'

/**
 * Props for lazy-loaded components
 */
export interface LazyComponentProps {
  fallback?: ReactNode
  delay?: number
}

/**
 * Create a lazy-loaded component with a suspense boundary
 * @param importFunc Dynamic import function
 * @param fallback Component to show while loading (default: loading spinner)
 * @returns A component wrapped with Suspense
 */
// eslint-disable-next-line react-refresh/only-export-components
export function lazyWithSuspense<P extends object = object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
): React.FC<P> {
  const LazyComponent = lazy(importFunc)

  const WrappedComponent: React.FC<P> = (props) => (
    <Suspense fallback={fallback || <LoadingFallback />}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <LazyComponent {...(props as any)} />
    </Suspense>
  )
  
  return WrappedComponent
}

/**
 * Default loading fallback component
 */
export const LoadingFallback: FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="space-y-2 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-interactive-secondary border-t-brand-500 mx-auto" />
      <p className="text-sm text-content-secondary">Loading...</p>
    </div>
  </div>
)
