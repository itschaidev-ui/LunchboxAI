const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser } = require('../../database/init');
const { createReminder, parseTimeString } = require('../../utils/reminderSystem');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Set a reminder for yourself! ⏰')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('What should I remind you about?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('when')
                .setDescription('When should I remind you? (e.g., "in 30 minutes", "tomorrow", "next week")')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const message = interaction.options.getString('message');
            const when = interaction.options.getString('when');

            // Get or create user
            const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

            // Parse the time string
            const remindAt = parseTimeString(when);
            
            // Create the reminder
            const reminderId = await createReminder(user.id, message, remindAt);
            
            // Create success embed
            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('⏰ Reminder Set!')
                .setDescription(`I'll remind you about: **${message}**`)
                .addFields(
                    { name: 'When', value: remindAt.toLocaleString(), inline: true },
                    { name: 'Reminder ID', value: `#${reminderId}`, inline: true }
                )
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
            logger.info(`Reminder created: ${message} for ${user.username} at ${remindAt}`);

        } catch (error) {
            logger.error('Error in remind command:', error);
            interaction.reply({ content: '🍱 Oops! I had trouble setting your reminder. Try again!', ephemeral: true });
        }
    },
};
