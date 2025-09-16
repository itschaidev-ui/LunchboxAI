// API endpoint for subscription management
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/supabase/database'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    const user = await db.getUserByDiscordId(session.user.discordId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    switch (action) {
      case 'status':
        // Return subscription status
        return NextResponse.json({
          isPremium: user.subscription_plan === 'premium' || user.subscription_plan === 'pro',
          plan: user.subscription_plan || 'free',
          expiresAt: user.subscription_expires_at,
          features: getFeaturesForPlan(user.subscription_plan || 'free')
        })

      case 'usage':
        // Return current usage stats
        const usage = await getUserUsageStats(user.id)
        return NextResponse.json(usage)

      case 'plans':
        // Return available pricing plans
        return NextResponse.json(getPricingPlans())

      case 'limits':
        // Return current limits for user's plan
        const limits = getLimitsForPlan(user.subscription_plan || 'free')
        return NextResponse.json(limits)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error handling subscription request:', error)
    return NextResponse.json(
      { error: 'Failed to handle subscription request' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, plan, paymentMethod } = await request.json()
    
    const user = await db.getUserByDiscordId(session.user.discordId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    switch (action) {
      case 'upgrade':
        // Handle subscription upgrade
        if (!plan) {
          return NextResponse.json({ error: 'Plan required' }, { status: 400 })
        }

        // In a real implementation, this would integrate with Stripe/PayPal
        // For now, we'll simulate the upgrade
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1) // 1 month from now

        await db.updateUserStats(user.id, {
          subscription_plan: plan,
          subscription_expires_at: expiresAt.toISOString(),
          subscription_status: 'active'
        })

        return NextResponse.json({ 
          success: true, 
          message: `Successfully upgraded to ${plan} plan!`,
          expiresAt: expiresAt.toISOString()
        })

      case 'cancel':
        // Handle subscription cancellation
        await db.updateUserStats(user.id, {
          subscription_status: 'cancelled',
          subscription_expires_at: user.subscription_expires_at // Keep current expiry
        })

        return NextResponse.json({ 
          success: true, 
          message: 'Subscription cancelled. You can continue using premium features until expiry.'
        })

      case 'increment_usage':
        // Increment usage counter
        const { usageType } = await request.json()
        await incrementUsageCounter(user.id, usageType)
        
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error handling subscription action:', error)
    return NextResponse.json(
      { error: 'Failed to handle subscription action' },
      { status: 500 }
    )
  }
}

// Helper functions
function getFeaturesForPlan(plan) {
  const features = {
    free: [
      '10 tasks per day',
      '50 AI messages per day',
      '5 calendar exports per month',
      '50 tasks storage',
      'Basic walkthroughs (5 steps max)',
      'Community support'
    ],
    premium: [
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
    pro: [
      'Everything in Premium',
      'Team collaboration',
      'Advanced analytics',
      'Custom integrations',
      'White-label options',
      'Dedicated support',
      'Custom AI training'
    ]
  }
  
  return features[plan] || features.free
}

function getLimitsForPlan(plan) {
  const limits = {
    free: {
      tasksPerDay: 10,
      aiMessagesPerDay: 50,
      calendarExportsPerMonth: 5,
      maxTasksStored: 50,
      maxWalkthroughSteps: 5
    },
    premium: {
      tasksPerDay: -1, // unlimited
      aiMessagesPerDay: -1,
      calendarExportsPerMonth: -1,
      maxTasksStored: -1,
      maxWalkthroughSteps: -1
    },
    pro: {
      tasksPerDay: -1,
      aiMessagesPerDay: -1,
      calendarExportsPerMonth: -1,
      maxTasksStored: -1,
      maxWalkthroughSteps: -1
    }
  }
  
  return limits[plan] || limits.free
}

function getPricingPlans() {
  return {
    free: {
      name: 'Free',
      price: 0,
      features: getFeaturesForPlan('free'),
      popular: false
    },
    premium: {
      name: 'Premium',
      price: 9.99,
      period: 'month',
      features: getFeaturesForPlan('premium'),
      popular: true
    },
    pro: {
      name: 'Pro',
      price: 19.99,
      period: 'month',
      features: getFeaturesForPlan('pro'),
      popular: false
    }
  }
}

async function getUserUsageStats(userId) {
  try {
    // Get usage stats from database
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().substring(0, 7)
    
    // In a real implementation, you'd query usage tables
    // For now, return mock data
    return {
      tasksToday: 0,
      aiMessagesToday: 0,
      calendarExportsThisMonth: 0,
      totalTasks: 0,
      lastReset: today
    }
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return {
      tasksToday: 0,
      aiMessagesToday: 0,
      calendarExportsThisMonth: 0,
      totalTasks: 0
    }
  }
}

async function incrementUsageCounter(userId, usageType) {
  try {
    // In a real implementation, you'd increment counters in database
    console.log(`Incrementing ${usageType} usage for user ${userId}`)
    return true
  } catch (error) {
    console.error('Error incrementing usage counter:', error)
    return false
  }
}
