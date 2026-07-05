import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, mockEnhance } from '../../../../lib/openai';

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 });
  }

  const { text, level } = body;
  if (text === undefined || text === null || typeof text !== 'string') {
    return NextResponse.json({ error: 'Invalid or missing text field' }, { status: 400 });
  }

  if (text.length > 50000) {
    return NextResponse.json({ error: 'Text content exceeds the maximum limit of 50,000 characters' }, { status: 400 });
  }

  if (level !== undefined && level !== null && !['High School', 'Undergraduate', "Master's", 'PhD'].includes(level)) {
    return NextResponse.json({ error: 'Invalid enhancement level' }, { status: 400 });
  }

  try {
    const currentLevel = level || 'Undergraduate';

    const systemPrompt = `You are an expert academic writer and proofreader. Rewrite the text submitted by the user to reflect a high-quality academic tone matching the "${currentLevel}" level. 
You must respond with a JSON object in this format:
{
  "enhancedText": "The fully rewritten and enhanced academic text",
  "improvements": [
    "Upgraded vocabulary from 'good' to 'salient'",
    "Restructured complex sentence clauses for precision",
    "Introduced formal transition markers"
  ]
}
Academic Levels guidelines:
- High School: Clean grammar, logical structure, simple formal phrasing.
- Undergraduate: Clear argument, elevated academic vocabulary, passive/active synthesis.
- Master's: High scholarly standard, deep vocabulary density, conceptual precision.
- PhD: Doctoral dissertation standard, maximal precision, rigorous objective syntax.`;

    const openAiResponse = await callOpenAI(text, systemPrompt, true);

    if (openAiResponse) {
      try {
        const parsed = JSON.parse(openAiResponse);
        if (parsed.enhancedText && Array.isArray(parsed.improvements)) {
          return NextResponse.json({
            enhancedText: parsed.enhancedText,
            improvements: parsed.improvements,
          });
        }
      } catch (err) {
        console.error('Failed to parse OpenAI JSON response for enhance:', err);
      }
    }

    // Fallback to mock
    const mockResult = mockEnhance(text, currentLevel);
    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('Error in enhance API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
