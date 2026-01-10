import { useEffect, useState } from 'react'
import { logger } from '@/utils/logger'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAState {
  isOnline: boolean
  isInstallable: boolean
  isInstalled: boolean
}

/**
 * Custom hook for PWA functionality
 * Handles service worker registration, online/offline detection, and install prompts
 */
export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInstallable: false,
    isInstalled: false,
  })
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      })
        .then((registration) => {
          logger.info('[PWA] Service worker registered:', registration)
        })
        .catch((error) => {
          logger.warn('[PWA] Service worker registration failed:', error)
        })
    }
  }, [])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setState((prev) => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState((prev) => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as InstallPromptEvent)
      setState((prev) => ({ ...prev, isInstallable: true }))
    }

    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setState((prev) => ({ ...prev, isInstalled: true, isInstallable: false }))
      logger.info('[PWA] App installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if app is already installed
    if ('getInstalledRelatedApps' in navigator) {
      const navWithApps = navigator as Navigator & { getInstalledRelatedApps: () => Promise<unknown[]> }
      if (typeof navWithApps.getInstalledRelatedApps === 'function') {
        navWithApps.getInstalledRelatedApps().then((apps: unknown[]) => {
          if (apps && apps.length > 0) {
            setState((prev) => ({ ...prev, isInstalled: true }))
          }
        })
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = async () => {
    if (!installPrompt) {
      logger.warn('[PWA] Install prompt not available')
      return
    }

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      logger.info('[PWA] User choice:', outcome)

      if (outcome === 'accepted') {
        setInstallPrompt(null)
        setState((prev) => ({ ...prev, isInstallable: false }))
      }
    } catch (error) {
      logger.error('[PWA] Installation failed:', error)
    }
  }

  return {
    ...state,
    installPrompt,
    install,
  }
}
