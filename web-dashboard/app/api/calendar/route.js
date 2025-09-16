// API endpoint for calendar integration
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/supabase/database'
import { ICSGenerator } from '@/lib/calendar/ics-generator'

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

    // Get all tasks with due dates
    const tasks = await db.getTasksByUserId(user.id)
    console.log('All tasks for user:', tasks.length)
    console.log('Sample task:', tasks[0])
    
    const tasksWithDueDates = tasks.filter(task => task.due_date && task.status !== 'completed')
    console.log('Tasks with due dates:', tasksWithDueDates.length)
    console.log('Sample task with due date:', tasksWithDueDates[0])

    // Generate ICS content
    const icsGenerator = new ICSGenerator()
    const icsContent = icsGenerator.generateICS(tasksWithDueDates, {
      username: user.username,
      email: user.email
    })
    
    console.log('Generated ICS content length:', icsContent.length)

    // Return ICS file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="lunchbox-tasks.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Error generating calendar:', error)
    return NextResponse.json(
      { error: 'Failed to generate calendar' },
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

    const { taskId, action } = await request.json()
    
    if (!taskId || !action) {
      return NextResponse.json({ error: 'Missing taskId or action' }, { status: 400 })
    }

    const user = await db.getUserByDiscordId(session.user.discordId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const task = await db.getTaskById(taskId)
    
    if (!task || task.user_id !== user.id) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Handle calendar actions
    switch (action) {
      case 'add_to_calendar':
        // Generate ICS for single task
        const icsGenerator = new ICSGenerator()
        const icsContent = icsGenerator.generateICS([task], {
          username: user.username,
          email: user.email
        })
        
        return new NextResponse(icsContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="task-${task.id}.ics"`,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        })

      case 'sync_calendar':
        // Update task with calendar sync info
        await db.updateTaskProgress(taskId, {
          calendar_synced: true,
          calendar_sync_date: new Date().toISOString()
        })
        
        return NextResponse.json({ 
          success: true, 
          message: 'Task synced to calendar' 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error handling calendar action:', error)
    return NextResponse.json(
      { error: 'Failed to handle calendar action' },
      { status: 500 }
    )
  }
}
