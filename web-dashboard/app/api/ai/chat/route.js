import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/groq';

export async function POST(request) {
  try {
    const { message, userContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await generateAIResponse(message, userContext);

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Error in AI chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
