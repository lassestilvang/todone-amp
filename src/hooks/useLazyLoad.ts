import { useEffect, useRef, useState, RefObject } from 'react'

export interface UseLazyLoadOptions {
  threshold?: number
  rootMargin?: string
  onVisible?: () => void | Promise<void>
}

/**
 * Hook for lazy loading elements using Intersection Observer
 * Useful for deferring expensive operations until elements become visible
 */
export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    onVisible = () => {},
  } = options

  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      async (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true)
            setHasLoaded(true)
            onVisible()
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [hasLoaded, onVisible, threshold, rootMargin])

  return { ref, isVisible, hasLoaded }
}

/**
 * Hook for lazy loading images with fallback
 */
export const useLazyImage = (
  src: string | undefined
): { ref: RefObject<HTMLImageElement>; isLoaded: boolean; error: boolean } => {
  const ref = useRef<HTMLImageElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const img = ref.current
    if (!img || !src) return

    const handleLoad = () => setIsLoaded(true)
    const handleError = () => setError(true)

    // Create a new image to preload
    const imageEl = new Image()
    imageEl.onload = handleLoad
    imageEl.onerror = handleError
    imageEl.src = src

    // Also add listeners to the actual img element
    img.addEventListener('load', handleLoad)
    img.addEventListener('error', handleError)

    return () => {
      img.removeEventListener('load', handleLoad)
      img.removeEventListener('error', handleError)
    }
  }, [src])

  return { ref, isLoaded, error }
}
