// API endpoint for fetching user stats
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

    // Return user stats
    return Response.json({
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak_count || 0,
      total_tasks_completed: user.total_tasks_completed || 0
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return Response.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
