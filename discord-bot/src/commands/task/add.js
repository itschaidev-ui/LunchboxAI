const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser } = require('../../database/init');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a new task to your lunchbox! 🍱')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('What do you need to do?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('category')
                .setDescription('What type of task is this?')
                .setRequired(true)
                .addChoices(
                    { name: '🍰 Sweet (Fun & Creative)', value: 'sweet' },
                    { name: '🥕 Veggies (Learning & Study)', value: 'veggies' },
                    { name: '🍖 Savory (Important & Urgent)', value: 'savory' },
                    { name: '🍟 Sides (Quick & Easy)', value: 'sides' }
                ))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('More details about your task (optional)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('due_date')
                .setDescription('When is this due? (e.g., "tomorrow 3pm", "next friday")')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const title = interaction.options.getString('title');
            const category = interaction.options.getString('category');
            const description = interaction.options.getString('description') || '';
            const dueDate = interaction.options.getString('due_date');

            // Get or create user
            const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

            // Parse due date if provided
            let parsedDueDate = null;
            if (dueDate) {
                // Simple date parsing - in a real app, you'd use a proper date library
                const now = new Date();
                if (dueDate.toLowerCase().includes('tomorrow')) {
                    parsedDueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                } else if (dueDate.toLowerCase().includes('next week')) {
                    parsedDueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                }
                // Add more date parsing logic as needed
            }

            // Insert task into database
            const db = require('../../database/init').db;
            db.run(
                'INSERT INTO tasks (user_id, title, description, category, due_date) VALUES (?, ?, ?, ?, ?)',
                [user.id, title, description, category, parsedDueDate],
                function(err) {
                    if (err) {
                        logger.error('Error adding task:', err);
                        interaction.reply({ content: '🍱 Oops! I had trouble adding your task. Try again!', ephemeral: true });
                        return;
                    }

                    // Create success embed
                    const embed = new EmbedBuilder()
                        .setColor('#4CAF50')
                        .setTitle('🍱 Task Added to Your Lunchbox!')
                        .setDescription(`**${title}**`)
                        .addFields(
                            { name: 'Category', value: getCategoryEmoji(category) + ' ' + getCategoryName(category), inline: true },
                            { name: 'Task ID', value: `#${this.lastID}`, inline: true }
                        )
                        .setTimestamp();

                    if (description) {
                        embed.addFields({ name: 'Description', value: description });
                    }

                    if (parsedDueDate) {
                        embed.addFields({ name: 'Due Date', value: parsedDueDate.toLocaleDateString() });
                    }

                    interaction.reply({ embeds: [embed] });
                    logger.info(`Task added: ${title} by ${user.username}`);
                }
            );

        } catch (error) {
            logger.error('Error in add command:', error);
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
        'sweet': 'Sweet (Fun & Creative)',
        'veggies': 'Veggies (Learning & Study)',
        'savory': 'Savory (Important & Urgent)',
        'sides': 'Sides (Quick & Easy)'
    };
    return names[category] || 'General';
}
