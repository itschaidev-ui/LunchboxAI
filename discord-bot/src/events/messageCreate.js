const { Events, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, addXP } = require('../database/init');
const { handleAIChat } = require('../ai/chatHandler');
const logger = require('../utils/logger');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Handle DM messages for AI chat
        if (message.channel.type === 1) { // DM channel
            try {
                // Get or create user
                const user = await getOrCreateUser(message.author.id, message.author.username);
                
                // Add XP for interaction
                await addXP(user.id, 1);
                
                // Handle AI chat
                const response = await handleAIChat(message.content, user);
                
                if (response) {
                    await message.reply(response);
                }
            } catch (error) {
                logger.error('Error handling DM message:', error);
            }
        }

        // Handle mentions in guild channels
        if (message.mentions.has(message.client.user)) {
            try {
                const user = await getOrCreateUser(message.author.id, message.author.username);
                await addXP(user.id, 2);
                
                const response = await handleAIChat(message.content, user);
                
                if (response) {
                    await message.reply(response);
                }
            } catch (error) {
                logger.error('Error handling mention:', error);
            }
        }
    },
};
