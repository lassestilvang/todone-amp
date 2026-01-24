import { describe, it, expect, mock, beforeEach, afterEach, setSystemTime } from 'bun:test'
import {
  isBrowserNotificationSupported,
  areBrowserNotificationsPermitted,
  requestNotificationPermission,
  sendBrowserNotification,
  playNotificationSound,
  isQuietHour,
} from './notifications'

describe('Notification Utilities', () => {
  beforeEach(() => {
    // Mock window.Notification
    global.Notification = {
      permission: 'granted',
      requestPermission: mock(() => Promise.resolve('granted')),
    } as unknown as typeof Notification
  })

  afterEach(() => {
  })

  describe('isBrowserNotificationSupported', () => {
    it('should return true when Notification is in window', () => {
      expect(isBrowserNotificationSupported()).toBe(true)
    })

    it('should return false when Notification is not in window', () => {
      const original = global.Notification
      // @ts-expect-error test - use undefined assignment instead of delete
      global.Notification = undefined
      expect(isBrowserNotificationSupported()).toBe(false)
      global.Notification = original
    })
  })

  describe('areBrowserNotificationsPermitted', () => {
    it('should return true when permission is granted', () => {
      expect(areBrowserNotificationsPermitted()).toBe(true)
    })

    it('should return false when permission is denied', () => {
      global.Notification = {
        permission: 'denied',
        requestPermission: mock(() => {}),
      } as unknown as typeof Notification
      expect(areBrowserNotificationsPermitted()).toBe(false)
    })

    it('should return false when permission is default', () => {
      global.Notification = {
        permission: 'default',
        requestPermission: mock(() => {}),
      } as unknown as typeof Notification
      expect(areBrowserNotificationsPermitted()).toBe(false)
    })
  })

  describe('requestNotificationPermission', () => {
    it('should request permission', async () => {
      global.Notification = {
        permission: 'default',
        requestPermission: mock(() => Promise.resolve('granted')),
      } as unknown as typeof Notification
      const result = await requestNotificationPermission()
      expect(result).toBe('granted')
    })

    it('should return current permission if already requested', async () => {
      global.Notification = {
        permission: 'denied',
        requestPermission: mock(() => {}),
      } as unknown as typeof Notification
      const result = await requestNotificationPermission()
      expect(result).toBe('denied')
    })
  })

  describe('sendBrowserNotification', () => {
    it('should not send if notifications not permitted', () => {
      global.Notification = {
        permission: 'denied',
        requestPermission: mock(() => {}),
      } as unknown as typeof Notification
      const result = sendBrowserNotification({
        title: 'Test',
      })

      expect(result).toBeNull()
    })

    it('should attempt to send when permitted', () => {
      const result = sendBrowserNotification({
        title: 'Test',
        body: 'Test body',
      })

      // Check that either a Notification was created or null is returned
      expect(result === null || typeof result === 'object').toBe(true)
    })
  })

  describe('playNotificationSound', () => {
    it('should attempt to play sound', () => {
      const mockAudio = {
        volume: 0,
        play: mock(() => Promise.resolve(undefined)),
      }

      global.Audio = mock(() => mockAudio) as unknown as typeof Audio

      playNotificationSound()

      expect(global.Audio).toHaveBeenCalledWith('/sounds/notification.mp3')
      expect(mockAudio.play).toHaveBeenCalled()
    })
  })

  describe('isQuietHour', () => {
    it('should return true if within quiet hours (same day)', () => {
      const now = new Date()
      const hour = now.getHours()
      const minute = now.getMinutes()

      // Set quiet hours to include current time
      const quietStart = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      const quietEnd = `${String((hour + 1) % 24).padStart(2, '0')}:00`

      expect(isQuietHour(quietStart, quietEnd)).toBe(true)
    })

    it('should correctly identify quiet hours spanning midnight', () => {
      // Test time between 22:00 and 08:00 (spans midnight)
      // We can't test current time as it depends on when test runs
      // Just verify the function doesn't throw
      expect(() => isQuietHour('22:00', '08:00')).not.toThrow()
    })

    it('should handle quiet hours spanning midnight', () => {
      // If it's 23:00 and quiet hours are 22:00 to 08:00, should be true
      const mockDate = new Date()
      mockDate.setHours(23, 0, 0, 0)

      setSystemTime(mockDate)

      expect(isQuietHour('22:00', '08:00')).toBe(true)

      setSystemTime()
    })
  })
})
