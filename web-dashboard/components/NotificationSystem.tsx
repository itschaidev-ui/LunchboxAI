'use client'

import React from 'react'
import { Notification, NotificationAction } from '../contexts/NotificationContext'

interface NotificationItemProps {
  notification: Notification
  onRemove: (id: string) => void
  onAction: (action: NotificationAction) => void
}

export function NotificationItem({ notification, onRemove, onAction }: NotificationItemProps) {
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          progress: 'bg-green-500',
        }
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          progress: 'bg-red-500',
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          progress: 'bg-yellow-500',
        }
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          progress: 'bg-blue-500',
        }
      case 'loading':
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          message: 'text-gray-700',
          progress: 'bg-gray-500',
        }
      default:
        return {
          container: 'bg-white border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          message: 'text-gray-700',
          progress: 'bg-gray-500',
        }
    }
  }

  const getActionStyles = (variant: NotificationAction['variant'] = 'secondary') => {
    switch (variant) {
      case 'primary':
        return 'bg-orange-500 text-white hover:bg-orange-600'
      case 'danger':
        return 'bg-red-500 text-white hover:bg-red-600'
      default:
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    }
  }

  const styles = getTypeStyles()

  return (
    <div
      className={`
        relative max-w-sm w-full bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border
        transform transition-all duration-300 ease-in-out
        hover:shadow-xl hover:scale-105
        ${styles.container}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Progress bar for non-persistent notifications */}
      {!notification.persistent && notification.duration && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-xl overflow-hidden">
          <div
            className={`h-full ${styles.progress} transition-all ease-linear`}
            style={{
              animation: `progress ${notification.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 text-xl ${styles.icon}`}>
            {notification.type === 'loading' ? (
              <div className="animate-spin">⏳</div>
            ) : (
              notification.icon || '📢'
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${styles.title}`}>
              {notification.title}
            </h4>
            {notification.message && (
              <p className={`mt-1 text-sm ${styles.message}`}>
                {notification.message}
              </p>
            )}

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => onAction(action)}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-lg
                      transition-colors duration-200
                      ${getActionStyles(action.variant)}
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => onRemove(notification.id)}
            className={`
              flex-shrink-0 p-1 rounded-lg
              hover:bg-gray-200/50 transition-colors duration-200
              ${styles.icon}
            `}
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}

interface NotificationContainerProps {
  notifications: Notification[]
  onRemove: (id: string) => void
  onAction: (action: NotificationAction) => void
}

export function NotificationContainer({ notifications, onRemove, onAction }: NotificationContainerProps) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="animate-in slide-in-from-right-full duration-300"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <NotificationItem
            notification={notification}
            onRemove={onRemove}
            onAction={onAction}
          />
        </div>
      ))}
    </div>
  )
}
