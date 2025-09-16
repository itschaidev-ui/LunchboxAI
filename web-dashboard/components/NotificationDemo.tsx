'use client'

import React from 'react'
import { useNotificationActions } from '../contexts/NotificationContext'

export default function NotificationDemo() {
  const { showSuccess, showError, showWarning, showInfo, showLoading, removeNotification } = useNotificationActions()

  const demoSuccess = () => {
    showSuccess(
      'Task Completed Successfully!',
      '🎉 Great job! You earned 25 XP and completed your daily goal.',
      {
        actions: [
          {
            label: 'View Progress',
            action: () => console.log('Navigate to progress'),
            variant: 'primary'
          }
        ]
      }
    )
  }

  const demoError = () => {
    showError(
      'Connection Failed',
      'Unable to connect to the server. Please check your internet connection and try again.',
      {
        actions: [
          {
            label: 'Retry',
            action: () => console.log('Retry connection'),
            variant: 'primary'
          },
          {
            label: 'Report Issue',
            action: () => console.log('Report issue'),
            variant: 'secondary'
          }
        ]
      }
    )
  }

  const demoWarning = () => {
    showWarning(
      'Low Storage Space',
      'You\'re running low on storage space. Consider cleaning up old tasks or upgrading your plan.',
      {
        duration: 8000,
        actions: [
          {
            label: 'Clean Up',
            action: () => console.log('Clean up storage'),
            variant: 'primary'
          },
          {
            label: 'Upgrade',
            action: () => console.log('Upgrade plan'),
            variant: 'primary'
          }
        ]
      }
    )
  }

  const demoInfo = () => {
    showInfo(
      'New Feature Available',
      'Check out our new AI-powered task suggestions! Click below to explore.',
      {
        actions: [
          {
            label: 'Explore',
            action: () => console.log('Explore new features'),
            variant: 'primary'
          }
        ]
      }
    )
  }

  const demoLoading = () => {
    const loadingId = showLoading(
      'Processing Request',
      'Please wait while we process your request...'
    )

    // Simulate async operation
    setTimeout(() => {
      removeNotification(loadingId)
      showSuccess('Request Processed', 'Your request has been completed successfully!')
    }, 3000)
  }

  const demoConfirmation = () => {
    const confirmId = showWarning(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      {
        persistent: true,
        actions: [
          {
            label: 'Cancel',
            action: () => removeNotification(confirmId),
            variant: 'secondary'
          },
          {
            label: 'Delete',
            action: () => {
              removeNotification(confirmId)
              showSuccess('Task Deleted', 'The task has been permanently removed.')
            },
            variant: 'danger'
          }
        ]
      }
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-orange-200/50 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification System Demo</h3>
      <p className="text-sm text-gray-600 mb-6">
        Test the professional notification system with different types and interactions.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          onClick={demoSuccess}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
        >
          ✅ Success
        </button>
        
        <button
          onClick={demoError}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
        >
          ❌ Error
        </button>
        
        <button
          onClick={demoWarning}
          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
        >
          ⚠️ Warning
        </button>
        
        <button
          onClick={demoInfo}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
        >
          ℹ️ Info
        </button>
        
        <button
          onClick={demoLoading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          ⏳ Loading
        </button>
        
        <button
          onClick={demoConfirmation}
          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
        >
          🤔 Confirmation
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Professional animations and transitions</li>
          <li>• Action buttons for user interaction</li>
          <li>• Auto-dismiss with progress bars</li>
          <li>• Persistent notifications for important messages</li>
          <li>• Contextual icons and colors</li>
          <li>• Notification counter and management</li>
        </ul>
      </div>
    </div>
  )
}
