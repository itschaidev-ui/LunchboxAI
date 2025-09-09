const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, addXP } = require('../../database/init');
const { handleAIChat } = require('../../ai/chatHandler');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('study')
        .setDescription('Get help with studying! 📚')
        .addStringOption(option =>
            option.setName('subject')
                .setDescription('What subject do you need help with?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('topic')
                .setDescription('Specific topic or question (optional)')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const subject = interaction.options.getString('subject');
            const topic = interaction.options.getString('topic') || '';

            // Get or create user
            const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

            // Create study prompt
            const studyPrompt = `I need help studying ${subject}${topic ? `, specifically about ${topic}` : ''}. Can you help me create a study plan and provide some guidance?`;

            // Get AI response
            const aiResponse = await handleAIChat(studyPrompt, user);

            // Add XP for studying
            await addXP(user.id, 5);

            // Create embed
            const embed = new EmbedBuilder()
                .setColor('#2196F3')
                .setTitle('📚 Study Help')
                .setDescription(aiResponse)
                .addFields(
                    { name: 'Subject', value: subject, inline: true },
                    { name: 'XP Earned', value: '+5 XP', inline: true }
                )
                .setTimestamp();

            if (topic) {
                embed.addFields({ name: 'Topic', value: topic });
            }

            interaction.reply({ embeds: [embed] });
            logger.info(`Study help requested: ${subject} by ${user.username}`);

        } catch (error) {
            logger.error('Error in study command:', error);
            interaction.reply({ content: '🍱 Oops! I had trouble helping with your study request. Try again!', ephemeral: true });
        }
    },
};
