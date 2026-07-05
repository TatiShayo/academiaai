import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, mockCitation } from '../../../../lib/openai';

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 });
  }

  const { style, url, title, author, year, publisher } = body;

  if (title === undefined || title === null || typeof title !== 'string') {
    return NextResponse.json({ error: 'Invalid or missing title field' }, { status: 400 });
  }

  if (title.length > 50000) {
    return NextResponse.json({ error: 'Title content exceeds the maximum limit of 50,000 characters' }, { status: 400 });
  }

  if (style !== undefined && style !== null && !['APA', 'MLA', 'Chicago', 'Harvard'].includes(style)) {
    return NextResponse.json({ error: 'Invalid citation style' }, { status: 400 });
  }

  if (url !== undefined && url !== null && typeof url !== 'string') {
    return NextResponse.json({ error: 'URL must be a string' }, { status: 400 });
  }
  if (author !== undefined && author !== null && typeof author !== 'string') {
    return NextResponse.json({ error: 'Author must be a string' }, { status: 400 });
  }
  if (year !== undefined && year !== null && typeof year !== 'string') {
    return NextResponse.json({ error: 'Year must be a string' }, { status: 400 });
  }
  if (publisher !== undefined && publisher !== null && typeof publisher !== 'string') {
    return NextResponse.json({ error: 'Publisher must be a string' }, { status: 400 });
  }

  try {

    const currentStyle = style || 'APA';

    const systemPrompt = `You are a citation compiler. Generate a clean academic citation for the given details in the requested style: "${currentStyle}". 
You must respond with a JSON object in this format:
{
  "citation": "Formatted citation string"
}
Ensure it follows standard style guidelines (APA 7th, MLA 9th, Chicago 17th, Harvard).`;

    const details = `Style: ${currentStyle}
Title: ${title}
Author: ${author || 'Unknown'}
Year: ${year || 'n.d.'}
Publisher: ${publisher || 'n.p.'}
URL: ${url || 'N/A'}`;

    const openAiResponse = await callOpenAI(details, systemPrompt, true);

    if (openAiResponse) {
      try {
        const parsed = JSON.parse(openAiResponse);
        if (parsed.citation) {
          return NextResponse.json({
            citation: parsed.citation,
          });
        }
      } catch (err) {
        console.error('Failed to parse OpenAI JSON response for citations:', err);
      }
    }

    // Fallback to mock
    const citation = mockCitation({ style: currentStyle, url, title, author, year, publisher });
    return NextResponse.json({ citation });
  } catch (error) {
    console.error('Error in citations API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
