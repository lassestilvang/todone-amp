import { useEffect, useState } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { cn } from '@/utils/cn'
import { X, Trash2, CheckCircle, Archive, Bell, MessageCircle, Share2, Clock, AlertCircle } from 'lucide-react'
import { isToday, isYesterday } from 'date-fns'
import type { Notification } from '@/types'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

const notificationIcons: Record<string, React.ReactNode> = {
  task_assigned: <AlertCircle className="h-5 w-5 text-semantic-info" />,
  task_shared: <Share2 className="h-5 w-5 text-purple-500 dark:text-purple-400" />,
  reminder: <Clock className="h-5 w-5 text-semantic-warning" />,
  comment: <MessageCircle className="h-5 w-5 text-semantic-success" />,
  system: <Bell className="h-5 w-5 text-content-tertiary" />,
}

const notificationTypeLabels: Record<string, string> = {
  task_assigned: 'Task Assigned',
  task_shared: 'Task Shared',
  reminder: 'Reminder',
  comment: 'Comment',
  system: 'System',
}

interface GroupedNotifications {
  today: Notification[]
  yesterday: Notification[]
  week: Notification[]
  older: Notification[]
}

const groupNotificationsByDate = (
  notifs: Notification[]
): GroupedNotifications => {
  const now = new Date()
  const todayNotifs: Notification[] = []
  const yesterdayNotifs: Notification[] = []
  const weekNotifs: Notification[] = []
  const olderNotifs: Notification[] = []

  notifs.forEach((notif) => {
    const date = new Date(notif.createdAt)
    if (isToday(date)) {
      todayNotifs.push(notif)
    } else if (isYesterday(date)) {
      yesterdayNotifs.push(notif)
    } else if (date.getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000) {
      weekNotifs.push(notif)
    } else {
      olderNotifs.push(notif)
    }
  })

  return {
    today: todayNotifs,
    yesterday: yesterdayNotifs,
    week: weekNotifs,
    older: olderNotifs,
  }
}

export function NotificationCenter({ isOpen, onClose, className }: NotificationCenterProps) {
  const { user } = useAuthStore()
  const {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
  } = useNotificationStore()

  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications(user.id)
    }
  }, [isOpen, user, loadNotifications])

  if (!isOpen || !user) return null

  const visibleNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(user.id)
  }

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
  }

  const handleArchive = async (id: string) => {
    await archiveNotification(id)
  }

  const grouped = groupNotificationsByDate(visibleNotifications)

  const NotificationGroup = ({
    title,
    notifs,
  }: {
    title: string
    notifs: typeof visibleNotifications
  }) => {
    if (notifs.length === 0) return null

    return (
      <div>
        <div className="sticky top-0 bg-surface-secondary px-4 py-2 text-xs font-semibold text-content-secondary uppercase tracking-wider border-b border-border">
          {title}
        </div>
        <div className="space-y-0">
          {notifs.map((notification) => {
            const icon = notificationIcons[notification.type] || notificationIcons.system

            return (
              <div
                key={notification.id}
                className={cn(
                  'flex items-start gap-3 border-b border-border p-4 transition-colors',
                  !notification.read ? 'bg-semantic-info-light' : 'hover:bg-surface-tertiary'
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">{icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p
                      className={cn(
                        'text-sm',
                        !notification.read
                          ? 'font-semibold text-content-primary'
                          : 'text-content-secondary'
                      )}
                    >
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <span className="flex-shrink-0 inline-block h-2 w-2 rounded-full bg-semantic-info mt-1" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-content-tertiary">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                    <span className="text-xs text-content-tertiary">
                      {notificationTypeLabels[notification.type] || 'Notification'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="rounded p-1 text-content-tertiary hover:bg-interactive-secondary transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleArchive(notification.id)}
                    className="rounded p-1 text-content-tertiary hover:bg-interactive-secondary transition-colors"
                    title="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="rounded p-1 text-content-tertiary hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('fixed inset-0 z-50 flex', className)}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto flex w-full flex-col bg-surface-primary sm:w-96 sm:shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-lg font-semibold text-content-primary">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <p className="text-sm text-content-tertiary">
                {unreadCount} unread
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-content-tertiary hover:bg-surface-tertiary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-border p-4">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              filter === 'all'
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                : 'bg-surface-tertiary text-content-secondary hover:bg-interactive-secondary'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              filter === 'unread'
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                : 'bg-surface-tertiary text-content-secondary hover:bg-interactive-secondary'
            )}
          >
            Unread
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="ml-auto rounded px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/30 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {visibleNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-content-tertiary mb-2" />
              <p className="text-content-tertiary">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
            </div>
          ) : (
            <div>
              <NotificationGroup title="Today" notifs={grouped.today} />
              <NotificationGroup title="Yesterday" notifs={grouped.yesterday} />
              <NotificationGroup title="This Week" notifs={grouped.week} />
              <NotificationGroup title="Older" notifs={grouped.older} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
