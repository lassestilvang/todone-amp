import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP, type Metric } from 'web-vitals'

export interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

type ReportCallback = (metric: WebVitalMetric) => void

const isDev = import.meta.env.DEV

function createReporter(onReport?: ReportCallback): (metric: Metric) => void {
  return (metric: Metric) => {
    const webVitalMetric: WebVitalMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    }

    if (isDev) {
      const color =
        metric.rating === 'good' ? 'green' : metric.rating === 'needs-improvement' ? 'orange' : 'red'
      // eslint-disable-next-line no-console
      console.log(
        `%c[Web Vital] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
        `color: ${color}; font-weight: bold;`
      )
    }

    onReport?.(webVitalMetric)
  }
}

export function initWebVitals(onReport?: ReportCallback): void {
  const reporter = createReporter(onReport)

  onCLS(reporter)
  onFID(reporter)
  onLCP(reporter)
  onFCP(reporter)
  onTTFB(reporter)
  onINP(reporter)
}

export function getWebVitalsThresholds() {
  return {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  }
}
