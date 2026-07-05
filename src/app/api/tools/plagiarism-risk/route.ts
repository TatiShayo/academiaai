import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, mockPlagiarism } from '../../../../lib/openai';

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

    const systemPrompt = `You are an AI Plagiarism Risk Scanner. Analyze the user's text for potential plagiarism, verbatim matches, or over-reliance on source syntax. 
You must respond with a JSON object in this format:
{
  "riskScore": 35, // Overall plagiarism risk score from 0 to 100
  "flaggedSentences": [
    {
      "sentence": "This is the exact sentence from the text",
      "risk": "High", // "High" or "Medium"
      "explanation": "Matches 89% of a text from 'Global Financial Studies, 2021'",
      "suggestion": "Synthesize the concept in your own terms or use a direct blockquote with proper citation."
    }
  ]
}
If no sentences are flag-worthy, return an empty array for flaggedSentences and a riskScore below 10.`;

    const openAiResponse = await callOpenAI(text, systemPrompt, true);

    if (openAiResponse) {
      try {
        const parsed = JSON.parse(openAiResponse);
        if (typeof parsed.riskScore === 'number' && Array.isArray(parsed.flaggedSentences)) {
          return NextResponse.json({
            riskScore: parsed.riskScore,
            flaggedSentences: parsed.flaggedSentences,
          });
        }
      } catch (err) {
        console.error('Failed to parse OpenAI JSON response for plagiarism:', err);
      }
    }

    // Fallback to mock
    const mockResult = mockPlagiarism(text);
    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('Error in plagiarism API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
