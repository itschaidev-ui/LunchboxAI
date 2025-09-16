// Freemium subscription service
export class SubscriptionService {
  constructor() {
    this.freeLimits = {
      tasksPerDay: 10,
      aiMessagesPerDay: 50,
      calendarExportsPerMonth: 5,
      maxTasksStored: 50,
      maxWalkthroughSteps: 5
    }
    
    this.premiumFeatures = [
      'unlimited_tasks',
      'unlimited_ai_messages', 
      'unlimited_calendar_exports',
      'advanced_ai_models',
      'priority_support',
      'custom_themes',
      'advanced_analytics',
      'team_collaboration',
      'api_access',
      'early_access_features'
    ]
  }

  async checkUserSubscription(userId) {
    try {
      // In a real implementation, this would check Stripe, PayPal, etc.
      // For now, we'll use a simple database field
      const response = await fetch(`/api/subscription/status?userId=${userId}`)
      if (response.ok) {
        return await response.json()
      }
      return { isPremium: false, plan: 'free', expiresAt: null }
    } catch (error) {
      console.error('Error checking subscription:', error)
      return { isPremium: false, plan: 'free', expiresAt: null }
    }
  }

  async canUserPerformAction(userId, action) {
    const subscription = await this.checkUserSubscription(userId)
    
    if (subscription.isPremium) {
      return { allowed: true, reason: 'premium_user' }
    }

    // Check free tier limits
    const usage = await this.getUserUsage(userId)
    
    switch (action) {
      case 'create_task':
        if (usage.tasksToday >= this.freeLimits.tasksPerDay) {
          return { 
            allowed: false, 
            reason: 'daily_limit_exceeded',
            limit: this.freeLimits.tasksPerDay,
            current: usage.tasksToday
          }
        }
        break
        
      case 'send_ai_message':
        if (usage.aiMessagesToday >= this.freeLimits.aiMessagesPerDay) {
          return { 
            allowed: false, 
            reason: 'daily_limit_exceeded',
            limit: this.freeLimits.aiMessagesPerDay,
            current: usage.aiMessagesToday
          }
        }
        break
        
      case 'export_calendar':
        if (usage.calendarExportsThisMonth >= this.freeLimits.calendarExportsPerMonth) {
          return { 
            allowed: false, 
            reason: 'monthly_limit_exceeded',
            limit: this.freeLimits.calendarExportsPerMonth,
            current: usage.calendarExportsThisMonth
          }
        }
        break
        
      case 'store_task':
        if (usage.totalTasks >= this.freeLimits.maxTasksStored) {
          return { 
            allowed: false, 
            reason: 'storage_limit_exceeded',
            limit: this.freeLimits.maxTasksStored,
            current: usage.totalTasks
          }
        }
        break
        
      case 'advanced_walkthrough':
        // Free users limited to 5 steps per walkthrough
        return { allowed: true, reason: 'limited_feature', limit: this.freeLimits.maxWalkthroughSteps }
        
      default:
        return { allowed: true, reason: 'unknown_action' }
    }

    return { allowed: true, reason: 'within_limits' }
  }

  async getUserUsage(userId) {
    try {
      const response = await fetch(`/api/subscription/usage?userId=${userId}`)
      if (response.ok) {
        return await response.json()
      }
      return {
        tasksToday: 0,
        aiMessagesToday: 0,
        calendarExportsThisMonth: 0,
        totalTasks: 0
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
      return {
        tasksToday: 0,
        aiMessagesToday: 0,
        calendarExportsThisMonth: 0,
        totalTasks: 0
      }
    }
  }

  async incrementUsage(userId, action) {
    try {
      const response = await fetch('/api/subscription/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      })
      return response.ok
    } catch (error) {
      console.error('Error incrementing usage:', error)
      return false
    }
  }

  getUpgradeMessage(action, limit, current) {
    const messages = {
      daily_limit_exceeded: `You've reached your daily limit of ${limit} ${action}s. Upgrade to Premium for unlimited access!`,
      monthly_limit_exceeded: `You've reached your monthly limit of ${limit} ${action}s. Upgrade to Premium for unlimited access!`,
      storage_limit_exceeded: `You've reached your storage limit of ${limit} tasks. Upgrade to Premium for unlimited storage!`,
      limited_feature: `This feature is limited to ${limit} steps for free users. Upgrade to Premium for unlimited walkthroughs!`
    }
    
    return messages[action] || 'Upgrade to Premium for unlimited access!'
  }

  getPricingPlans() {
    return {
      free: {
        name: 'Free',
        price: 0,
        features: [
          '10 tasks per day',
          '50 AI messages per day', 
          '5 calendar exports per month',
          '50 tasks storage',
          'Basic walkthroughs (5 steps max)',
          'Community support'
        ],
        limitations: [
          'Limited AI interactions',
          'Basic task management',
          'Standard support'
        ]
      },
      premium: {
        name: 'Premium',
        price: 9.99,
        period: 'month',
        features: [
          'Unlimited tasks',
          'Unlimited AI messages',
          'Unlimited calendar exports',
          'Unlimited storage',
          'Advanced walkthroughs',
          'Priority support',
          'Custom themes',
          'Advanced analytics',
          'Early access features',
          'API access'
        ],
        benefits: [
          'No daily limits',
          'Advanced AI models',
          'Priority customer support',
          'Custom branding',
          'Team collaboration'
        ]
      },
      pro: {
        name: 'Pro',
        price: 19.99,
        period: 'month',
        features: [
          'Everything in Premium',
          'Team collaboration',
          'Advanced analytics',
          'Custom integrations',
          'White-label options',
          'Dedicated support',
          'Custom AI training'
        ],
        benefits: [
          'Perfect for teams',
          'Advanced customization',
          'Enterprise features',
          'Custom AI models',
          'Dedicated account manager'
        ]
      }
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService()
