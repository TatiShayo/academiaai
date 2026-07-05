import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, mockSyllabus } from '../../../../lib/openai';

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

    const systemPrompt = `You are an expert curriculum designer and academic director. Turn the user's rough course notes, topics, or description into a professional weekly syllabus structure.
You must respond with a JSON object in this format:
{
  "courseTitle": "Synthesized Course Title",
  "description": "A high-level scholarly summary of the course's purpose and scope.",
  "weeks": [
    {
      "week": 1,
      "topic": "Weekly Theme or Topic",
      "readings": [
        "Required Reading 1 (Author, Year, Book/Article Title)",
        "Required Reading 2"
      ],
      "objectives": [
        "Demonstrate understanding of...",
        "Analyze the relationship between..."
      ],
      "assignments": [
        "Assignment description (e.g., Essay or Quiz)"
      ]
    }
  ]
}
Provide exactly 4 weeks of content based on their input. Ensure it matches a rigorous academic standard.`;

    const openAiResponse = await callOpenAI(text, systemPrompt, true);

    if (openAiResponse) {
      try {
        const parsed = JSON.parse(openAiResponse);
        if (parsed.courseTitle && Array.isArray(parsed.weeks)) {
          return NextResponse.json(parsed);
        }
      } catch (err) {
        console.error('Failed to parse OpenAI JSON response for syllabus:', err);
      }
    }

    // Fallback to mock
    const mockResult = mockSyllabus(text);
    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('Error in syllabus API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
