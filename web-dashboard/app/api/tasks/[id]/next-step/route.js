// API endpoint for getting the next step in a task
import { taskPlanner } from '@/lib/ai/task-planner'
import { db } from '@/lib/supabase/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request, { params }) {
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

    // Get next step
    const nextStep = await taskPlanner.getNextStep(taskId, user.id)

    return Response.json({
      success: true,
      ...nextStep
    })

  } catch (error) {
    console.error('Error getting next step:', error)
    return Response.json(
      { error: 'Failed to get next step' },
      { status: 500 }
    )
  }
}
