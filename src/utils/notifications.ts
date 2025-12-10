/**
 * Browser notification utilities
 */

export interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  tag?: string
  badge?: string
  actions?: Array<{
    action: string
    title: string
  }>
}

/**
 * Check if browser notifications are supported
 */
export function isBrowserNotificationSupported(): boolean {
  return 'Notification' in window
}

/**
 * Check if notifications are permitted
 */
export function areBrowserNotificationsPermitted(): boolean {
  return isBrowserNotificationSupported() && Notification.permission === 'granted'
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isBrowserNotificationSupported()) {
    return 'denied'
  }

  if (Notification.permission !== 'default') {
    return Notification.permission
  }

  return Notification.requestPermission()
}

/**
 * Send a browser notification
 */
export function sendBrowserNotification(options: NotificationOptions): Notification | null {
  if (!areBrowserNotificationsPermitted()) {
    return null
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192.png',
      tag: options.tag,
      badge: options.badge,
    })

    return notification
  } catch {
    console.error('Failed to send browser notification:', options)
    return null
  }
}

/**
 * Play notification sound
 */
export function playNotificationSound(): void {
  try {
    const audio = new Audio('/sounds/notification.mp3')
    audio.volume = 0.5
    audio.play().catch(() => {
      // Silently fail if audio can't play
    })
  } catch {
    // Silently fail
  }
}

/**
 * Check if it's within quiet hours
 */
export function isQuietHour(quietStart: string, quietEnd: string): boolean {
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  const [startHour, startMinute] = quietStart.split(':').map(Number)
  const [endHour, endMinute] = quietEnd.split(':').map(Number)

  const startTime = startHour * 60 + startMinute
  const endTime = endHour * 60 + endMinute

  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime < endTime
  }

  // Quiet hours span midnight
  return currentTime >= startTime || currentTime < endTime
}

/**
 * Service worker notification handler
 */
export function registerServiceWorkerNotifications(): void {
  if (!('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.ready.then(() => {
    // Handle notification click
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const { notificationId } = event.data
        // Handle notification action
        console.log('Notification clicked:', notificationId)
      }
    })
  })
}

/**
 * Schedule a notification for later
 */
export function scheduleNotification(
  options: NotificationOptions,
  delayMs: number
): ReturnType<typeof setTimeout> {
  return setTimeout(() => {
    sendBrowserNotification(options)
  }, delayMs)
}

/**
 * Cancel a scheduled notification
 */
export function cancelScheduledNotification(timeoutId: ReturnType<typeof setTimeout>): void {
  clearTimeout(timeoutId)
}
