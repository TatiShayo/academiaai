import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, mockHumanize } from '../../../../lib/openai';

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

  if (level !== undefined && level !== null && !['Subtle', 'Balanced', 'Aggressive'].includes(level)) {
    return NextResponse.json({ error: 'Invalid humanization level' }, { status: 400 });
  }

  try {
    const currentLevel = level || 'Balanced';

    // Try calling OpenAI
    const systemPrompt = `You are an expert academic text humanizer. Your task is to rewrite the user text so it sounds completely natural, organic, and bypasses AI detection filters, while preserving its logical meaning and core scholarly points. 
You must respond with a JSON object in this format:
{
  "humanizedText": "The fully humanized and rewritten text goes here",
  "beforeScore": 92, // An estimate of the AI detection score of the original text (0 to 100)
  "afterScore": 8 // An estimate of the AI detection score of the rewritten text (0 to 100)
}
Apply a humanization strength of "${currentLevel}".
- Subtle: Minor vocabulary adjustments, keeps most syntax.
- Balanced: Rewrites phrases, introduces natural flow, small variations in sentence length.
- Aggressive: Major syntax overhaul, highly natural flow, eliminates all robotic expressions.`;

    const openAiResponse = await callOpenAI(text, systemPrompt, true);

    if (openAiResponse) {
      try {
        const parsed = JSON.parse(openAiResponse);
        if (parsed.humanizedText) {
          return NextResponse.json({
            humanizedText: parsed.humanizedText,
            beforeScore: parsed.beforeScore ?? 85,
            afterScore: parsed.afterScore ?? 15,
          });
        }
      } catch (err) {
        console.error('Failed to parse OpenAI JSON response for humanize:', err);
      }
    }

    // Fallback to Mock
    const mockResult = mockHumanize(text, currentLevel);
    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('Error in humanize API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
