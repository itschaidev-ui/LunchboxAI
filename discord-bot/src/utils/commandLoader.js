const fs = require('fs');
const path = require('path');
const logger = require('./logger');

async function loadCommands(client) {
    const commandsPath = path.join(__dirname, '../commands');
    
    // Create commands directory if it doesn't exist
    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        return;
    }

    const commandFolders = fs.readdirSync(commandsPath);
    
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(path.join(commandsPath, folder))
            .filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, folder, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                logger.info(`Loaded command: ${command.data.name}`);
            } else {
                logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
            }
        }
    }
}

module.exports = { loadCommands };
