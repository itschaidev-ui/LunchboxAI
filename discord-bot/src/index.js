const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { loadCommands } = require('./utils/commandLoader');
const { loadEvents } = require('./utils/eventLoader');
const { initializeDatabase } = require('./database/init');
const { setupReminderSystem } = require('./utils/reminderSystem');
const logger = require('./utils/logger');
require('dotenv').config();

// Create Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers
    ]
});

// Create collections for commands and cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();

// Set up the bot
async function setupBot() {
    try {
        // Initialize database
        await initializeDatabase();
        logger.info('Database initialized successfully');

        // Load commands and events
        await loadCommands(client);
        await loadEvents(client);
        logger.info('Commands and events loaded successfully');

        // Set up reminder system
        setupReminderSystem(client);
        logger.info('Reminder system initialized');

        // Login to Discord
        await client.login(process.env.DISCORD_TOKEN);
        
    } catch (error) {
        logger.error('Failed to setup bot:', error);
        process.exit(1);
    }
}

// Bot ready event
client.once('ready', () => {
    logger.info(`🍱 Lunchbox AI is ready! Logged in as ${client.user.tag}`);
    
    // Set bot activity
    client.user.setActivity('helping you pack your lunchbox! 🍱', { 
        type: ActivityType.Playing 
    });

    // Log guild count
    logger.info(`Serving ${client.guilds.cache.size} servers`);
});

// Error handling
client.on('error', error => {
    logger.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    logger.error('Unhandled promise rejection:', error);
});

// Start the bot
setupBot();
