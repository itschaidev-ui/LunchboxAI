// iCalendar (.ics) generator for task export
export class ICSGenerator {
  constructor() {
    this.version = '2.0'
    this.prodId = '-//Lunchbox AI//Task Calendar//EN'
    this.calScale = 'GREGORIAN'
    this.method = 'PUBLISH'
  }

  generateICS(tasks, userInfo = {}) {
    const now = new Date()
    const timestamp = this.formatDate(now)
    
    let ics = [
      'BEGIN:VCALENDAR',
      `VERSION:${this.version}`,
      `PRODID:${this.prodId}`,
      `CALSCALE:${this.calScale}`,
      `METHOD:${this.method}`,
      `DTSTAMP:${timestamp}`,
      `X-WR-CALNAME:${userInfo.username || 'Lunchbox AI'} Tasks`,
      `X-WR-CALDESC:Tasks from Lunchbox AI`,
      `X-WR-TIMEZONE:UTC`
    ]

    // Add tasks as events
    tasks.forEach(task => {
      if (task.due_date) {
        const event = this.createEvent(task, userInfo)
        ics.push(...event)
      }
    })

    ics.push('END:VCALENDAR')
    
    return ics.join('\r\n')
  }

  createEvent(task, userInfo = {}) {
    const startDate = new Date(task.due_date)
    const isAllDay = task?.ai_guidance?.due_is_all_day || false
    
    // For all-day events, DTSTART/DTEND should be VALUE=DATE (no time), and DTEND is exclusive (next day)
    const event = ['BEGIN:VEVENT', `UID:${task.id}@lunchboxai.com`]
    if (isAllDay) {
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
      event.push(`DTSTART;VALUE=DATE:${this.formatDateDateOnly(startDate)}`)
      event.push(`DTEND;VALUE=DATE:${this.formatDateDateOnly(endDate)}`)
    } else {
      const endDate = new Date(startDate.getTime() + (task.estimated_duration || 60) * 60000)
      event.push(`DTSTART:${this.formatDate(startDate)}`)
      event.push(`DTEND:${this.formatDate(endDate)}`)
    }
    event.push(
      `SUMMARY:${this.escapeText(task.title)}`,
      `DESCRIPTION:${this.escapeText(this.generateDescription(task))}`,
      `LOCATION:${this.escapeText(task.category || 'General')}`,
      `STATUS:CONFIRMED`,
      `TRANSP:OPAQUE`,
      `CREATED:${this.formatDate(new Date(task.created_at))}`,
      `LAST-MODIFIED:${this.formatDate(new Date(task.updated_at))}`
    )

    // Add priority based on task priority
    if (task.priority) {
      const priorityMap = { 1: 9, 2: 7, 3: 5, 4: 3, 5: 1 }
      event.push(`PRIORITY:${priorityMap[task.priority] || 5}`)
    }

    // Add reminder (1 hour before)
    event.push('BEGIN:VALARM')
    event.push('TRIGGER:-PT1H')
    event.push('ACTION:DISPLAY')
    event.push(`DESCRIPTION:Reminder: ${this.escapeText(task.title)}`)
    event.push('END:VALARM')

    event.push('END:VEVENT')
    return event
  }

  generateDescription(task) {
    // Keep calendar description concise and non-repetitive
    // 1) Short intro
    let description = `Task plan with ${
      Array.isArray(task.completion_steps) ? task.completion_steps.length : 0
    } step(s).`;

    // 2) Steps (single source of truth: completion_steps)
    if (task.completion_steps && task.completion_steps.length > 0) {
      description += '\n\nSteps:\n'
      task.completion_steps.forEach((step, index) => {
        description += `${index + 1}. ${step.description}\n`
      })
    }

    // 3) Optional tips from AI guidance (exclude raw original_response and duplicate steps)
    const tips = task?.ai_guidance?.tips
    if (Array.isArray(tips) && tips.length > 0) {
      description += '\nTips:\n'
      tips.forEach((tip) => {
        description += `- ${tip}\n`
      })
    }

    return description.trim()
  }

  formatDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  formatDateDateOnly(date) {
    const y = date.getUTCFullYear()
    const m = String(date.getUTCMonth() + 1).padStart(2, '0')
    const d = String(date.getUTCDate()).padStart(2, '0')
    return `${y}${m}${d}`
  }

  escapeText(text) {
    if (!text) return ''
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '')
  }

  downloadICS(icsContent, filename = 'lunchbox-tasks.ics') {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
