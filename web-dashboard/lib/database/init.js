// Database initialization for Lunchbox AI Web Dashboard
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Read the SQL schema file
const schemaPath = path.join(process.cwd(), 'lib', 'database', 'schema.sql')
const schemaSQL = fs.readFileSync(schemaPath, 'utf8')

export async function initializeDatabase() {
  try {
    console.log('🍱 Initializing Lunchbox AI database...')
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    // Execute each statement
    for (const statement of statements) {
      if (statement) {
        try {
          await prisma.$executeRawUnsafe(statement)
        } catch (error) {
          // Ignore errors for statements that might already exist
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate') &&
              !error.message.includes('already defined')) {
            console.warn(`Warning executing statement: ${error.message}`)
          }
        }
      }
    }
    
    console.log('✅ Database initialized successfully!')
    
    // Create default admin user if none exists
    await createDefaultAdmin()
    
    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

async function createDefaultAdmin() {
  try {
    const adminExists = await prisma.user.findFirst({
      where: { discord_id: 'admin' }
    })
    
    if (!adminExists) {
      await prisma.user.create({
        data: {
          id: 'admin-user-001',
          discord_id: 'admin',
          username: 'Lunchbox Admin',
          email: 'admin@lunchbox.ai',
          xp: 1000,
          level: 10,
          streak_count: 30,
          total_tasks_completed: 100,
          total_study_time: 5000,
          preferences: {
            theme: 'default',
            notifications: true,
            ai_personality: 'friendly'
          }
        }
      })
      console.log('👤 Default admin user created')
    }
  } catch (error) {
    console.warn('Could not create default admin user:', error.message)
  }
}

// Database utility functions
export class DatabaseService {
  // User management
  static async createUser(userData) {
    return await prisma.user.create({
      data: {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        discord_id: userData.discord_id,
        username: userData.username,
        discriminator: userData.discriminator,
        email: userData.email,
        avatar_url: userData.avatar_url,
        preferences: userData.preferences || {}
      }
    })
  }
  
  static async getUserByDiscordId(discordId) {
    return await prisma.user.findUnique({
      where: { discord_id: discordId }
    })
  }
  
  static async updateUserXP(userId, xpGained) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) return null
    
    const newXP = user.xp + xpGained
    const newLevel = Math.floor(newXP / 100) + 1
    
    return await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        level: newLevel,
        last_activity: new Date()
      }
    })
  }
  
  // Task management
  static async createTask(taskData) {
    return await prisma.task.create({
      data: {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: taskData.user_id,
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority || 1,
        due_date: taskData.due_date,
        estimated_duration: taskData.estimated_duration,
        ai_guidance: taskData.ai_guidance || {},
        completion_steps: taskData.completion_steps || [],
        tags: taskData.tags || []
      }
    })
  }
  
  static async getTasksByUserId(userId, status = null) {
    const where = { user_id: userId }
    if (status) where.status = status
    
    return await prisma.task.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { due_date: 'asc' },
        { created_at: 'desc' }
      ]
    })
  }
  
  static async updateTaskProgress(taskId, progressData) {
    return await prisma.task.update({
      where: { id: taskId },
      data: {
        ...progressData,
        updated_at: new Date()
      }
    })
  }
  
  static async completeTask(taskId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    })
    
    if (!task) return null
    
    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        progress_percentage: 100,
        completed_at: new Date()
      }
    })
    
    // Update user stats
    await prisma.user.update({
      where: { id: task.user_id },
      data: {
        total_tasks_completed: { increment: 1 },
        last_task_date: new Date()
      }
    })
    
    return updatedTask
  }
  
  // Reminder management
  static async createReminder(reminderData) {
    return await prisma.reminder.create({
      data: {
        id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: reminderData.user_id,
        task_id: reminderData.task_id,
        message: reminderData.message,
        reminder_time: reminderData.reminder_time,
        repeat_interval: reminderData.repeat_interval || 0,
        repeat_count: reminderData.repeat_count || 0,
        reminder_type: reminderData.reminder_type || 'task',
        platform: reminderData.platform || 'all'
      }
    })
  }
  
  static async getPendingReminders() {
    return await prisma.reminder.findMany({
      where: {
        sent: false,
        reminder_time: { lte: new Date() }
      },
      include: {
        user: true,
        task: true
      }
    })
  }
  
  static async markReminderSent(reminderId) {
    return await prisma.reminder.update({
      where: { id: reminderId },
      data: { sent: true }
    })
  }
  
  // Study sessions
  static async createStudySession(sessionData) {
    return await prisma.study_session.create({
      data: {
        id: `study-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: sessionData.user_id,
        subject: sessionData.subject,
        topic: sessionData.topic,
        duration: sessionData.duration,
        difficulty_level: sessionData.difficulty_level || 1,
        ai_guidance_used: sessionData.ai_guidance_used || false,
        resources_accessed: sessionData.resources_accessed || [],
        notes: sessionData.notes
      }
    })
  }
  
  static async completeStudySession(sessionId) {
    const session = await prisma.study_session.findUnique({
      where: { id: sessionId }
    })
    
    if (!session) return null
    
    const updatedSession = await prisma.study_session.update({
      where: { id: sessionId },
      data: {
        completed: true,
        completed_at: new Date()
      }
    })
    
    // Update user study time
    await prisma.user.update({
      where: { id: session.user_id },
      data: {
        total_study_time: { increment: session.duration }
      }
    })
    
    return updatedSession
  }
  
  // Chat messages
  static async saveChatMessage(messageData) {
    return await prisma.chat_message.create({
      data: {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: messageData.user_id,
        platform: messageData.platform,
        message_type: messageData.message_type,
        content: messageData.content,
        context: messageData.context || {},
        tokens_used: messageData.tokens_used || 0,
        response_time: messageData.response_time
      }
    })
  }
  
  static async getChatHistory(userId, limit = 50) {
    return await prisma.chat_message.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
      take: limit
    })
  }
  
  // Analytics
  static async trackEvent(eventData) {
    return await prisma.user_analytics.create({
      data: {
        id: `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: eventData.user_id,
        event_type: eventData.event_type,
        event_data: eventData.event_data || {},
        platform: eventData.platform,
        session_id: eventData.session_id
      }
    })
  }
  
  // Discord servers
  static async createDiscordServer(serverData) {
    return await prisma.discord_server.create({
      data: {
        id: `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        discord_guild_id: serverData.discord_guild_id,
        name: serverData.name,
        owner_id: serverData.owner_id,
        member_count: serverData.member_count || 0,
        settings: serverData.settings || {},
        features_enabled: serverData.features_enabled || {}
      }
    })
  }
  
  static async getDiscordServerByGuildId(guildId) {
    return await prisma.discord_server.findUnique({
      where: { discord_guild_id: guildId }
    })
  }
}

export default prisma
