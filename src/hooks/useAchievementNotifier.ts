/**
 * Achievement interface for notifications
 */
export interface Achievement {
  id: string
  name: string
  icon: string
  points: number
}

/**
 * Hook to trigger achievement notifications
 * Usage: const notify = useAchievementNotifier(); notify(achievement)
 */
export const useAchievementNotifier = () => {
  return (achievement: Achievement) => {
    if (typeof window !== 'undefined') {
      const windowType = window as unknown as Record<string, unknown>
      const notifier = windowType.__addAchievementNotification as
        | ((achievement: Achievement) => void)
        | undefined
      notifier?.(achievement)
    }
  }
}
