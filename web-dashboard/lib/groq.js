import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// System prompt for Lunchbox AI
const SYSTEM_PROMPT = `You are Lunchbox AI, a helpful assistant that gets things done. Your personality is:

- Warm, supportive, and genuinely helpful
- Focuses on practical solutions and actionable advice
- Speaks like a helpful friend, not a corporate assistant
- Keeps responses short and to the point
- Uses emojis sparingly and naturally
- Prioritizes task completion and productivity
- Encourages progress and celebrates achievements

Your main goal is to help users:
- Break down complex tasks into manageable steps
- Create realistic schedules and study plans
- Stay motivated and on track with their goals
- Organize their work and priorities effectively
- Overcome procrastination and build good habits

IMPORTANT: Always parse and acknowledge specific details from the user's message (times, dates, locations, etc.). If the user has grammar errors, gently correct them while being helpful. When someone mentions an event or task with a time/date, acknowledge it and ask if they want to create a task for it. Don't automatically create tasks - always ask for confirmation first. Keep responses to 1-2 short sentences maximum. Don't ask multiple questions - focus on one action at a time.`;

export async function generateAIResponse(message, userContext = {}, conversationHistory = []) {
  try {
    // Add context based on user info
    let contextPrompt = SYSTEM_PROMPT;
    
    if (userContext.level && userContext.xp) {
      contextPrompt += `\n\nUser info: Level ${userContext.level}, ${userContext.xp} XP, ${userContext.streak_count || 0} day streak.`;
    }

    // Build messages array with conversation history
    const messages = [
      { role: "system", content: contextPrompt }
    ];

    // Add conversation history (limit to last 10 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current message
    messages.push({ role: "user", content: message });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      max_tokens: 80,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Fallback responses
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      return "Hey there! I'm here to help you get things done. What task or project would you like to work on?";
    }
    
    if (message.toLowerCase().includes('help')) {
      return "I can help you break down tasks, create study plans, organize your schedule, and stay motivated. What do you need help with?";
    }
    
    return "I'm here to help you accomplish your goals! What would you like to work on or organize today?";
  }
}

export async function generateStudyPlan(subject, topic = '') {
  try {
    const prompt = `Create a structured study plan for ${subject}${topic ? ` focusing on ${topic}` : ''}. Include:
1. Key concepts to learn
2. Study schedule suggestions
3. Practice activities
4. Resources and tips

Make it practical and actionable. Focus on helping the student succeed.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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
    return "I'd love to help you create a study plan! Let me try again in a moment.";
  }
}

export async function generateTaskSuggestions(category) {
  try {
    const prompt = `Suggest 3-5 specific tasks for the "${category}" category. Make them practical and achievable for teens/young adults.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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
    return "Here are some ideas! Try adding tasks like 'Complete homework' or 'Review notes'.";
  }
}
