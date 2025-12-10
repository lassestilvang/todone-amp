import { useState, useEffect } from 'react'

/**
 * Hook for managing feature discovery state
 */
export function useFeatureDiscovery() {
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem('dismissed-feature-nudges')
    if (stored) {
      setDismissedNudges(new Set(JSON.parse(stored)))
    }
  }, [])

  const isDismissed = (nudgeId: string) => dismissedNudges.has(nudgeId)

  const dismiss = (nudgeId: string) => {
    const newDismissed = new Set(dismissedNudges)
    newDismissed.add(nudgeId)
    setDismissedNudges(newDismissed)
    localStorage.setItem('dismissed-feature-nudges', JSON.stringify(Array.from(newDismissed)))
  }

  const reset = () => {
    setDismissedNudges(new Set())
    localStorage.removeItem('dismissed-feature-nudges')
  }

  return {
    isDismissed,
    dismiss,
    reset,
  }
}
