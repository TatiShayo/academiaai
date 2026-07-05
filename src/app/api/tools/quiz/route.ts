import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, mockQuiz } from '../../../../lib/openai';

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 });
  }

  const { text } = body;
  if (text === undefined || text === null || typeof text !== 'string') {
    return NextResponse.json({ error: 'Invalid or missing text field' }, { status: 400 });
  }

  if (text.length > 50000) {
    return NextResponse.json({ error: 'Text content exceeds the maximum limit of 50,000 characters' }, { status: 400 });
  }

  try {

    const systemPrompt = `You are an academic examiner and evaluator. Generate an interactive multiple-choice quiz of 3-4 questions to test understanding of the provided text.
You must respond with a JSON object in this format:
{
  "questions": [
    {
      "id": "q1", // Unique string ID
      "question": "A clear, multiple-choice question testing a core concept",
      "options": [
        "Incorrect answer option A",
        "Correct answer option B",
        "Incorrect answer option C",
        "Incorrect answer option D"
      ],
      "correctAnswer": 1, // Index of the correct option (0, 1, 2, or 3)
      "explanation": "Scholarly explanation of why this answer is correct and others are incorrect."
    }
  ]
}
Ensure the questions test deep comprehension rather than simple word-matching.`;

    const openAiResponse = await callOpenAI(text, systemPrompt, true);

    if (openAiResponse) {
      try {
        const parsed = JSON.parse(openAiResponse);
        if (Array.isArray(parsed.questions)) {
          return NextResponse.json(parsed);
        }
      } catch (err) {
        console.error('Failed to parse OpenAI JSON response for quiz:', err);
      }
    }

    // Fallback to mock
    const questions = mockQuiz(text);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error in quiz API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
