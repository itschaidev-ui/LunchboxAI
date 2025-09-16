// AI-powered task planning system for Lunchbox AI
import Groq from 'groq-sdk'
import { db } from '../supabase/database'

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export class TaskPlanner {
  constructor() {
    this.systemPrompt = `You are Lunchbox AI, a friendly and encouraging AI assistant designed for teens and young creators. Your specialty is helping users break down complex tasks into manageable, step-by-step plans.

Your personality:
- Warm, supportive, and encouraging
- Uses food/lunchbox metaphors when appropriate
- Speaks like a helpful friend, not a corporate assistant
- Keeps responses concise but helpful
- Uses emojis naturally (🍱, 📚, ✨, etc.)
- Focuses on productivity, studying, and creative work

When helping with task planning:
1. Break down complex tasks into 3-7 manageable steps
2. Estimate realistic time for each step
3. Suggest helpful resources or tips
4. Encourage and motivate the user
5. Use the lunchbox categories: Sweet (fun/creative), Veggies (learning/study), Savory (important/urgent), Sides (quick/misc)

Always provide actionable, specific steps that the user can follow immediately.`
  }

  async createTaskPlan(userInput, userId, userContext = {}) {
    try {
      console.log('Creating task plan for:', userInput)
      console.log('User ID:', userId)
      console.log('User context:', userContext)
      
      const contextPrompt = this.buildContextPrompt(userContext)
      
      console.log('Calling Groq API...')
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: this.systemPrompt + contextPrompt },
          { role: "user", content: `Help me create a task plan for: "${userInput}". Break it down into manageable steps with time estimates and helpful tips.` }
        ],
        max_tokens: 500,
        temperature: 0.7,
      })

      console.log('Groq API response received')
      const response = completion.choices[0].message.content
      console.log('AI response:', response)
      
      const taskPlan = this.parseTaskPlan(response, userInput)
      console.log('Parsed task plan:', taskPlan)
      
      // Save the AI guidance to database
      console.log('Saving task plan to database...')
      const savedTask = await this.saveTaskPlan(userId, taskPlan)
      console.log('Task saved successfully:', savedTask)
      
      return savedTask
    } catch (error) {
      console.error('Error creating task plan:', error)
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
      throw new Error(`Failed to create task plan: ${error.message}`)
    }
  }

  buildContextPrompt(userContext) {
    let context = `\n\nUser Context:`
    
    if (userContext.level) {
      context += `\n- User Level: ${userContext.level}`
    }
    if (userContext.xp) {
      context += `\n- XP: ${userContext.xp}`
    }
    if (userContext.streak) {
      context += `\n- Streak: ${userContext.streak} days`
    }
    if (userContext.recentTasks && userContext.recentTasks.length > 0) {
      context += `\n- Recent tasks: ${userContext.recentTasks.slice(0, 3).map(t => t.title).join(', ')}`
    }
    if (userContext.preferences) {
      context += `\n- Preferences: ${JSON.stringify(userContext.preferences)}`
    }
    
    return context
  }

  parseTaskPlan(response, originalInput) {
    // Extract task information from AI response
    const lines = response.split('\n').filter(line => line.trim())
    
    // Determine category based on content
    const category = this.categorizeTask(originalInput, response)
    
    // Extract steps from the response
    const steps = this.extractSteps(response)
    
    // Extract time estimates
    const timeEstimates = this.extractTimeEstimates(response)
    
    // Extract tips and resources
    const tips = this.extractTips(response)
    
    // Parse due date from input
    const { iso: dueDate, isAllDay } = this.parseDueDate(originalInput)
    
    return {
      title: this.extractTitle(originalInput),
      description: response,
      category: category,
      priority: this.determinePriority(originalInput),
      estimated_duration: this.calculateTotalDuration(timeEstimates),
      due_date: dueDate,
      ai_guidance: {
        steps: steps,
        time_estimates: timeEstimates,
        tips: tips,
        due_is_all_day: isAllDay,
        original_response: response
      },
      completion_steps: steps.map((step, index) => ({
        step_number: index + 1,
        description: step,
        estimated_time: timeEstimates[index] || 15,
        completed: false
      }))
    }
  }

  categorizeTask(input, response) {
    const text = (input + ' ' + response).toLowerCase()
    
    if (text.includes('study') || text.includes('learn') || text.includes('homework') || 
        text.includes('math') || text.includes('science') || text.includes('essay')) {
      return 'Veggies' // Learning/Study
    }
    
    if (text.includes('urgent') || text.includes('important') || text.includes('deadline') ||
        text.includes('due') || text.includes('asap')) {
      return 'Savory' // Important/Urgent
    }
    
    if (text.includes('creative') || text.includes('art') || text.includes('design') ||
        text.includes('fun') || text.includes('project') || text.includes('build')) {
      return 'Sweet' // Fun/Creative
    }
    
    return 'Sides' // Quick/Misc
  }

  extractSteps(response) {
    const stepPatterns = [
      /(\d+\.\s*[^\n]+)/g,
      /(Step \d+[:\-]\s*[^\n]+)/gi,
      /(•\s*[^\n]+)/g,
      /(-\s*[^\n]+)/g
    ]
    
    let steps = []
    
    for (const pattern of stepPatterns) {
      const matches = response.match(pattern)
      if (matches && matches.length > 0) {
        steps = matches.map(match => 
          match.replace(/^\d+\.\s*/, '')
              .replace(/^Step \d+[:\-]\s*/i, '')
              .replace(/^[•\-]\s*/, '')
              .trim()
        )
        break
      }
    }
    
    // If no structured steps found, try to extract from paragraphs
    if (steps.length === 0) {
      const paragraphs = response.split('\n\n').filter(p => p.trim().length > 20)
      steps = paragraphs.slice(0, 5).map(p => p.trim())
    }
    
    return steps.slice(0, 7) // Limit to 7 steps max
  }

  extractTimeEstimates(response) {
    const timePatterns = [
      /(\d+)\s*(?:minutes?|mins?|min)/gi,
      /(\d+)\s*(?:hours?|hrs?|h)/gi,
      /(\d+)\s*(?:days?|d)/gi
    ]
    
    const estimates = []
    
    for (const pattern of timePatterns) {
      const matches = response.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const time = parseInt(match.match(/\d+/)[0])
          const unit = match.toLowerCase()
          
          let minutes = time
          if (unit.includes('hour') || unit.includes('hr') || unit.includes('h')) {
            minutes = time * 60
          } else if (unit.includes('day') || unit.includes('d')) {
            minutes = time * 24 * 60
          }
          
          estimates.push(minutes)
        })
      }
    }
    
    return estimates
  }

  extractTips(response) {
    const tipPatterns = [
      /(💡[^\n]+)/g,
      /(Tip[:\-]\s*[^\n]+)/gi,
      /(💭[^\n]+)/g,
      /(Remember[:\-]\s*[^\n]+)/gi
    ]
    
    const tips = []
    
    for (const pattern of tipPatterns) {
      const matches = response.match(pattern)
      if (matches) {
        tips.push(...matches.map(tip => tip.trim()))
      }
    }
    
    return tips.slice(0, 5) // Limit to 5 tips
  }

  extractTitle(input) {
    // Clean up the input to create a proper title
    return input
      .replace(/^(help me|i need to|i want to|can you help me with|please help me with)/i, '')
      .replace(/[.!?]+$/, '')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  determinePriority(input) {
    const text = input.toLowerCase()
    
    if (text.includes('urgent') || text.includes('asap') || text.includes('deadline')) {
      return 5 // Highest priority
    }
    
    if (text.includes('important') || text.includes('due')) {
      return 4
    }
    
    if (text.includes('soon') || text.includes('this week')) {
      return 3
    }
    
    if (text.includes('when i have time') || text.includes('eventually')) {
      return 2
    }
    
    return 1 // Default priority
  }

  calculateTotalDuration(timeEstimates) {
    if (timeEstimates.length === 0) return 60 // Default 1 hour
    
    const total = timeEstimates.reduce((sum, time) => sum + time, 0)
    return Math.max(total, 15) // Minimum 15 minutes
  }

  parseDueDate(input) {
    const text = input.toLowerCase()
    const now = new Date()
    const make = (d, allDay = false) => ({ iso: d.toISOString(), isAllDay: allDay })

    // Try to extract an explicit time if present (e.g., "6 pm", "6pm", "18:30", "at 7:15am")
    const extractTime = (t) => {
      // 12-hour clock with optional minutes
      let m = t.match(/(?:\bat\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/)
      if (m) {
        let hours = parseInt(m[1], 10)
        const minutes = m[2] ? parseInt(m[2], 10) : 0
        const meridiem = m[3].toLowerCase()
        if (hours === 12) hours = 0
        if (meridiem === 'pm') hours += 12
        return { hours, minutes }
      }
      // 24-hour clock HH:MM
      m = t.match(/\b(\d{1,2}):(\d{2})\b/)
      if (m) {
        const hours = Math.min(23, parseInt(m[1], 10))
        const minutes = Math.min(59, parseInt(m[2], 10))
        return { hours, minutes }
      }
      return null
    }
    const explicitTime = extractTime(text)
    
    // Tomorrow
    if (text.includes('tomorrow')) {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setSeconds(0, 0)
      if (explicitTime) {
        tomorrow.setHours(explicitTime.hours, explicitTime.minutes, 0, 0)
        return make(tomorrow, false)
      }
      // No explicit time -> all-day
      tomorrow.setHours(0, 0, 0, 0)
      return make(tomorrow, true)
    }
    
    // Next week
    if (text.includes('next week')) {
      const nextWeek = new Date(now)
      nextWeek.setDate(nextWeek.getDate() + 7)
      nextWeek.setSeconds(0, 0)
      if (explicitTime) {
        nextWeek.setHours(explicitTime.hours, explicitTime.minutes, 0, 0)
        return make(nextWeek, false)
      }
      nextWeek.setHours(0, 0, 0, 0)
      return make(nextWeek, true)
    }
    
    // This week
    if (text.includes('this week')) {
      const thisWeek = new Date(now)
      thisWeek.setDate(thisWeek.getDate() + 3)
      thisWeek.setSeconds(0, 0)
      if (explicitTime) {
        thisWeek.setHours(explicitTime.hours, explicitTime.minutes, 0, 0)
        return make(thisWeek, false)
      }
      thisWeek.setHours(0, 0, 0, 0)
      return make(thisWeek, true)
    }
    
    // In X days
    const daysMatch = text.match(/in (\d+) days?/)
    if (daysMatch) {
      const days = parseInt(daysMatch[1])
      const futureDate = new Date(now)
      futureDate.setDate(futureDate.getDate() + days)
      futureDate.setSeconds(0, 0)
      if (explicitTime) {
        futureDate.setHours(explicitTime.hours, explicitTime.minutes, 0, 0)
        return make(futureDate, false)
      }
      futureDate.setHours(0, 0, 0, 0)
      return make(futureDate, true)
    }
    
    // In X hours
    const hoursMatch = text.match(/in (\d+) hours?/)
    if (hoursMatch) {
      const hours = parseInt(hoursMatch[1])
      const futureDate = new Date(now)
      futureDate.setHours(futureDate.getHours() + hours)
      return make(futureDate, false)
    }
    
    // Next Monday, Tuesday, etc.
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    for (let i = 0; i < dayNames.length; i++) {
      if (text.includes(`next ${dayNames[i]}`)) {
        const targetDay = i === 0 ? 7 : i // Monday is 1, Sunday is 0
        const currentDay = now.getDay()
        const daysUntilTarget = targetDay - currentDay
        const futureDate = new Date(now)
        futureDate.setDate(futureDate.getDate() + daysUntilTarget)
        futureDate.setSeconds(0, 0)
        if (explicitTime) {
          futureDate.setHours(explicitTime.hours, explicitTime.minutes, 0, 0)
          return make(futureDate, false)
        }
        futureDate.setHours(0, 0, 0, 0)
        return make(futureDate, true)
      }
    }
    
    // This Monday, Tuesday, etc.
    for (let i = 0; i < dayNames.length; i++) {
      if (text.includes(`this ${dayNames[i]}`)) {
        const targetDay = i === 0 ? 7 : i
        const currentDay = now.getDay()
        let daysUntilTarget = targetDay - currentDay
        if (daysUntilTarget <= 0) daysUntilTarget += 7 // If it's past this week, go to next week
        const futureDate = new Date(now)
        futureDate.setDate(futureDate.getDate() + daysUntilTarget)
        futureDate.setSeconds(0, 0)
        if (explicitTime) {
          futureDate.setHours(explicitTime.hours, explicitTime.minutes, 0, 0)
          return make(futureDate, false)
        }
        futureDate.setHours(0, 0, 0, 0)
        return make(futureDate, true)
      }
    }
    
    // Specific dates (MM/DD/YYYY, DD/MM/YYYY, etc.)
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY or DD/MM/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/,   // YYYY-MM-DD
      /(\d{1,2})-(\d{1,2})-(\d{4})/    // MM-DD-YYYY or DD-MM-YYYY
    ]
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match) {
        let year, month, day
        
        if (pattern.source.includes('\\d{4}')) {
          // YYYY-MM-DD format
          year = parseInt(match[1])
          month = parseInt(match[2]) - 1 // JavaScript months are 0-indexed
          day = parseInt(match[3])
        } else {
          // Assume MM/DD/YYYY format
          month = parseInt(match[1]) - 1
          day = parseInt(match[2])
          year = parseInt(match[3])
        }
        
        const specificDate = new Date(year, month, day, 0, 0, 0, 0)
        if (specificDate > now) {
          if (explicitTime) {
            specificDate.setHours(explicitTime.hours, explicitTime.minutes, 0, 0)
            return make(specificDate, false)
          }
          return make(specificDate, true)
        }
      }
    }
    
    // No date found
    return { iso: null, isAllDay: false }
  }

  async saveTaskPlan(userId, taskPlan) {
    try {
      console.log('Saving task plan with data:', {
        user_id: userId,
        title: taskPlan.title,
        description: taskPlan.description,
        category: taskPlan.category,
        priority: taskPlan.priority,
        estimated_duration: taskPlan.estimated_duration,
        due_date: taskPlan.due_date,
        ai_guidance: taskPlan.ai_guidance,
        completion_steps: taskPlan.completion_steps
      })
      
      const task = await db.createTask({
        user_id: userId,
        title: taskPlan.title,
        description: taskPlan.description,
        category: taskPlan.category,
        priority: taskPlan.priority,
        estimated_duration: taskPlan.estimated_duration,
        due_date: taskPlan.due_date,
        ai_guidance: taskPlan.ai_guidance,
        completion_steps: taskPlan.completion_steps
      })
      
      console.log('Task created successfully:', task)
      return task
    } catch (error) {
      console.error('Error saving task plan:', error)
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
      throw new Error(`Failed to save task plan: ${error.message}`)
    }
  }

  async getNextStep(taskId, userId) {
    try {
      const task = await db.client
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single()

      if (!task) throw new Error('Task not found')

      const currentStep = task.current_step
      const steps = task.completion_steps

      if (currentStep >= steps.length) {
        return {
          step: null,
          message: "🎉 Congratulations! You've completed all steps for this task!",
          completed: true
        }
      }

      const nextStep = steps[currentStep]
      
      return {
        step: nextStep,
        stepNumber: currentStep + 1,
        totalSteps: steps.length,
        progress: Math.round(((currentStep + 1) / steps.length) * 100),
        message: `📋 Step ${currentStep + 1} of ${steps.length}: ${nextStep.description}`
      }
    } catch (error) {
      console.error('Error getting next step:', error)
      throw error
    }
  }

  async completeStep(taskId, userId) {
    try {
      const task = await db.client
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single()

      if (!task) throw new Error('Task not found')

      const newStep = task.current_step + 1
      const progressPercentage = Math.round((newStep / task.completion_steps.length) * 100)

      const updatedTask = await db.updateTaskProgress(taskId, {
        current_step: newStep,
        progress_percentage: progressPercentage,
        status: newStep >= task.completion_steps.length ? 'completed' : 'in_progress'
      })

      // Award XP for completing a step
      const xpGained = Math.max(10, Math.floor(task.estimated_duration / 10))
      await db.updateUserXP(userId, xpGained)

      return {
        task: updatedTask,
        xpGained: xpGained,
        completed: newStep >= task.completion_steps.length
      }
    } catch (error) {
      console.error('Error completing step:', error)
      throw error
    }
  }

  async completeTask(taskId, userId) {
    try {
      const task = await db.getTaskById(taskId)
      
      if (!task || task.user_id !== userId) {
        throw new Error('Task not found')
      }

      // Mark task as completed
      const updatedTask = await db.updateTaskProgress(taskId, {
        status: 'completed',
        progress_percentage: 100,
        completed_at: new Date().toISOString()
      })

      return {
        task: updatedTask,
        message: `🎉 Great job! You've completed "${task.title}"!`
      }
    } catch (error) {
      console.error('Error completing task:', error)
      throw error
    }
  }

  async generateMotivation(taskId, userId) {
    try {
      const task = await db.client
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single()

      if (!task) throw new Error('Task not found')

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: `Generate an encouraging message for someone working on: "${task.title}". They're on step ${task.current_step + 1} of ${task.completion_steps.length}. Be motivational and use lunchbox/food metaphors!` }
        ],
        max_tokens: 150,
        temperature: 0.8,
      })

      return completion.choices[0].message.content
    } catch (error) {
      console.error('Error generating motivation:', error)
      return "🍱 You're doing great! Keep going, one step at a time! ✨"
    }
  }
}

export const taskPlanner = new TaskPlanner()
export default taskPlanner
