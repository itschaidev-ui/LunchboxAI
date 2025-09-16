'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AIChat from '../../components/AIChat'
import PremiumFeatures from '../../components/PremiumFeatures'
import CommandPalette from '../../components/CommandPalette'
import { useCommandPalette } from '../../hooks/useCommandPalette'
import { commandActions, createCustomAction } from '../../lib/commands/actions'
import { useNotificationActions } from '../../contexts/NotificationContext'
import NotificationDemo from '../../components/NotificationDemo'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('chat')
  const { isOpen: isCommandPaletteOpen, closeCommandPalette } = useCommandPalette()
  const { showSuccess, showError, showWarning, showInfo, showLoading, removeNotification } = useNotificationActions()
  const [tasks, setTasks] = useState([])
  const [completingTask, setCompletingTask] = useState(null)
  const [expandedTasks, setExpandedTasks] = useState(new Set())
  const [activeWalkthrough, setActiveWalkthrough] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [userStats, setUserStats] = useState({
    xp: 0,
    level: 1,
    streak: 0
  })
  const [discordSettings, setDiscordSettings] = useState({
    notifications_enabled: false,
    has_connection: false
  })

  // Create dynamic command actions
  const dynamicActions = [
    // Navigation actions
    createCustomAction('navigate-chat', 'Go to Chat', 'Open the AI chat interface', '💬', 'Navigation', () => setActiveTab('chat'), 'Cmd+1'),
    createCustomAction('navigate-tasks', 'View Tasks', 'Go to the tasks section', '📋', 'Navigation', () => setActiveTab('tasks'), 'Cmd+2'),
    createCustomAction('navigate-progress', 'View Progress', 'Check your progress and stats', '📊', 'Navigation', () => setActiveTab('progress'), 'Cmd+3'),
    createCustomAction('navigate-calendar', 'Open Calendar', 'View calendar and export options', '📅', 'Navigation', () => setActiveTab('calendar'), 'Cmd+4'),
    createCustomAction('navigate-walkthrough', 'Start Walkthrough', 'Begin guided task walkthrough', '🚀', 'Navigation', () => setActiveTab('walkthrough')),
    createCustomAction('navigate-premium', 'Premium Features', 'View and manage premium features', '⭐', 'Navigation', () => setActiveTab('premium')),
    
    // Task actions
    createCustomAction('create-task', 'Create New Task', 'Start creating a new task', '➕', 'Tasks', () => {
      // Focus on chat input to create a task
      setActiveTab('chat')
      const chatInput = document.querySelector('textarea[placeholder*="message"]') as HTMLTextAreaElement
      if (chatInput) {
        chatInput.focus()
        chatInput.value = 'Create a task: '
        chatInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }, 'Cmd+N'),
    
    createCustomAction('complete-task', 'Complete Current Task', 'Mark the current task as complete', '✅', 'Tasks', () => {
      if (tasks.length > 0 && !completingTask) {
        handleCompleteTask(tasks[0].id)
      }
    }),
    
    createCustomAction('view-steps', 'View Task Steps', 'Show detailed steps for current task', '👀', 'Tasks', () => {
      if (tasks.length > 0) {
        toggleTaskExpansion(tasks[0].id)
      }
    }),
    
    // Calendar actions
    createCustomAction('export-calendar', 'Export Calendar', 'Download calendar file with all tasks', '📤', 'Calendar', () => exportToCalendar()),
    createCustomAction('add-to-calendar', 'Add Task to Calendar', 'Add current task to your calendar', '📅', 'Calendar', () => {
      if (tasks.length > 0) {
        addTaskToCalendar(tasks[0])
      }
    }),
    
    // Quick actions
    createCustomAction('refresh-data', 'Refresh Data', 'Reload all data from the server', '🔄', 'Quick Actions', () => {
      fetchUserStats()
      fetchUserTasks()
      fetchDiscordSettings()
    }, 'Cmd+R'),
    
    createCustomAction('clear-chat', 'Clear Chat', 'Clear the chat history', '🗑️', 'Quick Actions', () => {
      // This would need to be implemented in AIChat component
      console.log('Clear chat functionality would be implemented here')
    }),
    
    // Settings
    createCustomAction('open-profile', 'Open Profile', 'View and edit your profile settings', '👤', 'Settings', () => setActiveTab('profile'), 'Cmd+,'),
    createCustomAction('discord-settings', 'Discord Settings', 'Configure Discord notifications', '🔔', 'Settings', () => setActiveTab('profile')),
    
    // Help
    createCustomAction('keyboard-shortcuts', 'Keyboard Shortcuts', 'View all available keyboard shortcuts', '⌨️', 'Help', () => {
      // Show keyboard shortcuts modal
      showInfo(
        'Keyboard Shortcuts',
        '⌘K - Open Command Palette\n⌘1 - Chat\n⌘2 - Tasks\n⌘3 - Progress\n⌘4 - Calendar\n⌘N - New Task\n⌘R - Refresh\n⌘, - Profile\n\nUse ⌘K to access all commands!',
        { persistent: true }
      )
    }),
    
    createCustomAction('help-center', 'Help Center', 'Get help and documentation', '❓', 'Help', () => {
      window.open('https://help.lunchboxai.com', '_blank')
    }, 'Cmd+?'),
    
    createCustomAction('feedback', 'Send Feedback', 'Share your feedback with us', '💬', 'Help', () => {
      window.open('mailto:support@lunchboxai.com?subject=Feedback', '_blank')
    })
  ]

  // Combine static and dynamic actions
  const allActions = [...commandActions.filter(action => !dynamicActions.find(da => da.id === action.id)), ...dynamicActions]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      // Fetch user stats, tasks, and Discord settings when component mounts
      fetchUserStats()
      fetchUserTasks()
      fetchDiscordSettings()
    }
  }, [status, router])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const fetchUserTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const tasks = await response.json()
        setTasks(tasks)
      }
    } catch (error) {
      console.error('Error fetching user tasks:', error)
    }
  }

  const fetchDiscordSettings = async () => {
    try {
      const response = await fetch('/api/discord/notifications')
      if (response.ok) {
        const settings = await response.json()
        setDiscordSettings({
          notifications_enabled: settings.discord_notifications_enabled,
          has_connection: settings.has_discord_connection
        })
      }
    } catch (error) {
      console.error('Error fetching Discord settings:', error)
    }
  }

  const toggleDiscordNotifications = async () => {
    try {
      const action = discordSettings.notifications_enabled ? 'disable_notifications' : 'enable_notifications'
      const response = await fetch('/api/discord/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        const data = await response.json()
        setDiscordSettings(prev => ({
          ...prev,
          notifications_enabled: !prev.notifications_enabled
        }))
        showSuccess('Discord Notifications Updated', data.message)
      } else {
        showError('Failed to Update Notifications', 'Unable to connect to server')
      }
    } catch (error) {
      console.error('Error toggling Discord notifications:', error)
      showError('Failed to Update Notifications', 'Network error occurred')
    }
  }

  const testDiscordNotification = async () => {
    try {
      const response = await fetch('/api/discord/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test_notification' }),
      })

      if (response.ok) {
        const data = await response.json()
        showSuccess('Test Notification Sent', data.message)
      } else {
        showError('Failed to Send Test', 'Unable to send test notification')
      }
    } catch (error) {
      console.error('Error sending test notification:', error)
      showError('Failed to Send Test', 'Network error occurred')
    }
  }

  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const handleDeleteTask = async (taskId) => {
    // Show confirmation notification instead of browser confirm
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
            action: async () => {
              removeNotification(confirmId)
              await performTaskDeletion(taskId)
            },
            variant: 'danger'
          }
        ]
      }
    )
  }

  const performTaskDeletion = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh tasks to show updated list
        await fetchUserTasks()
        showSuccess('Task Deleted', 'Task has been successfully removed')
      } else {
        showError('Delete Failed', 'Unable to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      showError('Delete Failed', 'Network error occurred')
    }
  }

  const startWalkthrough = (task) => {
    setActiveWalkthrough(task)
    setCurrentStep(0)
    setActiveTab('walkthrough')
  }

  const nextStep = () => {
    if (activeWalkthrough && currentStep < activeWalkthrough.completion_steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeWalkthrough = async () => {
    if (!activeWalkthrough) return

    try {
      setCompletingTask(activeWalkthrough.id)
      
      const response = await fetch(`/api/tasks/${activeWalkthrough.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceComplete: true }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh user stats and tasks
        await Promise.all([
          fetchUserStats(),
          fetchUserTasks()
        ])
        
        // Close walkthrough
        setActiveWalkthrough(null)
        setCurrentStep(0)
        setActiveTab('tasks')
        
        alert(`🎉 Task completed! +${data.xpGained} XP`)
      } else {
        alert('Failed to complete task: ' + data.error)
      }
    } catch (error) {
      console.error('Error completing task:', error)
      alert('Failed to complete task')
    } finally {
      setCompletingTask(null)
    }
  }

  const getFocusTips = (stepDescription) => {
    const tips = []
    
    if (stepDescription.toLowerCase().includes('study') || stepDescription.toLowerCase().includes('review')) {
      tips.push('📚 Use Pomodoro technique: 25min focus, 5min break')
      tips.push('🌐 Install Chrome extension "StayFocusd" to block distracting sites')
      tips.push('📝 Take notes in a separate document')
    }
    
    if (stepDescription.toLowerCase().includes('watch') || stepDescription.toLowerCase().includes('video')) {
      tips.push('🎥 Use 1.5x speed for faster learning')
      tips.push('📱 Close other tabs to avoid distractions')
      tips.push('⏸️ Pause and take notes every 10 minutes')
    }
    
    if (stepDescription.toLowerCase().includes('practice') || stepDescription.toLowerCase().includes('quiz')) {
      tips.push('⏰ Set a timer for each practice session')
      tips.push('📊 Track your progress and weak areas')
      tips.push('🔄 Review incorrect answers immediately')
    }
    
    return tips
  }

  const exportToCalendar = async () => {
    try {
      const response = await fetch('/api/calendar')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'lunchbox-tasks.ics'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        showSuccess(
          'Calendar Exported', 
          '📅 Calendar exported successfully! Import the .ics file into Google Calendar, Apple Calendar, or Outlook.',
          {
            actions: [
              {
                label: 'Open Calendar App',
                action: () => {
                  // Try to open default calendar app
                  window.open('webcal://', '_blank')
                },
                variant: 'primary'
              }
            ]
          }
        )
      } else {
        showError('Export Failed', 'Unable to export calendar')
      }
    } catch (error) {
      console.error('Error exporting calendar:', error)
      showError('Export Failed', 'Network error occurred')
    }
  }

  const addTaskToCalendar = async (taskId) => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          action: 'add_to_calendar'
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `task-${taskId}.ics`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        alert('📅 Task added to calendar! Import the .ics file into your calendar app.')
      } else {
        alert('Failed to add task to calendar')
      }
    } catch (error) {
      console.error('Error adding task to calendar:', error)
      alert('Failed to add task to calendar')
    }
  }

  const handleCompleteTask = async (taskId, forceComplete = false) => {
    try {
      setCompletingTask(taskId)
      
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceComplete }),
      })

      const data = await response.json()

      if (data.warning && data.isEarly) {
        // Show confirmation notification for early completion
        const confirmId = showWarning(
          'Early Completion',
          data.message,
          {
            persistent: true,
            actions: [
              {
                label: 'Cancel',
                action: () => {
                  removeNotification(confirmId)
                  setCompletingTask(null)
                },
                variant: 'secondary'
              },
              {
                label: 'Complete Anyway',
                action: () => {
                  removeNotification(confirmId)
                  handleCompleteTask(taskId, true)
                },
                variant: 'primary'
              }
            ]
          }
        )
        return
      }

      if (data.success) {
        // Refresh user stats and tasks to show updated data
        await Promise.all([
          fetchUserStats(),
          fetchUserTasks()
        ])
        
        // Show success message with XP gain
        showSuccess(
          'Task Completed!', 
          `🎉 Great job! You earned ${data.xpGained} XP`,
          {
            actions: [
              {
                label: 'View Progress',
                action: () => setActiveTab('progress'),
                variant: 'primary'
              }
            ]
          }
        )
        
        if (data.isOverdue) {
          showWarning(
            'Overdue Task Completed',
            'This task was overdue! A reminder has been sent to your Discord.',
            { duration: 8000 }
          )
        }
      } else {
        showError('Task Completion Failed', data.error || 'Unable to complete task')
      }
    } catch (error) {
      console.error('Error completing task:', error)
      showError('Task Completion Failed', 'Network error occurred')
    } finally {
      setCompletingTask(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-xl shadow-2xl border-r border-orange-200/50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-orange-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-gray-800">Lunchbox AI</span>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-orange-200/50">
          <div className="flex items-center space-x-3">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-10 h-10 rounded-full border-2 border-orange-200"
              />
            ) : (
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center border border-orange-200">
                <span className="text-orange-600 font-medium">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-800 text-sm">{session?.user?.name}</p>
              <p className="text-xs text-gray-600">Level {userStats.level}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-orange-100 text-orange-700 shadow-lg backdrop-blur-sm border border-orange-200'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700 backdrop-blur-sm'
            }`}
          >
            <span className="text-lg">💬</span>
            <span>AI Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'tasks'
                ? 'bg-orange-100 text-orange-700 shadow-lg backdrop-blur-sm border border-orange-200'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700 backdrop-blur-sm'
            }`}
          >
            <span className="text-lg">📝</span>
            <span>Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'calendar'
                ? 'bg-orange-100 text-orange-700 shadow-lg backdrop-blur-sm border border-orange-200'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700 backdrop-blur-sm'
            }`}
          >
            <span className="text-lg">📅</span>
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'walkthrough'
                ? 'bg-orange-100 text-orange-700 shadow-lg backdrop-blur-sm border border-orange-200'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700 backdrop-blur-sm'
            }`}
          >
            <span className="text-lg">🎯</span>
            <span>Walkthrough</span>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'progress'
                ? 'bg-orange-100 text-orange-700 shadow-lg backdrop-blur-sm border border-orange-200'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700 backdrop-blur-sm'
            }`}
          >
            <span className="text-lg">📊</span>
            <span>Progress</span>
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'premium'
                ? 'bg-orange-100 text-orange-700 shadow-lg backdrop-blur-sm border border-orange-200'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700 backdrop-blur-sm'
            }`}
          >
            <span className="text-lg">💎</span>
            <span>Premium</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-orange-100 text-orange-700 shadow-lg backdrop-blur-sm border border-orange-200'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700 backdrop-blur-sm'
            }`}
          >
            <span className="text-lg">👤</span>
            <span>Profile</span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-orange-200/50 space-y-2">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 backdrop-blur-sm"
          >
            <span className="text-lg">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-orange-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab === 'chat' && 'AI Chat'}
                {activeTab === 'tasks' && 'Your Tasks'}
                {activeTab === 'calendar' && 'Calendar'}
                {activeTab === 'walkthrough' && 'Task Walkthrough'}
                {activeTab === 'progress' && 'Progress'}
                {activeTab === 'premium' && 'Premium Features'}
                {activeTab === 'profile' && 'Profile'}
              </h1>
              <p className="text-gray-600">
                {activeTab === 'chat' && 'Chat with your AI assistant'}
                {activeTab === 'tasks' && 'Manage and track your tasks'}
                {activeTab === 'calendar' && 'Sync tasks with your calendar'}
                {activeTab === 'walkthrough' && 'Get guided through task completion'}
                {activeTab === 'progress' && 'Track your productivity stats'}
                {activeTab === 'premium' && 'Upgrade your experience'}
                {activeTab === 'profile' && 'Manage your account settings'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Level</div>
                  <div className="text-lg font-bold text-orange-600">{userStats.level}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">XP</div>
                  <div className="text-lg font-bold text-orange-600">{userStats.xp}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Streak</div>
                  <div className="text-lg font-bold text-orange-600">{userStats.streak}</div>
                </div>
              </div>
            </div>
            
            {/* Command Palette Hint */}
            <div className="mt-4 p-3 bg-orange-50/50 rounded-lg border border-orange-200/50">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <span>Press</span>
                <kbd className="px-2 py-1 bg-white text-gray-600 text-xs rounded border border-gray-300 shadow-sm">
                  ⌘K
                </kbd>
                <span>for quick actions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Tab Content */}
          <div className="min-h-[600px]">
          {activeTab === 'chat' && (
            <div className="h-[600px]">
              <AIChat 
                onTaskCreated={(task) => {
                  setTasks(prev => [task, ...prev])
                  setActiveTab('tasks')
                }}
                className="h-full"
              />
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-orange-200/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-600">
                      {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                    </div>
                    <button
                      onClick={exportToCalendar}
                      className="bg-orange-500/80 hover:bg-orange-500 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
                    >
                      📅 Export Calendar
                    </button>
                  </div>
                </div>
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No tasks yet</h3>
                    <p className="text-gray-600 mb-4">Start a conversation with AI Chat to create your first task!</p>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 backdrop-blur-sm"
                    >
                      Go to AI Chat
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task, index) => {
                      const isExpanded = expandedTasks.has(task.id)
                      return (
                        <div key={index} className="border border-orange-200/50 rounded-lg p-4 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-800">{task.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.category === 'Sweet' ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                              task.category === 'Veggies' ? 'bg-green-100 text-green-700 border border-green-200' :
                              task.category === 'Savory' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                              'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {task.category}
                            </span>
                          </div>
                          
                          {task.due_date && (
                            <div className="mb-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                new Date(task.due_date) < new Date() ? 'bg-red-100 text-red-700 border border-red-200' :
                                new Date(task.due_date) < new Date(Date.now() + 24 * 60 * 60 * 1000) ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}>
                                Due: {new Date(task.due_date).toLocaleDateString()} {new Date(task.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          )}
                          
                          {/* Expandable Steps Section */}
                          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                          }`}>
                            <div className="mb-4 p-3 bg-orange-50 backdrop-blur-sm rounded-lg border border-orange-200/50">
                              <h4 className="font-medium text-gray-800 mb-2">📋 Step-by-Step Plan:</h4>
                              <div className="space-y-2">
                                {task.completion_steps.map((step, stepIndex) => (
                                  <div key={stepIndex} className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                      {step.step_number}
                                    </span>
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{
                                        __html: step.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                      }}></p>
                                      <span className="text-xs text-gray-500">~{step.estimated_time} min</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              {task.completion_steps.length} steps • ~{Math.round(task.completion_steps.reduce((total, step) => total + (step.estimated_time || 0), 0) / 60)}min
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => startWalkthrough(task)}
                                className="group bg-green-500/80 hover:bg-green-500 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                              >
                                <span className="flex items-center space-x-1">
                                  <span>Start Walkthrough</span>
                                  <span className="text-xs">🚀</span>
                                </span>
                              </button>
                              <button 
                                onClick={() => toggleTaskExpansion(task.id)}
                                className="group bg-gradient-to-r from-orange-500/80 to-orange-600/80 hover:from-orange-500 hover:to-orange-600 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                              >
                                <span className="flex items-center space-x-1">
                                  <span>{isExpanded ? 'Hide Steps' : 'View Steps'}</span>
                                  <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
                                </span>
                              </button>
                              {task.due_date && (
                                <button 
                                  onClick={() => addTaskToCalendar(task.id)}
                                  className="group bg-blue-500/80 hover:bg-blue-500 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                                >
                                  <span className="flex items-center space-x-1">
                                    <span>Add to Calendar</span>
                                    <span className="text-xs">📅</span>
                                  </span>
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteTask(task.id)}
                                className="group bg-red-500/80 hover:bg-red-500 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                              >
                                <span className="flex items-center space-x-1">
                                  <span>Delete</span>
                                  <span className="text-xs">🗑️</span>
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'walkthrough' && (
            <div className="max-w-4xl mx-auto">
              {activeWalkthrough ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-orange-200/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{activeWalkthrough.title}</h2>
                      <p className="text-gray-600">Step {currentStep + 1} of {activeWalkthrough.completion_steps.length}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveWalkthrough(null)
                        setCurrentStep(0)
                        setActiveTab('tasks')
                      }}
                      className="text-gray-600 hover:text-orange-600 text-sm transition-colors"
                    >
                      ← Back to Tasks
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(((currentStep + 1) / activeWalkthrough.completion_steps.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / activeWalkthrough.completion_steps.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Current Step */}
                  <div className="mb-6">
                    <div className="bg-gradient-to-r from-orange-400/80 to-orange-600/80 backdrop-blur-sm rounded-lg p-6 text-white border border-orange-200/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                          {currentStep + 1}
                        </div>
                        <h3 className="text-xl font-semibold">
                          {activeWalkthrough.completion_steps[currentStep]?.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2 text-sm opacity-90">
                        <span>⏱️</span>
                        <span>~{activeWalkthrough.completion_steps[currentStep]?.estimated_time} minutes</span>
                      </div>
                    </div>
                  </div>

                  {/* Focus Tips */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">🎯 Focus Tips</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getFocusTips(activeWalkthrough.completion_steps[currentStep]?.description || '').map((tip, index) => (
                        <div key={index} className="bg-blue-50/80 border border-blue-200/50 rounded-lg p-3 backdrop-blur-sm">
                          <p className="text-sm text-blue-800">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chrome Extension Recommendation */}
                  <div className="mb-6 bg-yellow-50/80 border border-yellow-200/50 rounded-lg p-4 backdrop-blur-sm">
                    <h4 className="font-semibold text-yellow-800 mb-2">🌐 Recommended Chrome Extensions</h4>
                    <div className="space-y-2 text-sm text-yellow-700">
                      <p>• <strong>StayFocusd:</strong> Block distracting websites during study time</p>
                      <p>• <strong>Forest:</strong> Plant virtual trees while staying focused</p>
                      <p>• <strong>Momentum:</strong> Beautiful new tab page with focus features</p>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <button
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400 rounded-lg transition-all duration-200 hover:shadow-lg"
                    >
                      ← Previous
                    </button>
                    
                    <div className="flex space-x-3">
                      {currentStep === activeWalkthrough.completion_steps.length - 1 ? (
                        <button
                          onClick={completeWalkthrough}
                          disabled={completingTask === activeWalkthrough.id}
                          className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white disabled:text-gray-500 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
                        >
                          {completingTask === activeWalkthrough.id ? 'Completing...' : 'Complete Task 🎉'}
                        </button>
                      ) : (
                        <button
                          onClick={nextStep}
                          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 backdrop-blur-sm text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
                        >
                          Next →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Walkthrough</h3>
                  <p className="text-gray-600 mb-4">Start a walkthrough from your tasks to get guided through each step!</p>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 backdrop-blur-sm"
                  >
                    Go to Tasks
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-orange-200/50 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">📊</div>
                    <h2 className="text-xl font-semibold text-gray-800">Your Stats</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level</span>
                      <span className="font-semibold text-orange-600">{userStats.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">XP</span>
                      <span className="font-semibold text-orange-600">{userStats.xp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Streak</span>
                      <span className="font-semibold text-orange-600">{userStats.streak} days</span>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-1">Progress to Next Level</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(userStats.xp % 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {userStats.xp % 100}/100 XP
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-orange-200/50 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">🎯</div>
                    <h2 className="text-xl font-semibold text-gray-800">Achievements</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-600">🏆</span>
                      <div>
                        <div className="font-medium text-gray-800">First Task</div>
                        <div className="text-sm text-gray-600">Complete your first task</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-blue-600">🔥</span>
                      <div>
                        <div className="font-medium text-gray-800">Streak Master</div>
                        <div className="text-sm text-gray-600">Maintain a 7-day streak</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-purple-600">⭐</span>
                      <div>
                        <div className="font-medium text-gray-800">Level Up</div>
                        <div className="text-sm text-gray-600">Reach level 5</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-orange-200/50 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">📈</div>
                    <h2 className="text-xl font-semibold text-gray-800">Weekly Progress</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{tasks.length}</div>
                      <div className="text-sm text-gray-600">Tasks This Week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {tasks.filter(task => task.status === 'completed').length}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round((tasks.filter(task => task.status === 'completed').length / Math.max(tasks.length, 1)) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Completion Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Discord ID</label>
                    <p className="text-sm text-white">{(session?.user as any)?.discordId || 'Not connected'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Username</label>
                    <p className="text-sm text-white">{(session?.user as any)?.username || session?.user?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                    <p className="text-sm text-white">{session?.user?.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Avatar</label>
                    {session?.user?.image && (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-16 h-16 rounded-full border-2 border-white/30"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Discord Notifications</label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={toggleDiscordNotifications}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm ${
                          discordSettings.notifications_enabled
                            ? 'bg-green-500/80 hover:bg-green-500 text-white'
                            : 'bg-gray-500/80 hover:bg-gray-500 text-white'
                        }`}
                      >
                        {discordSettings.notifications_enabled ? 'Enabled' : 'Disabled'}
                      </button>
                      {discordSettings.has_connection && (
                        <button
                          onClick={testDiscordNotification}
                          className="bg-blue-500/80 hover:bg-blue-500 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                        >
                          Test
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      {discordSettings.has_connection 
                        ? 'Get notified in Discord when tasks are overdue' 
                        : 'Connect Discord to enable notifications'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Notification System Demo */}
              <div className="mt-6">
                <NotificationDemo />
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-orange-200/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Calendar Integration</h2>
                  <button
                    onClick={exportToCalendar}
                    className="bg-blue-500/80 hover:bg-blue-500 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
                  >
                    📅 Export All Tasks
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Tasks</h3>
                    <div className="space-y-3">
                      {tasks.filter(task => task.due_date && new Date(task.due_date) > new Date()).slice(0, 5).map((task, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-orange-50/50 backdrop-blur-sm rounded-lg border border-orange-200/50">
                          <div>
                            <h4 className="font-medium text-gray-800">{task.title}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(task.due_date).toLocaleDateString()} at {new Date(task.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                          <button
                            onClick={() => addTaskToCalendar(task.id)}
                            className="bg-blue-500/80 hover:bg-blue-500 backdrop-blur-sm text-white px-3 py-1 rounded text-sm transition-all duration-200 hover:shadow-lg"
                          >
                            Add to Calendar
                          </button>
                        </div>
                      ))}
                      {tasks.filter(task => task.due_date && new Date(task.due_date) > new Date()).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-2">📅</div>
                          <p>No upcoming tasks scheduled</p>
                          <p className="text-sm">Create tasks with due dates to see them here</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Calendar Features</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/50">
                        <span className="text-blue-600">📅</span>
                        <div>
                          <h4 className="font-medium text-gray-800">iCalendar Export</h4>
                          <p className="text-sm text-gray-600">Export tasks to Google Calendar, Apple Calendar, or Outlook</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-green-50/80 backdrop-blur-sm rounded-lg border border-green-200/50">
                        <span className="text-green-600">⏰</span>
                        <div>
                          <h4 className="font-medium text-gray-800">Automatic Reminders</h4>
                          <p className="text-sm text-gray-600">Tasks include 1-hour reminders before due date</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-purple-50/80 backdrop-blur-sm rounded-lg border border-purple-200/50">
                        <span className="text-purple-600">📊</span>
                        <div>
                          <h4 className="font-medium text-gray-800">Priority & Duration</h4>
                          <p className="text-sm text-gray-600">Tasks include priority levels and estimated duration</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'premium' && (
            <div className="max-w-6xl mx-auto">
              <PremiumFeatures />
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={closeCommandPalette}
        actions={allActions}
      />
    </div>
  )
}
