// API endpoint for deleting tasks
import { db } from '@/lib/supabase/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get user from database
    const user = await db.getUserByDiscordId(session.user.discordId)
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get task from database to verify ownership
    const task = await db.getTaskById(id)
    
    if (!task || task.user_id !== user.id) {
      return Response.json({ error: 'Task not found' }, { status: 404 })
    }

    // Delete the task
    const { error } = await db.client
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return Response.json({ success: true, message: 'Task deleted successfully' })

  } catch (error) {
    console.error('Error deleting task:', error)
    return Response.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
