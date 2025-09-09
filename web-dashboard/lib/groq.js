import Groq from 'groq-sdk';

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

Keep responses helpful and encouraging. Use the lunchbox theme when it fits naturally.`;

export async function generateAIResponse(message, userContext = {}) {
  try {
    // Add context based on user info
    let contextPrompt = SYSTEM_PROMPT;
    
    if (userContext.level && userContext.xp) {
      contextPrompt += `\n\nUser info: Level ${userContext.level}, ${userContext.xp} XP, ${userContext.streak_count || 0} day streak.`;
    }

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: contextPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Fallback responses
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      return "🍱 Hey there! I'm Lunchbox AI, your friendly productivity buddy! How can I help you pack your day today?";
    }
    
    if (message.toLowerCase().includes('help')) {
      return "🍱 I can help you with tasks, studying, reminders, and staying motivated! Try asking me to remind you about something or help you study for a test!";
    }
    
    return "🍱 I'm here to help! I can assist with tasks, studying, and keeping you motivated. What would you like to work on today?";
  }
}

export async function generateStudyPlan(subject, topic = '') {
  try {
    const prompt = `Create a structured study plan for ${subject}${topic ? ` focusing on ${topic}` : ''}. Include:
1. Key concepts to learn
2. Study schedule suggestions
3. Practice activities
4. Resources and tips

Keep it encouraging and use the lunchbox metaphor when appropriate.`;

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('Error generating study plan:', error);
    return "🍱 I'd love to help you create a study plan! Let me try again in a moment.";
  }
}

export async function generateTaskSuggestions(category) {
  try {
    const prompt = `Suggest 3-5 specific tasks for the "${category}" category in a lunchbox-themed task manager. Make them practical and achievable for teens/young adults.`;

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('Error generating task suggestions:', error);
    return "🍱 Here are some ideas for your lunchbox! Try adding tasks like 'Complete homework' or 'Review notes'.";
  }
}
