// Supabase database service for Lunchbox AI
import { supabase, createServerClient } from './client.js'

export class SupabaseService {
  constructor(useServerClient = false) {
    // For now, always use the regular client since service role key is not configured
    this.client = supabase
  }

  // User management
  async createUser(userData) {
    const { data, error } = await this.client
      .from('users')
      .insert({
        discord_id: userData.discord_id,
        username: userData.username,
        discriminator: userData.discriminator,
        email: userData.email,
        avatar_url: userData.avatar_url,
        preferences: userData.preferences || {}
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserByDiscordId(discordId) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('discord_id', discordId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updateUserXP(userId, xpGained) {
    // First get current user data
    const { data: user, error: fetchError } = await this.client
      .from('users')
      .select('xp')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    const newXP = user.xp + xpGained
    const newLevel = Math.floor(newXP / 100) + 1

    const { data, error } = await this.client
      .from('users')
      .update({
        xp: newXP,
        level: newLevel,
        last_activity: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserStats(userId) {
    const { data, error } = await this.client
      .from('users')
      .select('xp, level, streak_count, total_tasks_completed, total_study_time')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  async updateUserStats(userId, statsData) {
    const { data, error } = await this.client
      .from('users')
      .update({
        ...statsData,
        last_activity: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getOverdueTasks(userId) {
    const now = new Date().toISOString()
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .lt('due_date', now)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  async getUpcomingTasks(userId, hoursAhead = 24) {
    const now = new Date()
    const futureTime = new Date(now.getTime() + (hoursAhead * 60 * 60 * 1000))
    
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('due_date', now.toISOString())
      .lte('due_date', futureTime.toISOString())
      .order('due_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Task management
  async createTask(taskData) {
    const { data, error } = await this.client
      .from('tasks')
      .insert({
        user_id: taskData.user_id,
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority || 1,
        due_date: taskData.due_date,
        estimated_duration: taskData.estimated_duration,
        ai_guidance: taskData.ai_guidance || {},
        completion_steps: taskData.completion_steps || []
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getTasksByUserId(userId, status = null) {
    let query = this.client
      .from('tasks')
      .select('*')
      .eq('user_id', userId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getTaskById(taskId) {
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (error) throw error
    return data
  }

  async updateTaskProgress(taskId, progressData) {
    const { data, error } = await this.client
      .from('tasks')
      .update({
        ...progressData,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async completeTask(taskId) {
    // Update task
    const { data: task, error: taskError } = await this.client
      .from('tasks')
      .update({
        status: 'completed',
        progress_percentage: 100,
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single()

    if (taskError) throw taskError

    // Update user stats
    const { error: userError } = await this.client
      .from('users')
      .update({
        total_tasks_completed: this.client.rpc('increment', { 
          table_name: 'users', 
          column_name: 'total_tasks_completed',
          id: task.user_id 
        }),
        last_task_date: new Date().toISOString()
      })
      .eq('id', task.user_id)

    if (userError) throw userError
    return task
  }

  // Reminder management
  async createReminder(reminderData) {
    const { data, error } = await this.client
      .from('reminders')
      .insert({
        user_id: reminderData.user_id,
        task_id: reminderData.task_id,
        message: reminderData.message,
        reminder_time: reminderData.reminder_time,
        repeat_interval: reminderData.repeat_interval || 0,
        repeat_count: reminderData.repeat_count || 0,
        reminder_type: reminderData.reminder_type || 'task',
        platform: reminderData.platform || 'all'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getPendingReminders() {
    const { data, error } = await this.client
      .from('reminders')
      .select(`
        *,
        users:user_id (*),
        tasks:task_id (*)
      `)
      .eq('sent', false)
      .lte('reminder_time', new Date().toISOString())

    if (error) throw error
    return data
  }

  async markReminderSent(reminderId) {
    const { data, error } = await this.client
      .from('reminders')
      .update({ sent: true })
      .eq('id', reminderId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Study sessions
  async createStudySession(sessionData) {
    const { data, error } = await this.client
      .from('study_sessions')
      .insert({
        user_id: sessionData.user_id,
        subject: sessionData.subject,
        topic: sessionData.topic,
        duration: sessionData.duration,
        difficulty_level: sessionData.difficulty_level || 1,
        ai_guidance_used: sessionData.ai_guidance_used || false,
        resources_accessed: sessionData.resources_accessed || [],
        notes: sessionData.notes
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async completeStudySession(sessionId) {
    // Get session first
    const { data: session, error: fetchError } = await this.client
      .from('study_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError) throw fetchError

    // Update session
    const { data: updatedSession, error: sessionError } = await this.client
      .from('study_sessions')
      .update({
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (sessionError) throw sessionError

    // Update user study time
    const { error: userError } = await this.client
      .from('users')
      .update({
        total_study_time: this.client.rpc('increment', {
          table_name: 'users',
          column_name: 'total_study_time',
          id: session.user_id,
          amount: session.duration
        })
      })
      .eq('id', session.user_id)

    if (userError) throw userError
    return updatedSession
  }

  // Chat messages
  async saveChatMessage(messageData) {
    const { data, error } = await this.client
      .from('chat_messages')
      .insert({
        user_id: messageData.user_id,
        platform: messageData.platform,
        message_type: messageData.message_type,
        content: messageData.content,
        context: messageData.context || {},
        tokens_used: messageData.tokens_used || 0,
        response_time: messageData.response_time
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getChatHistory(userId, limit = 50) {
    const { data, error } = await this.client
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  // Analytics
  async trackEvent(eventData) {
    const { data, error } = await this.client
      .from('user_analytics')
      .insert({
        user_id: eventData.user_id,
        event_type: eventData.event_type,
        event_data: eventData.event_data || {},
        platform: eventData.platform || 'web',
        session_id: eventData.session_id || null
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Discord servers
  async createDiscordServer(serverData) {
    const { data, error } = await this.client
      .from('discord_servers')
      .insert({
        discord_guild_id: serverData.discord_guild_id,
        name: serverData.name,
        owner_id: serverData.owner_id,
        member_count: serverData.member_count || 0,
        settings: serverData.settings || {},
        features_enabled: serverData.features_enabled || {}
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getDiscordServerByGuildId(guildId) {
    const { data, error } = await this.client
      .from('discord_servers')
      .select('*')
      .eq('discord_guild_id', guildId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Real-time subscriptions
  subscribeToUserTasks(userId, callback) {
    return this.client
      .channel('user-tasks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }

  subscribeToUserReminders(userId, callback) {
    return this.client
      .channel('user-reminders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reminders',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }

  subscribeToChatMessages(userId, callback) {
    return this.client
      .channel('user-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }

  // Utility functions
  async getUserLeaderboard(limit = 10) {
    const { data, error } = await this.client
      .from('users')
      .select('id, username, xp, level, total_tasks_completed')
      .order('xp', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  async getUserAchievements(userId) {
    const { data, error } = await this.client
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    if (error) throw error
    return data
  }

  async createAchievement(achievementData) {
    const { data, error } = await this.client
      .from('achievements')
      .insert({
        user_id: achievementData.user_id,
        achievement_type: achievementData.achievement_type,
        achievement_name: achievementData.achievement_name,
        description: achievementData.description,
        xp_reward: achievementData.xp_reward || 0,
        badge_icon: achievementData.badge_icon
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Export singleton instance
export const db = new SupabaseService()
export const serverDb = new SupabaseService(true)

export default db
