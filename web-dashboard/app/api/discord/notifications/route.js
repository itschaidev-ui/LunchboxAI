// API endpoint for Discord notifications
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/supabase/database'
import { discordNotifications } from '@/lib/discord/notifications'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, taskId } = await request.json()
    
    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    const user = await db.getUserByDiscordId(session.user.discordId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    switch (action) {
      case 'overdue_completed':
        // Send notification for overdue task completion
        const overdueTask = body.task
        const overdueSuccess = await discordNotifications.sendTaskCompletedNotification(
          overdueTask.user_id,
          overdueTask.title,
          true // isOverdue
        )
        
        return NextResponse.json({ 
          success: overdueSuccess,
          message: overdueSuccess ? 'Overdue task completion notification sent!' : 'Failed to send notification'
        })

      case 'test_notification':
        // Send a test notification to verify Discord integration
        const testTask = {
          title: 'Test Task',
          description: 'This is a test notification from Lunchbox AI',
          due_date: new Date().toISOString(),
          priority: 3,
          category: 'Test'
        }
        
        const success = await discordNotifications.sendReminderNotification(
          user.discord_id,
          testTask,
          'upcoming'
        )
        
        return NextResponse.json({ 
          success,
          message: success ? 'Test notification sent!' : 'Failed to send notification'
        })

      case 'enable_notifications':
        // Enable Discord notifications for user
        await db.updateUserStats(user.id, {
          discord_notifications_enabled: true
        })
        
        return NextResponse.json({ 
          success: true,
          message: 'Discord notifications enabled!'
        })

      case 'disable_notifications':
        // Disable Discord notifications for user
        await db.updateUserStats(user.id, {
          discord_notifications_enabled: false
        })
        
        return NextResponse.json({ 
          success: true,
          message: 'Discord notifications disabled!'
        })

      case 'check_overdue':
        // Check for overdue tasks and send notifications
        const overdueTasks = await db.getOverdueTasks(user.id)
        
        if (overdueTasks.length > 0) {
          for (const task of overdueTasks) {
            await discordNotifications.sendOverdueNotification(user.discord_id, task)
          }
          
          return NextResponse.json({ 
            success: true,
            message: `Sent ${overdueTasks.length} overdue notifications`
          })
        } else {
          return NextResponse.json({ 
            success: true,
            message: 'No overdue tasks found'
          })
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error handling Discord notification:', error)
    return NextResponse.json(
      { error: 'Failed to handle Discord notification' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.getUserByDiscordId(session.user.discordId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return notification settings
    return NextResponse.json({
      discord_notifications_enabled: user.discord_notifications_enabled || false,
      discord_id: user.discord_id,
      has_discord_connection: !!user.discord_id
    })

  } catch (error) {
    console.error('Error fetching Discord settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Discord settings' },
      { status: 500 }
    )
  }
}
