import React, { useState } from 'react'
import { Mail, CheckCircle, AlertCircle, Copy, RefreshCw, Settings } from 'lucide-react'
import { useIntegrationStore } from '@/store/integrationStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface EmailIntegrationPanelProps {
  className?: string
}

export const EmailIntegration: React.FC<EmailIntegrationPanelProps> = ({ className }) => {
  const user = useAuthStore((state) => state.user)
  const { isLoading, error } = useIntegrationStore()
  const [copied, setCopied] = useState(false)

  const forwardingAddress = user?.id
    ? `tasks+${user.id}@todone.example.com`
    : 'tasks@todone.example.com'

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(forwardingAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Mock integration data (for demo purposes, would come from backend in production)
  // const mockIntegration: EmailIntegrationType = {
  //   id: 'email-integration-1',
  //   userId: user?.id || '',
  //   service: 'email',
  //   isConnected: true,
  //   accessToken: 'stub_token',
  //   settings: {},
  //   forwardingAddress,
  //   forwardingEnabled: true,
  //   parseEmailBody: true,
  //   extractDueDate: true,
  //   assignLabels: true,
  //   defaultProject: undefined,
  //   connectedAt: new Date(),
  // }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-icon-info" />
        <h2 className="text-lg font-semibold">Email Integration</h2>
      </div>

      {error && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Email Forwarding Setup */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-content-primary">Email Forwarding</h3>
            <p className="mt-1 text-sm text-content-secondary">
              Forward emails to create tasks automatically
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 dark:bg-green-900/30">
            <CheckCircle className="h-4 w-4 text-icon-success" />
            <span className="text-xs font-medium text-semantic-success">Active</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-border bg-surface-secondary p-3">
            <p className="text-xs font-medium text-content-secondary">Your Forwarding Address</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 rounded bg-surface-primary px-3 py-2 font-mono text-sm text-content-primary">
                {forwardingAddress}
              </code>
              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface-primary px-3 py-2 hover:bg-surface-tertiary"
              >
                <Copy className="h-4 w-4" />
                <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/30">
            <p className="text-sm font-medium text-semantic-info">How to use</p>
            <ol className="mt-2 space-y-1 text-xs text-semantic-info">
              <li>1. Copy your forwarding address above</li>
              <li>2. Forward any email to create a task</li>
              <li>3. Email subject becomes task title</li>
              <li>4. Email body becomes task description</li>
            </ol>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-4 w-4" />
              <span className="text-sm text-content-secondary">Parse email body as description</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-4 w-4" />
              <span className="text-sm text-content-secondary">Extract due dates from email content</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-4 w-4" />
              <span className="text-sm text-content-secondary">Automatically assign labels</span>
            </label>
          </div>
        </div>
      </div>

      {/* Email Reminders */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-content-primary">Email Reminders</h3>
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </div>

        <p className="mt-2 text-sm text-content-secondary">Receive email reminders before task due dates</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-content-secondary">Reminder Time</label>
            <select className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
              <option value="10080">1 week before</option>
            </select>
          </div>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <span className="text-sm text-content-secondary">Send daily digest summary</span>
          </label>
        </div>
      </div>

      {/* Email Digest */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-content-secondary" />
          <h3 className="font-medium text-content-primary">Daily Digest</h3>
        </div>

        <p className="mt-2 text-sm text-content-secondary">Get a daily email summary of your tasks</p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-content-secondary">Send at</label>
          <input
            type="time"
            defaultValue="09:00"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <span className="text-sm text-content-secondary">Tasks due today</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <span className="text-sm text-content-secondary">Overdue tasks</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4" />
            <span className="text-sm text-content-secondary">Upcoming (next 7 days)</span>
          </label>
        </div>
      </div>

      {/* Test Email */}
      <button
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-primary px-4 py-2 font-medium text-content-primary hover:bg-surface-tertiary disabled:opacity-50"
      >
        {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
        Send Test Email
      </button>
    </div>
  )
}
