import { NextResponse } from 'next/server';
import { generateStudyPlan } from '@/lib/groq';

export async function POST(request) {
  try {
    const { subject, topic } = await request.json();

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    const studyPlan = await generateStudyPlan(subject, topic);

    return NextResponse.json({ studyPlan });

  } catch (error) {
    console.error('Error in study plan API:', error);
    return NextResponse.json(
      { error: 'Failed to generate study plan' },
      { status: 500 }
    );
  }
}
