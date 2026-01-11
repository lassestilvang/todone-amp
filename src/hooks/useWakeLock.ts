import { useState, useEffect, useCallback, useRef } from 'react'

interface WakeLockSentinel {
  released: boolean
  release: () => Promise<void>
  addEventListener: (type: string, listener: EventListener) => void
  removeEventListener: (type: string, listener: EventListener) => void
}

interface WakeLockAPI {
  request: (type: 'screen') => Promise<WakeLockSentinel>
}

interface NavigatorWithWakeLock {
  wakeLock?: WakeLockAPI
}

export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    const nav = navigator as NavigatorWithWakeLock
    setIsSupported('wakeLock' in navigator && !!nav.wakeLock)
  }, [])

  const request = useCallback(async () => {
    if (!isSupported) return false

    try {
      const nav = navigator as NavigatorWithWakeLock
      if (!nav.wakeLock) return false

      wakeLockRef.current = await nav.wakeLock.request('screen')
      setIsActive(true)

      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false)
      })

      return true
    } catch {
      setIsActive(false)
      return false
    }
  }, [isSupported])

  const release = useCallback(async () => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
      setIsActive(false)
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && wakeLockRef.current?.released) {
        await request()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, request])

  useEffect(() => {
    return () => {
      if (wakeLockRef.current && !wakeLockRef.current.released) {
        wakeLockRef.current.release()
      }
    }
  }, [])

  return {
    isSupported,
    isActive,
    request,
    release,
  }
}
