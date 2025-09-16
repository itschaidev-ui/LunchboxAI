export interface CommandAction {
  id: string
  title: string
  description: string
  icon: string
  action: () => void
  category: string
  shortcut?: string
}

// Quick Actions Configuration
// You can easily add, remove, or modify these actions
export const commandActions: CommandAction[] = [
  // Navigation Actions
  {
    id: 'navigate-chat',
    title: 'Go to Chat',
    description: 'Open the AI chat interface',
    icon: '💬',
    category: 'Navigation',
    shortcut: 'Cmd+1',
    action: () => {
      // This will be set dynamically in the component
    }
  },
  {
    id: 'navigate-tasks',
    title: 'View Tasks',
    description: 'Go to the tasks section',
    icon: '📋',
    category: 'Navigation',
    shortcut: 'Cmd+2',
    action: () => {}
  },
  {
    id: 'navigate-progress',
    title: 'View Progress',
    description: 'Check your progress and stats',
    icon: '📊',
    category: 'Navigation',
    shortcut: 'Cmd+3',
    action: () => {}
  },
  {
    id: 'navigate-calendar',
    title: 'Open Calendar',
    description: 'View calendar and export options',
    icon: '📅',
    category: 'Navigation',
    shortcut: 'Cmd+4',
    action: () => {}
  },

  // Task Actions
  {
    id: 'create-task',
    title: 'Create New Task',
    description: 'Start creating a new task',
    icon: '➕',
    category: 'Tasks',
    shortcut: 'Cmd+N',
    action: () => {}
  },
  {
    id: 'complete-task',
    title: 'Complete Current Task',
    description: 'Mark the current task as complete',
    icon: '✅',
    category: 'Tasks',
    action: () => {}
  },
  {
    id: 'view-steps',
    title: 'View Task Steps',
    description: 'Show detailed steps for current task',
    icon: '👀',
    category: 'Tasks',
    action: () => {}
  },

  // AI Actions
  {
    id: 'ask-ai',
    title: 'Ask AI Assistant',
    description: 'Get help from the AI assistant',
    icon: '🤖',
    category: 'AI',
    shortcut: 'Cmd+/',
    action: () => {}
  },
  {
    id: 'get-focus-tips',
    title: 'Get Focus Tips',
    description: 'Receive productivity and focus tips',
    icon: '💡',
    category: 'AI',
    action: () => {}
  },
  {
    id: 'start-walkthrough',
    title: 'Start Walkthrough',
    description: 'Begin guided task walkthrough',
    icon: '🚀',
    category: 'AI',
    action: () => {}
  },

  // Calendar Actions
  {
    id: 'export-calendar',
    title: 'Export Calendar',
    description: 'Download calendar file with all tasks',
    icon: '📤',
    category: 'Calendar',
    action: () => {}
  },
  {
    id: 'add-to-calendar',
    title: 'Add Task to Calendar',
    description: 'Add current task to your calendar',
    icon: '📅',
    category: 'Calendar',
    action: () => {}
  },

  // Settings & Profile
  {
    id: 'open-profile',
    title: 'Open Profile',
    description: 'View and edit your profile settings',
    icon: '👤',
    category: 'Settings',
    shortcut: 'Cmd+,',
    action: () => {}
  },
  {
    id: 'discord-settings',
    title: 'Discord Settings',
    description: 'Configure Discord notifications',
    icon: '🔔',
    category: 'Settings',
    action: () => {}
  },
  {
    id: 'premium-features',
    title: 'Premium Features',
    description: 'View and manage premium features',
    icon: '⭐',
    category: 'Settings',
    action: () => {}
  },

  // Quick Actions
  {
    id: 'toggle-theme',
    title: 'Toggle Theme',
    description: 'Switch between light and dark themes',
    icon: '🌙',
    category: 'Quick Actions',
    shortcut: 'Cmd+T',
    action: () => {}
  },
  {
    id: 'refresh-data',
    title: 'Refresh Data',
    description: 'Reload all data from the server',
    icon: '🔄',
    category: 'Quick Actions',
    shortcut: 'Cmd+R',
    action: () => {}
  },
  {
    id: 'clear-chat',
    title: 'Clear Chat',
    description: 'Clear the chat history',
    icon: '🗑️',
    category: 'Quick Actions',
    action: () => {}
  },

  // Help & Support
  {
    id: 'help-center',
    title: 'Help Center',
    description: 'Get help and documentation',
    icon: '❓',
    category: 'Help',
    shortcut: 'Cmd+?',
    action: () => {}
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'View all available keyboard shortcuts',
    icon: '⌨️',
    category: 'Help',
    action: () => {}
  },
  {
    id: 'feedback',
    title: 'Send Feedback',
    description: 'Share your feedback with us',
    icon: '💬',
    category: 'Help',
    action: () => {}
  }
]

// Helper function to create custom actions
export function createCustomAction(
  id: string,
  title: string,
  description: string,
  icon: string,
  category: string,
  action: () => void,
  shortcut?: string
): CommandAction {
  return {
    id,
    title,
    description,
    icon,
    category,
    action,
    shortcut
  }
}

// Helper function to add new actions dynamically
export function addCustomActions(newActions: CommandAction[]): CommandAction[] {
  return [...commandActions, ...newActions]
}

// Helper function to filter actions by category
export function getActionsByCategory(category: string): CommandAction[] {
  return commandActions.filter(action => action.category === category)
}
