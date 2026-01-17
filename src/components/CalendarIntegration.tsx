import React, { useState } from 'react'
import { Calendar, Link as LinkIcon, Unlink2, Settings, RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { useIntegrationStore } from '@/store/integrationStore'
import type { CalendarIntegration as CalendarIntegrationType } from '@/types'
import { logger } from '@/utils/logger'

interface CalendarIntegrationProps {
  platform: 'google' | 'outlook'
  onSyncComplete?: () => void
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  platform,
  onSyncComplete,
}) => {
  const { calendarIntegrations, updateCalendarIntegration, removeCalendarIntegration } =
    useIntegrationStore()
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const integration = calendarIntegrations.find(
    (ci) =>
      (ci.service === 'google' && platform === 'google') ||
      (ci.service === 'outlook' && platform === 'outlook')
  )

  const handleConnect = async () => {
    // In production, this would initiate OAuth flow
    const mockToken = `mock_${platform}_token_${Date.now()}`
    const newIntegration: CalendarIntegrationType = {
      id: `cal_${platform}_${Date.now()}`,
      userId: 'current_user',
      service: platform === 'google' ? 'google' : 'outlook',
      accessToken: mockToken,
      refreshToken: `refresh_${mockToken}`,
      expiresAt: new Date(Date.now() + 3600000),
      syncStatus: 'idle',
      lastSyncAt: new Date(),
      connectedAt: new Date(),
      calendarId: `${platform}-default`,
      calendarName: `${platform} Calendar`,
      displayColor: '#0ea5e9',
      selectedCalendars: [],
      syncEnabled: true,
      syncDirection: 'one-way',
      syncFrequency: 'hourly',
      showExternalEvents: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
    void updateCalendarIntegration(newIntegration.id, newIntegration)
  }

  const handleDisconnect = () => {
    if (integration) {
      void removeCalendarIntegration(integration.id)
    }
  }

  const handleSync = async () => {
    if (!integration) return
    setIsSyncing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSyncComplete?.()
    } finally {
      setIsSyncing(false)
    }
  }

  if (!integration) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-primary p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-500" />
          <h3 className="font-medium text-content-primary">
            {platform === 'google' ? 'Google Calendar' : 'Outlook Calendar'}
          </h3>
        </div>
        <p className="text-sm text-content-secondary">
          {platform === 'google'
            ? 'Connect your Google Calendar to sync events with Todone.'
            : 'Connect your Outlook Calendar to sync events with Todone.'}
        </p>
        <Button variant="primary" size="sm" onClick={handleConnect}>
          <LinkIcon className="h-4 w-4" />
          Connect {platform === 'google' ? 'Google' : 'Outlook'} Calendar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-brand-200 bg-brand-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-500" />
          <h3 className="font-medium text-content-primary">
            {platform === 'google' ? 'Google Calendar' : 'Outlook Calendar'}
          </h3>
          <span className="ml-2 inline-flex items-center rounded-full bg-semantic-success-light px-2 py-1 text-xs font-medium text-semantic-success">
            Connected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            title="Calendar settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            title="Disconnect calendar"
          >
            <Unlink2 className="h-4 w-4" />
          </Button>
        </div>
      </div>



      {/* Settings Panel */}
      {showSettings && (
        <div className="flex flex-col gap-3 border-t border-brand-200 pt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={integration.syncEnabled}
              onChange={() => {
                // Toggle sync enabled logic
                logger.info('Toggle sync enabled')
              }}
              className="h-4 w-4 rounded border-border text-brand-500"
            />
            <span className="text-sm text-content-secondary">Enable sync</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={integration.showExternalEvents}
              onChange={() => {
                // Toggle show external events logic
                logger.info('Toggle show external events')
              }}
              className="h-4 w-4 rounded border-border text-brand-500"
            />
            <span className="text-sm text-content-secondary">Show external events</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked
              onChange={() => {
                // Toggle show all-day events logic
                logger.info('Toggle show all-day events')
              }}
              className="h-4 w-4 rounded border-border text-brand-500"
            />
            <span className="text-sm text-content-secondary">Show all-day events</span>
          </label>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-content-secondary">Sync Interval</label>
            <select className="rounded border border-border px-2 py-1 text-sm text-content-secondary">
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="manual">Manual only</option>
            </select>
          </div>
        </div>
      )}

      {/* Sync status */}
      <div className="flex items-center justify-between border-t border-brand-200 pt-3">
        <span className="text-xs text-content-secondary">
          Last synced: {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString() : 'Never'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          title="Sync now"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  )
}
