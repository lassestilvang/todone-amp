import { useEffect, useState } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { cn } from '@/utils/cn'
import { X, Trash2, CheckCircle, Archive } from 'lucide-react'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

const notificationIcons: Record<string, string> = {
  task_assigned: '👤',
  task_shared: '🔗',
  reminder: '🔔',
  comment: '💬',
  system: '📢',
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

  return (
    <div className={cn('fixed inset-0 z-50 flex', className)}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto flex w-full flex-col bg-white dark:bg-gray-900 sm:w-96 sm:shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {unreadCount} unread
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-gray-200 p-4 dark:border-gray-700">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              filter === 'all'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              filter === 'unread'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            )}
          >
            Unread
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="ml-auto rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-800"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {visibleNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-2 text-4xl">📭</div>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {visibleNotifications.map((notification) => {
                const icon =
                  notificationIcons[notification.type] || notificationIcons.system

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-3 border-b border-gray-100 p-4 transition-colors dark:border-gray-800',
                      !notification.read ? 'bg-blue-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {/* Icon */}
                    <span className="mt-0.5 text-lg">{icon}</span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm',
                          !notification.read
                            ? 'font-semibold text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        )}
                      >
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleArchive(notification.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Archive"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
