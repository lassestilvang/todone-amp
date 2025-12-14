import { memo, FC } from 'react'

/**
 * List of components that benefit from memoization
 * These are commonly re-rendered parent components
 */

/**
 * Higher-order component for memoizing functional components
 * with custom comparison logic
 * @param Component The component to memoize
 * @param propsAreEqual Custom equality function for props
 * @returns A memoized version of the component
 */
export function memoizeComponent<P extends object>(
  Component: FC<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): FC<P> {
  return memo(Component, propsAreEqual)
}

/**
 * Deep equality check for comparing objects
 * Useful for custom prop comparison
 */
export function deepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true
  if (obj1 == null || obj2 == null) return false
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false

  const keys1 = Object.keys(obj1 as Record<string, unknown>)
  const keys2 = Object.keys(obj2 as Record<string, unknown>)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    const val1 = (obj1 as Record<string, unknown>)[key]
    const val2 = (obj2 as Record<string, unknown>)[key]

    if (!deepEqual(val1, val2)) return false
  }

  return true
}

/**
 * Custom comparison function for props
 * Ignores function references (callbacks change frequently)
 */
export function shallowEqualIgnoreFunctions<P extends object>(
  prevProps: Readonly<P>,
  nextProps: Readonly<P>
): boolean {
  const prevKeys = Object.keys(prevProps)
  const nextKeys = Object.keys(nextProps)

  if (prevKeys.length !== nextKeys.length) return false

  for (const key of prevKeys) {
    const prevVal = prevProps[key as keyof P]
    const nextVal = nextProps[key as keyof P]

    // Skip function comparison - they change frequently
    if (typeof prevVal === 'function' && typeof nextVal === 'function') {
      continue
    }

    if (prevVal !== nextVal) return false
  }

  return true
}

/**
 * Custom comparison for components that render lists
 * Only compares data arrays, ignores callback functions
 */
export function listItemPropsEqual<T extends object>(
  prevProps: Readonly<T>,
  nextProps: Readonly<T>
): boolean {
  const dataKeys = Object.keys(prevProps).filter((key) => key !== 'onClick' && key !== 'onChange')

  for (const key of dataKeys) {
    const prevVal = prevProps[key as keyof T]
    const nextVal = nextProps[key as keyof T]

    if (Array.isArray(prevVal) && Array.isArray(nextVal)) {
      if (prevVal.length !== nextVal.length) return false
      if (!prevVal.every((v, i) => v === nextVal[i])) return false
    } else if (prevVal !== nextVal) {
      return false
    }
  }

  return true
}
