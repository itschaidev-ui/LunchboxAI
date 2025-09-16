// API endpoint for completing tasks with AI guidance
import { taskPlanner } from '@/lib/ai/task-planner'
import { db } from '@/lib/supabase/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { forceComplete } = await request.json()

    // Get user from database
    const user = await db.getUserByDiscordId(session.user.discordId)
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get task from database
    const task = await db.getTaskById(id)
    
    if (!task || task.user_id !== user.id) {
      return Response.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if task is overdue
    const now = new Date()
    const dueDate = task.due_date ? new Date(task.due_date) : null
    const isOverdue = dueDate && now > dueDate
    const isEarly = dueDate && now < new Date(dueDate.getTime() - 24 * 60 * 60 * 1000) // 24 hours early

    // If task is early and user hasn't forced completion, warn them
    if (isEarly && !forceComplete) {
      return Response.json({
        warning: true,
        message: `This task isn't due until ${dueDate.toLocaleDateString()}. Are you sure you want to complete it now?`,
        task: task,
        isEarly: true
      })
    }

    // If task is overdue, send Discord DM
    if (isOverdue) {
      try {
        // Send Discord notification for overdue task completion
        const discordResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/discord/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'overdue_completed',
            task: {
              title: task.title,
              due_date: task.due_date,
              user_id: user.discord_id
            }
          })
        })
        
        if (discordResponse.ok) {
          console.log(`Discord notification sent for overdue task completion: ${task.title}`)
        }
      } catch (error) {
        console.error('Failed to send Discord notification for overdue task:', error)
      }
    }

    // Complete the task with AI guidance
    const completionResult = await taskPlanner.completeTask(task.id, user.id)

    // Update user XP and streak
    const xpGained = Math.max(10, Math.floor(task.estimated_duration / 10)) // XP based on task duration
    
    console.log(`Updating XP for user ${user.id}: +${xpGained} XP`)
    console.log(`Current user XP: ${user.xp}`)
    
    // Update XP using the proper function that handles level calculation
    const updatedUser = await db.updateUserXP(user.id, xpGained)
    console.log(`Updated user XP: ${updatedUser.xp}, Level: ${updatedUser.level}`)
    
    // Update other stats
    await db.updateUserStats(user.id, {
      total_tasks_completed: (user.total_tasks_completed || 0) + 1,
      streak_count: (user.streak_count || 0) + 1
    })

    // Track analytics (temporarily disabled due to database schema issue)
    // await db.trackEvent({
    //   user_id: user.id,
    //   event_type: 'task_completed',
    //   event_data: {
    //     task_title: task.title,
    //     category: task.category,
    //     xp_gained: xpGained,
    //     was_overdue: isOverdue,
    //     was_early: isEarly
    //   },
    //   platform: 'web'
    // })

    return Response.json({
      success: true,
      message: completionResult.message,
      xpGained: xpGained,
      task: completionResult.task,
      isOverdue: isOverdue,
      isEarly: isEarly
    })

  } catch (error) {
    console.error('Error completing task:', error)
    return Response.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    )
  }
}
