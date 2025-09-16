// API endpoint for creating AI-powered tasks
import { taskPlanner } from '@/lib/ai/task-planner'
import { db } from '@/lib/supabase/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskInput, userContext } = await request.json()

    if (!taskInput) {
      return Response.json({ error: 'Task input is required' }, { status: 400 })
    }

    // Get user from database, create if doesn't exist
    let user = await db.getUserByDiscordId(session.user.discordId)
    
    if (!user) {
      // Create user if they don't exist
      try {
        user = await db.createUser({
          discord_id: session.user.discordId,
          username: session.user.name,
          discriminator: session.user.discriminator || '0000',
          email: session.user.email,
          avatar_url: session.user.image
        })
        console.log('Created new user:', user)
      } catch (error) {
        console.error('Error creating user:', error)
        return Response.json({ error: 'Failed to create user account' }, { status: 500 })
      }
    }

    // Get user context for better AI planning
    const context = {
      level: user.level,
      xp: user.xp,
      streak: user.streak_count,
      preferences: user.preferences,
      ...userContext
    }

    // Create AI-powered task plan
    const taskPlan = await taskPlanner.createTaskPlan(taskInput, user.id, context)

    // Set automatic reminder if task has a due date
    if (taskPlan.due_date) {
      try {
        const reminderTime = new Date(taskPlan.due_date)
        reminderTime.setHours(reminderTime.getHours() - 1) // 1 hour before due date
        
        await db.createReminder({
          user_id: user.id,
          task_id: taskPlan.id,
          message: `Reminder: "${taskPlan.title}" is due in 1 hour!`,
          reminder_time: reminderTime.toISOString(),
          reminder_type: 'task',
          platform: 'all'
        })
        console.log('Reminder created successfully')
      } catch (reminderError) {
        console.error('Error creating reminder (non-critical):', reminderError)
        // Don't fail the entire task creation if reminder fails
      }
    }

    // Track analytics (temporarily disabled due to database schema issue)
    // await db.trackEvent({
    //   user_id: user.id,
    //   event_type: 'task_created',
    //   event_data: {
    //     task_title: taskPlan.title,
    //     category: taskPlan.category,
    //     estimated_duration: taskPlan.estimated_duration,
    //     steps_count: taskPlan.completion_steps.length
    //   },
    //   platform: 'web'
    // })

    return Response.json({
      success: true,
      task: taskPlan,
      message: `🍱 Great! I've created a step-by-step plan for "${taskPlan.title}". Let's get started!`
    })

  } catch (error) {
    console.error('Error creating task:', error)
    return Response.json(
      { error: 'Failed to create task plan' },
      { status: 500 }
    )
  }
}
