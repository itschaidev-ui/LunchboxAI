// API endpoint for completing a step in a task
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

    const { id: taskId } = params

    // Get user from database
    const user = await db.getUserByDiscordId(session.user.discordId)
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Complete step
    const result = await taskPlanner.completeStep(taskId, user.id)

    // Track analytics
    await db.trackEvent({
      user_id: user.id,
      event_type: 'step_completed',
      event_data: {
        task_id: taskId,
        step_number: result.task.current_step,
        xp_gained: result.xpGained,
        completed: result.completed
      },
      platform: 'web'
    })

    // Generate motivation message
    const motivation = await taskPlanner.generateMotivation(taskId, user.id)

    return Response.json({
      success: true,
      task: result.task,
      xpGained: result.xpGained,
      completed: result.completed,
      motivation: motivation,
      message: result.completed 
        ? `🎉 Congratulations! You completed "${result.task.title}" and earned ${result.xpGained} XP!`
        : `✨ Great job! You earned ${result.xpGained} XP for completing that step!`
    })

  } catch (error) {
    console.error('Error completing step:', error)
    return Response.json(
      { error: 'Failed to complete step' },
      { status: 500 }
    )
  }
}
