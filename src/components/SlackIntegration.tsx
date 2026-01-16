import React, { useState } from 'react'
import {
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Settings,
} from 'lucide-react'
import { useIntegrationStore } from '@/store/integrationStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
import type { SlackIntegration as SlackIntegrationType } from '@/types'
import { logger } from '@/utils/logger'

interface SlackIntegrationPanelProps {
  className?: string
}

export const SlackIntegration: React.FC<SlackIntegrationPanelProps> = ({ className }) => {
  const user = useAuthStore((state) => state.user)
  const { isLoading, error } = useIntegrationStore()
  const [isConnected, setIsConnected] = useState(false)

  const mockIntegration: SlackIntegrationType = {
    id: 'slack-integration-1',
    userId: user?.id || '',
    service: 'slack',
    isConnected,
    teamId: 'T12345678',
    teamName: 'My Slack Workspace',
    slackUserId: 'U12345678',
    slackWorkspaceUrl: 'https://myworkspace.slack.com',
    notifyOnAssignment: true,
    notifyOnMention: true,
    notifyOnComments: true,
    notifyOnOverdue: true,
    dailyDigestEnabled: true,
    dailyDigestTime: '09:00',
    digestChannel: '#daily-tasks',
    settings: {},
    connectedAt: new Date(),
  }

  const handleConnect = async () => {
    // Simulate OAuth flow
    logger.info('Connecting to Slack...')
    setIsConnected(true)
  }

  const handleDisconnect = async () => {
    setIsConnected(false)
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Slack Integration</h2>
      </div>

      {error && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!isConnected ? (
        // Connect Section
        <div className="rounded-lg border border-border p-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-content-primary">Connect Slack</h3>
            <p className="mt-2 text-sm text-content-secondary">
              Get Slack notifications and manage tasks directly from Slack
            </p>
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Connect to Slack
            </button>
          </div>
        </div>
      ) : (
        // Connected Section
        <>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-content-primary">Connected</h3>
                </div>
                <p className="mt-1 text-sm text-content-secondary">
                  Connected to {mockIntegration.teamName}
                </p>
              </div>
              <button
                onClick={handleDisconnect}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Slack Commands */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-content-secondary" />
              <h3 className="font-medium text-content-primary">Slack Commands</h3>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-content-secondary">Available commands:</p>
              <div className="space-y-1 text-sm">
                <code className="block rounded bg-surface-tertiary px-3 py-2">/todone create Task title</code>
                <code className="block rounded bg-surface-tertiary px-3 py-2">/todone my-tasks</code>
                <code className="block rounded bg-surface-tertiary px-3 py-2">/todone today</code>
                <code className="block rounded bg-surface-tertiary px-3 py-2">/todone help</code>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-medium text-content-primary">Notifications</h3>

            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm text-content-secondary">Notify on task assignment</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm text-content-secondary">Notify on @mentions in comments</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm text-content-secondary">Notify on task comments</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm text-content-secondary">Notify on overdue tasks</span>
              </label>
            </div>
          </div>

          {/* Daily Digest */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-content-primary">Daily Digest</h3>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>

            <p className="mt-2 text-sm text-content-secondary">
              Get a daily summary of your tasks in Slack
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-content-secondary">Send at</label>
                <input
                  type="time"
                  defaultValue="09:00"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-content-secondary">Channel</label>
                <select className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
                  <option value="#daily-tasks">📋 #daily-tasks</option>
                  <option value="@me">🔔 Direct Message</option>
                  <option value="#general">💬 #general</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span className="text-sm text-content-secondary">Include overdue tasks</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span className="text-sm text-content-secondary">Include upcoming tasks</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span className="text-sm text-content-secondary">Include team activity</span>
                </label>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
