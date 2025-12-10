/**
 * Performance optimization utilities
 * Includes lazy loading, image optimization, and bundle analysis
 */

/**
 * Debounce function to reduce function call frequency
 * Useful for scroll, resize, and input events
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit function call frequency
 * Useful for scroll and resize events that fire many times per second
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  let lastRan: number

  return function executedFunction(...args: Parameters<T>) {
    if (!lastRan) lastRan = Date.now()

    const remaining = limit - (Date.now() - lastRan)
    if (remaining <= 0) {
      if (inThrottle) clearTimeout(inThrottle as unknown as NodeJS.Timeout)
      func(...args)
      lastRan = Date.now()
    } else if (!inThrottle) {
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
        lastRan = Date.now()
        func(...args)
      }, remaining)
    }
  }
}

/**
 * Lazy load images when they become visible
 * Uses Intersection Observer for optimal performance
 */
export const setupLazyImageLoading = () => {
  const images = document.querySelectorAll('img[data-src]')

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        img.src = img.dataset.src || ''
        img.removeAttribute('data-src')
        imageObserver.unobserve(img)
      }
    })
  })

  images.forEach((img) => imageObserver.observe(img))

  return imageObserver
}

/**
 * Preload resource for faster loading
 */
export const preloadResource = (href: string, as: string) => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = href
  document.head.appendChild(link)
}

/**
 * Prefetch resource for potential future navigation
 */
export const prefetchResource = (href: string) => {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

/**
 * Measure performance of a function
 */
export const measurePerformance = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start

  console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)

  return { result, duration }
}

/**
 * Get current performance metrics
 */
export const getPerformanceMetrics = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const paintEntries = performance.getEntriesByType('paint')

  if (!navigation) return null

  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    firstPaint: paintEntries.find((e) => e.name === 'first-paint')?.startTime,
    firstContentfulPaint: paintEntries.find((e) => e.name === 'first-contentful-paint')?.startTime,
    totalPageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
  }
}

/**
 * Monitor long tasks (> 50ms)
 */
export const monitorLongTasks = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn(`[Long Task] ${entry.name}: ${entry.duration.toFixed(2)}ms`)
        }
      })
      observer.observe({ entryTypes: ['longtask'] })
      return observer
    } catch {
      console.log('Long task monitoring not supported')
      return null
    }
  }
  return null
}

/**
 * Bundle size analysis helper
 */
export const analyzeBundleSize = () => {
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  const sizes: { src: string; size: string }[] = []

  scripts.forEach((script) => {
    const src = script.getAttribute('src') || ''
    // Note: Actual size would need to be fetched from server headers
    // This is a placeholder for demonstration
    sizes.push({ src, size: 'N/A' })
  })

  return sizes
}

/**
 * Check if page is in slow network mode
 */
export const isSlowNetwork = (): boolean => {
  if ('connection' in navigator) {
    const connection = (navigator as unknown as { connection: { effectiveType: string } })
      .connection
    return ['slow-2g', '2g', '3g'].includes(connection.effectiveType)
  }
  return false
}

/**
 * Implement adaptive loading based on network speed
 */
export const getAdaptiveLoadingSettings = () => {
  const slow = isSlowNetwork()

  return {
    reducedImages: slow,
    skipAnimations: slow,
    preloadAssets: !slow,
    lazyLoadComponents: slow,
    qualityLevel: slow ? 'low' : 'high',
  }
}
