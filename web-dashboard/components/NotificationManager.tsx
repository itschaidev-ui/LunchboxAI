'use client'

import React from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import { NotificationContainer } from './NotificationSystem'

export function NotificationManager() {
  const { notifications, removeNotification } = useNotifications()

  const handleAction = (action: any) => {
    action.action()
  }

  return (
    <NotificationContainer
      notifications={notifications}
      onRemove={removeNotification}
      onAction={handleAction}
    />
  )
}

// Additional utility component for showing notification counts
export function NotificationIndicator() {
  const { notifications, clearAll } = useNotifications()

  if (notifications.length === 0) return null

  const errorCount = notifications.filter(n => n.type === 'error').length
  const warningCount = notifications.filter(n => n.type === 'warning').length
  const loadingCount = notifications.filter(n => n.type === 'loading').length

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white/90 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </div>
          
          {errorCount > 0 && (
            <div className="flex items-center space-x-1 text-red-600">
              <span className="text-xs">❌</span>
              <span className="text-xs font-medium">{errorCount}</span>
            </div>
          )}
          
          {warningCount > 0 && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <span className="text-xs">⚠️</span>
              <span className="text-xs font-medium">{warningCount}</span>
            </div>
          )}
          
          {loadingCount > 0 && (
            <div className="flex items-center space-x-1 text-gray-600">
              <span className="text-xs animate-spin">⏳</span>
              <span className="text-xs font-medium">{loadingCount}</span>
            </div>
          )}

          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  )
}
