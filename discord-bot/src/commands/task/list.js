const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser } = require('../../database/init');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('View all your tasks in your lunchbox! 🍱')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Filter by category (optional)')
                .setRequired(false)
                .addChoices(
                    { name: '🍰 Sweet (Fun & Creative)', value: 'sweet' },
                    { name: '🥕 Veggies (Learning & Study)', value: 'veggies' },
                    { name: '🍖 Savory (Important & Urgent)', value: 'savory' },
                    { name: '🍟 Sides (Quick & Easy)', value: 'sides' }
                ))
        .addBooleanOption(option =>
            option.setName('completed')
                .setDescription('Show completed tasks too?')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const category = interaction.options.getString('category');
            const showCompleted = interaction.options.getBoolean('completed') || false;

            // Get or create user
            const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

            // Build query
            let query = 'SELECT * FROM tasks WHERE user_id = ?';
            const params = [user.id];

            if (category) {
                query += ' AND category = ?';
                params.push(category);
            }

            if (!showCompleted) {
                query += ' AND completed = FALSE';
            }

            query += ' ORDER BY created_at DESC LIMIT 20';

            // Execute query
            const db = require('../../database/init').db;
            db.all(query, params, (err, tasks) => {
                if (err) {
                    logger.error('Error fetching tasks:', err);
                    interaction.reply({ content: '🍱 Oops! I had trouble getting your tasks. Try again!', ephemeral: true });
                    return;
                }

                if (tasks.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor('#FFB6C1')
                        .setTitle('🍱 Your Lunchbox is Empty!')
                        .setDescription('Time to add some tasks! Use `/add` to get started.')
                        .setTimestamp();

                    interaction.reply({ embeds: [embed] });
                    return;
                }

                // Create embed
                const embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('🍱 Your Lunchbox Tasks')
                    .setDescription(`Here are your ${tasks.length} task${tasks.length === 1 ? '' : 's'}:`)
                    .setTimestamp();

                // Group tasks by category
                const tasksByCategory = {
                    'sweet': [],
                    'veggies': [],
                    'savory': [],
                    'sides': []
                };

                tasks.forEach(task => {
                    tasksByCategory[task.category].push(task);
                });

                // Add fields for each category
                Object.entries(tasksByCategory).forEach(([category, categoryTasks]) => {
                    if (categoryTasks.length > 0) {
                        const categoryEmoji = getCategoryEmoji(category);
                        const categoryName = getCategoryName(category);
                        
                        let fieldValue = '';
                        categoryTasks.forEach(task => {
                            const status = task.completed ? '✅' : '⏳';
                            const dueDate = task.due_date ? ` (Due: ${new Date(task.due_date).toLocaleDateString()})` : '';
                            fieldValue += `${status} **#${task.id}** ${task.title}${dueDate}\n`;
                        });

                        embed.addFields({
                            name: `${categoryEmoji} ${categoryName}`,
                            value: fieldValue || 'No tasks',
                            inline: false
                        });
                    }
                });

                // Add footer with stats
                const completedCount = tasks.filter(t => t.completed).length;
                const pendingCount = tasks.filter(t => !t.completed).length;
                
                embed.setFooter({
                    text: `📊 ${pendingCount} pending • ${completedCount} completed • Level ${user.level}`
                });

                interaction.reply({ embeds: [embed] });
                logger.info(`Listed ${tasks.length} tasks for ${user.username}`);
            });

        } catch (error) {
            logger.error('Error in list command:', error);
            interaction.reply({ content: '🍱 Something went wrong! Please try again.', ephemeral: true });
        }
    },
};

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
        'sweet': 'Sweet',
        'veggies': 'Veggies',
        'savory': 'Savory',
        'sides': 'Sides'
    };
    return names[category] || 'General';
}
