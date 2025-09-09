const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser } = require('../../database/init');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your Lunchbox AI profile! 🍱'),

    async execute(interaction) {
        try {
            // Get or create user
            const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

            // Calculate level from XP (100 XP per level)
            const level = Math.floor(user.xp / 100) + 1;
            const xpForNextLevel = level * 100;
            const xpProgress = user.xp % 100;
            const xpBar = createXPBar(xpProgress, 100);

            // Get user stats
            const db = require('../../database/init').db;
            
            // Get task stats
            db.get(
                'SELECT COUNT(*) as total_tasks, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_tasks FROM tasks WHERE user_id = ?',
                [user.id],
                (err, taskStats) => {
                    if (err) {
                        logger.error('Error fetching task stats:', err);
                        interaction.reply({ content: '🍱 Oops! I had trouble getting your stats. Try again!', ephemeral: true });
                        return;
                    }

                    // Get study session stats
                    db.get(
                        'SELECT COUNT(*) as study_sessions, SUM(duration_minutes) as total_study_time FROM study_sessions WHERE user_id = ?',
                        [user.id],
                        (err, studyStats) => {
                            if (err) {
                                logger.error('Error fetching study stats:', err);
                                interaction.reply({ content: '🍱 Oops! I had trouble getting your stats. Try again!', ephemeral: true });
                                return;
                            }

                            // Create profile embed
                            const embed = new EmbedBuilder()
                                .setColor('#4CAF50')
                                .setTitle(`🍱 ${interaction.user.username}'s Profile`)
                                .setDescription(`Level ${level} • ${user.xp} XP`)
                                .addFields(
                                    { name: '📊 XP Progress', value: `${xpBar} ${xpProgress}/100`, inline: false },
                                    { name: '📝 Tasks', value: `${taskStats.completed_tasks || 0}/${taskStats.total_tasks || 0} completed`, inline: true },
                                    { name: '📚 Study Sessions', value: `${studyStats.study_sessions || 0} sessions`, inline: true },
                                    { name: '⏰ Study Time', value: `${Math.round((studyStats.total_study_time || 0) / 60)} hours`, inline: true },
                                    { name: '🔥 Streak', value: `${user.streak_count} days`, inline: true },
                                    { name: '🎯 Completion Rate', value: `${calculateCompletionRate(taskStats.total_tasks, taskStats.completed_tasks)}%`, inline: true }
                                )
                                .setTimestamp();

                            // Add level-based title
                            const title = getLevelTitle(level);
                            if (title) {
                                embed.addFields({ name: '🏆 Title', value: title });
                            }

                            interaction.reply({ embeds: [embed] });
                            logger.info(`Profile viewed by ${user.username}`);
                        }
                    );
                }
            );

        } catch (error) {
            logger.error('Error in profile command:', error);
            interaction.reply({ content: '🍱 Something went wrong! Please try again.', ephemeral: true });
        }
    },
};

function createXPBar(current, max) {
    const barLength = 10;
    const filled = Math.round((current / max) * barLength);
    const empty = barLength - filled;
    
    return '█'.repeat(filled) + '░'.repeat(empty);
}

function calculateCompletionRate(total, completed) {
    if (!total || total === 0) return 0;
    return Math.round((completed / total) * 100);
}

function getLevelTitle(level) {
    if (level >= 50) return '🍱 Lunchbox Master';
    if (level >= 40) return '🌟 Productivity Star';
    if (level >= 30) return '📚 Study Champion';
    if (level >= 20) return '⚡ Task Warrior';
    if (level >= 10) return '🎯 Goal Getter';
    if (level >= 5) return '🌱 Growing Strong';
    return '🍱 Lunchbox Beginner';
}
