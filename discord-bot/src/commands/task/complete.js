const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, addXP } = require('../../database/init');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('complete')
        .setDescription('Mark a task as completed! 🎉')
        .addIntegerOption(option =>
            option.setName('task_id')
                .setDescription('The ID of the task to complete')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const taskId = interaction.options.getInteger('task_id');

            // Get or create user
            const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

            // Check if task exists and belongs to user
            const db = require('../../database/init').db;
            db.get(
                'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
                [taskId, user.id],
                (err, task) => {
                    if (err) {
                        logger.error('Error fetching task:', err);
                        interaction.reply({ content: '🍱 Oops! I had trouble finding your task. Try again!', ephemeral: true });
                        return;
                    }

                    if (!task) {
                        interaction.reply({ content: '🍱 Task not found! Make sure the ID is correct and the task belongs to you.', ephemeral: true });
                        return;
                    }

                    if (task.completed) {
                        interaction.reply({ content: '🍱 This task is already completed! Great job! 🎉', ephemeral: true });
                        return;
                    }

                    // Mark task as completed
                    db.run(
                        'UPDATE tasks SET completed = TRUE, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [taskId],
                        function(err) {
                            if (err) {
                                logger.error('Error completing task:', err);
                                interaction.reply({ content: '🍱 Oops! I had trouble completing your task. Try again!', ephemeral: true });
                                return;
                            }

                            // Calculate XP reward based on category
                            const xpReward = getXPReward(task.category);
                            
                            // Add XP to user
                            addXP(user.id, xpReward).then(() => {
                                // Create success embed
                                const embed = new EmbedBuilder()
                                    .setColor('#4CAF50')
                                    .setTitle('🎉 Task Completed!')
                                    .setDescription(`**${task.title}**`)
                                    .addFields(
                                        { name: 'Category', value: getCategoryEmoji(task.category) + ' ' + getCategoryName(task.category), inline: true },
                                        { name: 'XP Earned', value: `+${xpReward} XP`, inline: true }
                                    )
                                    .setTimestamp();

                                if (task.description) {
                                    embed.addFields({ name: 'Description', value: task.description });
                                }

                                // Add encouraging message based on category
                                const encouragement = getEncouragement(task.category);
                                embed.addFields({ name: 'Great Job!', value: encouragement });

                                interaction.reply({ embeds: [embed] });
                                logger.info(`Task completed: ${task.title} by ${user.username} (+${xpReward} XP)`);
                            });
                        }
                    );
                }
            );

        } catch (error) {
            logger.error('Error in complete command:', error);
            interaction.reply({ content: '🍱 Something went wrong! Please try again.', ephemeral: true });
        }
    },
};

function getXPReward(category) {
    const rewards = {
        'sweet': 5,    // Fun & Creative tasks
        'veggies': 10, // Learning & Study tasks
        'savory': 15,  // Important & Urgent tasks
        'sides': 3     // Quick & Easy tasks
    };
    return rewards[category] || 5;
}

function getCategoryEmoji(category) {
    const emojis = {
        'sweet': '🍰',
        'veggies': '🥕',
        'savory': '🍖',
        'sides': '🍟'
    };
    return emojis[category] || '📝';
}

function getCategoryName(category) {
    const names = {
        'sweet': 'Sweet (Fun & Creative)',
        'veggies': 'Veggies (Learning & Study)',
        'savory': 'Savory (Important & Urgent)',
        'sides': 'Sides (Quick & Easy)'
    };
    return names[category] || 'General';
}

function getEncouragement(category) {
    const encouragements = {
        'sweet': 'Your creativity is shining! ✨ Keep up the amazing work!',
        'veggies': 'Learning is a journey, and you\'re doing great! 📚 Keep studying!',
        'savory': 'You tackled something important! 💪 That takes real dedication!',
        'sides': 'Every small step counts! 🎯 You\'re building great habits!'
    };
    return encouragements[category] || 'You\'re doing amazing! Keep it up! 🎉';
}
