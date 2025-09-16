'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  actions?: NotificationAction[]
  icon?: string
}

export interface NotificationAction {
  label: string
  action: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => string
  removeNotification: (id: string) => void
  updateNotification: (id: string, updates: Partial<Notification>) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      duration: 5000,
      persistent: false,
      ...notification,
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove non-persistent notifications
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, ...updates } : notification
      )
    )
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        updateNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Convenience hooks for different notification types
export function useNotificationActions() {
  const { addNotification, removeNotification, updateNotification } = useNotifications()

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      icon: '✅',
      ...options,
    })
  }, [addNotification])

  const showError = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      icon: '❌',
      persistent: true, // Errors should persist until manually dismissed
      ...options,
    })
  }, [addNotification])

  const showWarning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      icon: '⚠️',
      duration: 7000,
      ...options,
    })
  }, [addNotification])

  const showInfo = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      icon: 'ℹ️',
      ...options,
    })
  }, [addNotification])

  const showLoading = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'loading',
      title,
      message,
      icon: '⏳',
      persistent: true,
      ...options,
    })
  }, [addNotification])

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    removeNotification,
    updateNotification,
  }
}
