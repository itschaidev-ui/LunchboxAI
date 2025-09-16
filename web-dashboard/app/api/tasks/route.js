// API endpoint for fetching user tasks
import { db } from '@/lib/supabase/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await db.getUserByDiscordId(session.user.discordId)
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's pending tasks
    const tasks = await db.getTasksByUserId(user.id, 'pending')

    return Response.json(tasks)

  } catch (error) {
    console.error('Error fetching user tasks:', error)
    return Response.json(
      { error: 'Failed to fetch user tasks' },
      { status: 500 }
    )
  }
}
