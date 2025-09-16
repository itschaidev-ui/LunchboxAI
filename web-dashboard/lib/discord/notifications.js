// Discord notification service for overdue tasks
// Note: Discord.js requires Node.js environment, so we'll use webhooks instead

export class DiscordNotificationService {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL
    this.isReady = !!this.webhookUrl
  }

  async sendOverdueNotification(userDiscordId, task) {
    if (!this.isReady) {
      console.warn('Discord webhook not configured - skipping notification')
      return false
    }

    try {
      const embed = {
        title: '🚨 Task Overdue Alert',
        description: `Your task "${task.title}" is overdue!`,
        color: 0xff0000, // Red color
        fields: [
          {
            name: '📅 Due Date',
            value: new Date(task.due_date).toLocaleString(),
            inline: true
          },
          {
            name: '📊 Priority',
            value: `${task.priority}/5`,
            inline: true
          },
          {
            name: '🏷️ Category',
            value: task.category,
            inline: true
          }
        ],
        footer: {
          text: 'Lunchbox AI • Complete your task to earn XP!'
        },
        timestamp: new Date().toISOString()
      }

      if (task.description) {
        embed.fields.push({
          name: '📝 Description',
          value: task.description.length > 1000 ? task.description.substring(0, 1000) + '...' : task.description,
          inline: false
        })
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `<@${userDiscordId}>`,
          embeds: [embed]
        })
      })

      if (response.ok) {
        console.log(`Overdue notification sent to ${userDiscordId} for task: ${task.title}`)
        return true
      } else {
        console.error('Failed to send Discord webhook:', response.statusText)
        return false
      }

    } catch (error) {
      console.error('Error sending Discord notification:', error)
      return false
    }
  }

  async sendReminderNotification(userDiscordId, task, reminderType = 'upcoming') {
    if (!this.isReady) {
      console.warn('Discord webhook not configured - skipping notification')
      return false
    }

    try {
      const colors = {
        upcoming: 0x00ff00, // Green
        due_soon: 0xffa500, // Orange
        overdue: 0xff0000   // Red
      }

      const titles = {
        upcoming: '⏰ Task Reminder',
        due_soon: '⚠️ Task Due Soon',
        overdue: '🚨 Task Overdue'
      }

      const embed = {
        title: titles[reminderType] || titles.upcoming,
        description: `Don't forget about your task: "${task.title}"`,
        color: colors[reminderType] || colors.upcoming,
        fields: [
          {
            name: '📅 Due Date',
            value: new Date(task.due_date).toLocaleString(),
            inline: true
          },
          {
            name: '📊 Priority',
            value: `${task.priority}/5`,
            inline: true
          }
        ],
        footer: {
          text: 'Lunchbox AI • Stay productive!'
        },
        timestamp: new Date().toISOString()
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `<@${userDiscordId}>`,
          embeds: [embed]
        })
      })

      if (response.ok) {
        console.log(`${reminderType} notification sent to ${userDiscordId} for task: ${task.title}`)
        return true
      } else {
        console.error('Failed to send Discord webhook:', response.statusText)
        return false
      }

    } catch (error) {
      console.error('Error sending Discord reminder:', error)
      return false
    }
  }

  async sendTaskCompletedNotification(userDiscordId, task, xpGained) {
    if (!this.isReady) {
      console.warn('Discord webhook not configured - skipping notification')
      return false
    }

    try {
      const embed = {
        title: '🎉 Task Completed!',
        description: `Great job completing "${task.title}"!`,
        color: 0x00ff00, // Green color
        fields: [
          {
            name: '⭐ XP Gained',
            value: `+${xpGained} XP`,
            inline: true
          },
          {
            name: '📊 Category',
            value: task.category,
            inline: true
          },
          {
            name: '⏱️ Duration',
            value: `${task.estimated_duration} minutes`,
            inline: true
          }
        ],
        footer: {
          text: 'Lunchbox AI • Keep up the great work!'
        },
        timestamp: new Date().toISOString()
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `<@${userDiscordId}>`,
          embeds: [embed]
        })
      })

      if (response.ok) {
        console.log(`Completion notification sent to ${userDiscordId} for task: ${task.title}`)
        return true
      } else {
        console.error('Failed to send Discord webhook:', response.statusText)
        return false
      }

    } catch (error) {
      console.error('Error sending completion notification:', error)
      return false
    }
  }

  async checkOverdueTasks() {
    // This would be called by a cron job or scheduled task
    // For now, we'll implement this in the API endpoint
    console.log('Checking for overdue tasks...')
  }
}

// Export singleton instance
export const discordNotifications = new DiscordNotificationService()
