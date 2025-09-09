const Groq = require('groq-sdk');
const logger = require('../utils/logger');

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// System prompt for Lunchbox AI
const SYSTEM_PROMPT = `You are Lunchbox AI, a friendly and encouraging AI assistant designed for teens and young creators. Your personality is:

- Warm, supportive, and encouraging
- Uses food/lunchbox metaphors when appropriate
- Speaks like a helpful friend, not a corporate assistant
- Keeps responses concise but helpful
- Uses emojis naturally (🍱, 📚, ✨, etc.)
- Focuses on productivity, studying, and creative work
- Can help with task management, study planning, and motivation

You can help with:
- Task organization and reminders
- Study planning and learning paths
- Creative writing and content generation
- Motivation and encouragement
- General productivity advice

Keep responses under 500 characters for Discord. Be encouraging and use the lunchbox theme when it fits naturally.`;

async function handleAIChat(message, user) {
    try {
        // Check if message contains task-related keywords
        const taskKeywords = ['remind', 'task', 'homework', 'due', 'deadline', 'study', 'test', 'exam'];
        const isTaskRelated = taskKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );

        // Check if message contains study-related keywords
        const studyKeywords = ['help', 'explain', 'learn', 'understand', 'study', 'practice'];
        const isStudyRelated = studyKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );

        // Add context based on message type
        let contextPrompt = SYSTEM_PROMPT;
        
        if (isTaskRelated) {
            contextPrompt += `\n\nThe user is asking about tasks or reminders. Help them organize their tasks using the lunchbox metaphor (Sweet, Veggies, Savory, Sides categories).`;
        }
        
        if (isStudyRelated) {
            contextPrompt += `\n\nThe user needs study help. Provide structured learning guidance and encouragement.`;
        }

        // Add user context
        contextPrompt += `\n\nUser info: Level ${user.level}, ${user.xp} XP, ${user.streak_count} day streak.`;

        const completion = await groq.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [
                { role: "system", content: contextPrompt },
                { role: "user", content: message }
            ],
            max_tokens: 200,
            temperature: 0.7,
        });

        const response = completion.choices[0].message.content;
        
        // Log the interaction
        logger.info(`AI Chat - User: ${user.username}, Message: ${message.substring(0, 50)}...`);
        
        return response;

    } catch (error) {
        logger.error('Error in AI chat handler:', error);
        
        // Fallback responses based on message content
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
            return "🍱 Hey there! I'm Lunchbox AI, your friendly productivity buddy! How can I help you pack your day today?";
        }
        
        if (message.toLowerCase().includes('help')) {
            return "🍱 I can help you with tasks, studying, reminders, and staying motivated! Try asking me to remind you about something or help you study for a test!";
        }
        
        return "🍱 I'm here to help! I can assist with tasks, studying, and keeping you motivated. What would you like to work on today?";
    }
}

module.exports = { handleAIChat };
