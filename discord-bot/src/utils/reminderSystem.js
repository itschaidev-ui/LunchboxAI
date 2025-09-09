const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const logger = require('./logger');

function setupReminderSystem(client) {
    // Check for reminders every minute
    cron.schedule('* * * * *', async () => {
        try {
            const db = require('../database/init').db;
            
            // Get all pending reminders
            db.all(
                'SELECT r.*, u.discord_id, u.username FROM reminders r JOIN users u ON r.user_id = u.id WHERE r.sent = FALSE AND r.remind_at <= datetime("now")',
                [],
                async (err, reminders) => {
                    if (err) {
                        logger.error('Error checking reminders:', err);
                        return;
                    }

                    for (const reminder of reminders) {
                        try {
                            // Send reminder
                            const user = await client.users.fetch(reminder.discord_id);
                            
                            const embed = new EmbedBuilder()
                                .setColor('#FFA500')
                                .setTitle('🍱 Reminder!')
                                .setDescription(reminder.message)
                                .setTimestamp();

                            await user.send({ embeds: [embed] });
                            
                            // Mark reminder as sent
                            db.run(
                                'UPDATE reminders SET sent = TRUE WHERE id = ?',
                                [reminder.id]
                            );
                            
                            logger.info(`Reminder sent to ${reminder.username}: ${reminder.message}`);
                            
                        } catch (error) {
                            logger.error(`Error sending reminder to ${reminder.username}:`, error);
                        }
                    }
                }
            );
        } catch (error) {
            logger.error('Error in reminder system:', error);
        }
    });

    logger.info('Reminder system started - checking every minute');
}

// Helper function to create a reminder
function createReminder(userId, message, remindAt, channelId = null) {
    return new Promise((resolve, reject) => {
        const db = require('../database/init').db;
        
        db.run(
            'INSERT INTO reminders (user_id, message, remind_at, channel_id) VALUES (?, ?, ?, ?)',
            [userId, message, remindAt, channelId],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
}

// Helper function to parse time strings
function parseTimeString(timeString) {
    const now = new Date();
    const lower = timeString.toLowerCase();
    
    // Handle "in X minutes" format
    const minutesMatch = lower.match(/in (\d+) minutes?/);
    if (minutesMatch) {
        const minutes = parseInt(minutesMatch[1]);
        return new Date(now.getTime() + minutes * 60 * 1000);
    }
    
    // Handle "in X hours" format
    const hoursMatch = lower.match(/in (\d+) hours?/);
    if (hoursMatch) {
        const hours = parseInt(hoursMatch[1]);
        return new Date(now.getTime() + hours * 60 * 60 * 1000);
    }
    
    // Handle "tomorrow" format
    if (lower.includes('tomorrow')) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    }
    
    // Handle "next week" format
    if (lower.includes('next week')) {
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek;
    }
    
    // Default to 1 hour from now
    return new Date(now.getTime() + 60 * 60 * 1000);
}

module.exports = {
    setupReminderSystem,
    createReminder,
    parseTimeString
};
