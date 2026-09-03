// Helper to call OpenAI or fallback to realistic mock responses
import { formatCitation, parseRawCitation, type CitationMetadata, type CitationStyle } from "./citation-engine";
import { wrapUntrustedSecure } from "./prompt-sanitizer";

const API_KEY = process.env.OPENAI_API_KEY;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Wrap untrusted user/document text so the model treats it strictly as data,
 * not as instructions (prompt-injection mitigation). Callers should embed the
 * returned string in the user message rather than passing raw text.
 */
export function wrapUntrusted(text: string): string {
  return wrapUntrustedSecure(text);
}

/**
 * Generic chat completion. Throws on transport/API error so callers can decide
 * whether to surface an error or fall back. When no API key is configured it
 * returns a clearly-labelled synthetic completion so the app is usable offline.
 */
export async function chat(messages: ChatMessage[]): Promise<string> {
  if (!API_KEY) {
    const user = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    return `[offline-mock] ${user}`;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

export async function callOpenAI(prompt: string, systemPrompt: string, responseFormatJson = true): Promise<string> {
  if (API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          response_format: responseFormatJson ? { type: "json_object" } : undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      // Fall through to mock
    }
  }

  // If no API key or call failed, return empty to trigger fallback
  return "";
}

// Custom mock functions for each tool to ensure a highly realistic out-of-the-box experience
export function mockHumanize(text: string, level: "Subtle" | "Balanced" | "Aggressive" | "subtle" | "balanced" | "aggressive"): {
  humanizedText: string;
  beforeScore: number;
  afterScore: number;
} {
  const cleanText = text.trim();
  if (!cleanText) {
    return { humanizedText: "", beforeScore: 0, afterScore: 0 };
  }

  const normalizedLevel = level.toLowerCase();
  let result = cleanText;

  const replacements: Array<[RegExp, string]> = [
    [/furthermore/gi, "also"],
    [/consequently/gi, "as a result"],
    [/moreover/gi, "in addition"],
    [/it is important to note that/gi, "bear in mind that"],
    [/additionally/gi, "plus"],
    [/testament to/gi, "proof of"],
    [/delve/gi, "go into"],
    [/not only.*but also/gi, "both... and"],
    [/utilize/gi, "use"],
    [/comprehensive/gi, "full"],
    [/pivotal/gi, "key"],
    [/exemplify/gi, "show"],
    [/substantial/gi, "major"],
    [/ubiquitous/gi, "common"],
    [/foster/gi, "build"],
    [/imperative/gi, "essential"],
    [/subsequently/gi, "then"],
  ];

  if (normalizedLevel === "subtle") {
    let count = 0;
    for (const [regex, rep] of replacements) {
      if (regex.test(result)) {
        result = result.replace(regex, rep);
        count++;
        if (count >= 3) break;
      }
    }
    return {
      humanizedText: result,
      beforeScore: Math.floor(Math.random() * 15) + 80, // 80 - 95
      afterScore: Math.floor(Math.random() * 15) + 35, // 35 - 50
    };
  }

  if (normalizedLevel === "balanced") {
    for (const [regex, rep] of replacements) {
      result = result.replace(regex, rep);
    }
    result = result
      .replace(/\bis not\b/g, "isn't")
      .replace(/\bdoes not\b/g, "doesn't")
      .replace(/\bcannot\b/g, "can't")
      .replace(/\bwe will\b/g, "we'll");

    return {
      humanizedText: result,
      beforeScore: Math.floor(Math.random() * 10) + 88, // 88 - 98
      afterScore: Math.floor(Math.random() * 10) + 12, // 12 - 22
    };
  }

  // Aggressive
  for (const [regex, rep] of replacements) {
    result = result.replace(regex, rep);
  }
  result = result
    .replace(/\bis not\b/g, "isn't")
    .replace(/\bdoes not\b/g, "doesn't")
    .replace(/\bcannot\b/g, "can't")
    .replace(/\bshould be noted that\b/g, "we should remember")
    .replace(/\bthroughout history\b/g, "traditionally")
    .replace(/\bin today's modern world\b/g, "today")
    .replace(/\bfirst and foremost\b/g, "primarily");

  result = result.replace(/;\s/g, ". ");

  return {
    humanizedText: result,
    beforeScore: Math.floor(Math.random() * 5) + 95, // 95 - 100
    afterScore: Math.floor(Math.random() * 5) + 2, // 2 - 7
  };
}

export function mockEnhance(text: string, level: "High School" | "Undergraduate" | "Masters" | "Master's" | "PhD"): {
  enhancedText: string;
  improvements: string[];
} {
  const cleanText = text.trim();
  if (!cleanText) {
    return { enhancedText: "", improvements: [] };
  }

  const normalizedLevel = level === "Masters" ? "Master's" : level;
  let enhancedText = cleanText;
  const improvements: string[] = [];

  const vocabularyMap: Record<string, string[]> = {
    "High School": ["clearer sentence structure", "corrected basic grammatical errors", "improved vocabulary definitions"],
    Undergraduate: ["elevated simple verbs to active verbs", "integrated formal transitional phrases", "structured arguments chronologically"],
    "Master's": ["synthesized conceptual terminology", "refined academic prose and passive transitions", "eliminated informal colloquialisms"],
    PhD: ["implemented rigorous academic terminology", "optimized discourse density and cohesion", "maximized stylistic precision and objective tone"],
  };

  if (normalizedLevel === "High School") {
    enhancedText = enhancedText
      .replace(/\bgood\b/gi, "beneficial")
      .replace(/\bbad\b/gi, "detrimental")
      .replace(/\bget\b/gi, "obtain")
      .replace(/\bshow\b/gi, "demonstrate");
    improvements.push('Upgraded basic descriptors to more academic synonyms (e.g. "good" to "beneficial").');
    improvements.push("Enhanced sentence coherence by restructuring clauses.");
  } else if (normalizedLevel === "Undergraduate") {
    enhancedText = enhancedText
      .replace(/\bgood\b/gi, "satisfactory")
      .replace(/\bbad\b/gi, "adverse")
      .replace(/\bshow\b/gi, "illustrate")
      .replace(/\bthink\b/gi, "postulate")
      .replace(/\ba lot of\b/gi, "numerous");
    improvements.push('Substituted informal qualifiers with formal quantitative descriptors (e.g. "a lot of" to "numerous").');
    improvements.push("Restructured passive sentences into active academic syntax.");
  } else if (normalizedLevel === "Master's") {
    enhancedText = enhancedText
      .replace(/\bgood\b/gi, "advantageous")
      .replace(/\bbad\b/gi, "unfavorable")
      .replace(/\bshow\b/gi, "exemplify")
      .replace(/\bthink\b/gi, "theorize")
      .replace(/\ba lot of\b/gi, "a substantial multitude of")
      .replace(/\breally hard\b/gi, "exceedingly complex");
    improvements.push('Elevated vocabulary density to match graduate literature (e.g. "think" to "theorize").');
    improvements.push("Suppressed subjective assertions, substituting with objective, empirical phrasing.");
  } else {
    // PhD
    enhancedText = enhancedText
      .replace(/\bgood\b/gi, "salient")
      .replace(/\bbad\b/gi, "counterproductive")
      .replace(/\bshow\b/gi, "delineate")
      .replace(/\bthink\b/gi, "hypothesize")
      .replace(/\ba lot of\b/gi, "a plethora of")
      .replace(/\breally hard\b/gi, "highly challenging")
      .replace(/\buse\b/gi, "utilize")
      .replace(/\bchange\b/gi, "fluctuation");
    improvements.push('Optimized discourse structure for PhD level thesis rigor (e.g. "use" to "utilize").');
    improvements.push("Refined grammatical structure to maximize conceptual precision and academic gravity.");
  }

  if (normalizedLevel === "Master's" && !enhancedText.includes("Evidently")) {
    enhancedText = "Evidently, " + enhancedText.charAt(0).toLowerCase() + enhancedText.slice(1);
    improvements.push("Prefixed sentence with a logical connector to establish formal argumentation.");
  } else if (normalizedLevel === "PhD" && !enhancedText.includes("Consequently")) {
    enhancedText = "Consequently, it is critical to observe that " + enhancedText.charAt(0).toLowerCase() + enhancedText.slice(1);
    improvements.push("Framed the thesis statement using an objective analytical construct.");
  }

  return {
    enhancedText,
    improvements: [...(vocabularyMap[normalizedLevel] || vocabularyMap["Undergraduate"]), ...improvements],
  };
}

export function mockPlagiarism(text: string): {
  riskScore: number;
  score?: number;
  flaggedSentences: Array<{
    sentence: string;
    risk: "High" | "Medium";
    explanation: string;
    reason: string;
    suggestion: string;
  }>;
  flagged?: Array<{
    sentence: string;
    risk: "High" | "Medium";
    reason: string;
    suggestion: string;
  }>;
} {
  const cleanText = text.trim();
  if (!cleanText) {
    return { riskScore: 0, flaggedSentences: [] };
  }

  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
  const flaggedSentences: Array<{
    sentence: string;
    risk: "High" | "Medium";
    explanation: string;
    reason: string;
    suggestion: string;
  }> = [];

  let flaggedCount = 0;
  sentences.forEach((s, idx) => {
    const sTrim = s.trim();
    if (sTrim.length > 25 && (idx % 3 === 0 || sTrim.toLowerCase().includes("in order to") || sTrim.toLowerCase().includes("is defined as"))) {
      const isHigh = idx % 2 === 0;
      const explanation = isHigh
        ? 'Matches 91% similarity with a pre-existing publication in the "Academic Review Journal" (2023).'
        : 'Matches 74% similarity with an online thesis titled "Foundations and Methodology".';
      const suggestion = isHigh
        ? "Paraphrase by restructuring the clauses or cite the primary reference."
        : "Synthesize the statement into your own words and introduce a citation.";

      flaggedSentences.push({
        sentence: sTrim,
        risk: isHigh ? "High" : "Medium",
        explanation,
        reason: explanation,
        suggestion,
      });
      flaggedCount++;
    }
  });

  let riskScore = 0;
  if (flaggedCount > 0) {
    riskScore = Math.min(15 + flaggedCount * 22, 98);
  } else {
    riskScore = Math.floor(Math.random() * 10) + 2; // 2 - 12 %
  }

  const flagged = flaggedSentences.map((f) => ({
    sentence: f.sentence,
    risk: f.risk,
    reason: f.reason,
    suggestion: f.suggestion,
  }));

  return { riskScore, score: riskScore, flaggedSentences, flagged };
}

export function mockCitation(input: {
  style?: CitationStyle | "APA" | "MLA" | "Chicago" | "Harvard" | "IEEE" | "BibTeX";
  format?: CitationStyle | "APA" | "MLA" | "Chicago" | "Harvard" | "IEEE" | "BibTeX";
  source?: string;
  url?: string;
  title?: string;
  author?: string;
  authors?: string[];
  year?: string | number;
  publisher?: string;
  journal?: string;
  volume?: string | number;
  issue?: string | number;
  pages?: string;
  doi?: string;
}): string {
  const chosenStyle = (input.style || input.format || "APA") as CitationStyle;

  let meta: CitationMetadata;
  if (input.source && !input.title) {
    meta = parseRawCitation(input.source);
  } else {
    meta = {
      title: input.title || input.source || "Academic Exploration",
      author: input.author,
      authors: input.authors,
      year: input.year || "2024",
      publisher: input.publisher || (!input.journal ? "Academia Press" : undefined),
      journal: input.journal,
      volume: input.volume,
      issue: input.issue,
      pages: input.pages,
      url: input.url,
      doi: input.doi,
    };
  }

  return formatCitation(meta, chosenStyle);
}

export function mockSyllabus(text: string): {
  courseTitle: string;
  description: string;
  weeks: Array<{
    week: number;
    topic: string;
    readings: string[];
    objectives: string[];
    assignments: string[];
  }>;
} {
  const titleMatch = text.match(/(?:course|subject|class)\s*(?:title|name)?:\s*([^\n]+)/i);
  const courseTitle = titleMatch ? titleMatch[1].trim() : "Advanced Academic Foundations";

  return {
    courseTitle,
    description: "A comprehensive study covering fundamental and intermediate methodologies, utilizing advanced analytical techniques to synthesize course concepts.",
    weeks: [
      {
        week: 1,
        topic: "Introduction & Epistemological Paradigms",
        readings: ['Kuhn, T. (1962) "The Structure of Scientific Revolutions"', 'Foucault, M. (1969) "The Archaeology of Knowledge"'],
        objectives: ["Define core terminologies and conceptual frameworks.", "Differentiate between positivist and constructivist paradigms."],
        assignments: ["Reflection essay: Paradigmatic assumptions (500 words)"],
      },
      {
        week: 2,
        topic: "Qualitative and Quantitative Methodological Foundations",
        readings: ['Creswell, J.W. (2018) "Research Design"', "Selected Journal articles on research design"],
        objectives: ["Identify key research methodologies.", "Formulate a testable academic hypothesis."],
        assignments: ["Drafting a hypothesis and research design outline"],
      },
      {
        week: 3,
        topic: "Data Analysis, Interpretation, and Synthesis",
        readings: ['Miles, M.B. & Huberman, A.M. (1994) "Qualitative Data Analysis"', "Statistical methods for research handbook"],
        objectives: ["Perform exploratory analysis on sample datasets.", "Evaluate statistical or conceptual validity."],
        assignments: ["Practical analysis assignment: Dataset synthesis"],
      },
      {
        week: 4,
        topic: "Ethics, Plagiarism, and Professional Dissemination",
        readings: ["Committee on Publication Ethics (COPE) Guidelines", "Academic Writing Manual chapter 8"],
        objectives: ["Synthesize findings without citation risk.", "Compile bibliography in multiple styles."],
        assignments: ["Final Course Project: Research Proposal Submission"],
      },
    ],
  };
}

export function mockQuiz(_text: string): Array<{
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}> {
  if (!_text) return [];
  return [
    {
      id: "q1",
      question: "Which of the following describes the primary role of academic literature synthesis?",
      options: [
        "To list every source in chronological order without commenting on themes",
        "To critically evaluate and integrate multiple sources to show agreements and gaps",
        "To write a summary of the single most important book in the domain",
        "To list dictionary definitions of all related jargon",
      ],
      correctAnswer: 1,
      explanation: "Synthesis involves critically combining and contrasting multiple academic texts to form a holistic picture, showing where researchers agree or differ.",
    },
    {
      id: "q2",
      question: "Why are active verbs generally preferred in academic and research writing over passive verbs?",
      options: [
        "They are shorter and easier to type",
        "They make statements feel more objective and scientific",
        "They clearly identify the agent performing the action, increasing clarity",
        "They are required by all citation manuals including APA and Chicago",
      ],
      correctAnswer: 2,
      explanation: 'Active verbs identify "who did what," reducing ambiguity. However, passive voice is still sometimes used when the focus is on the object rather than the author.',
    },
    {
      id: "q3",
      question: "What is the primary indicator of high Plagiarism Risk in academic texts?",
      options: [
        "Using technical jargon and scientific terms",
        "Directly matching unique multi-word phrasing and syntax structures of existing work without citation",
        "Having a long list of citations at the end of the paper",
        'Using common transitional words like "consequently" or "therefore"',
      ],
      correctAnswer: 1,
      explanation: "Plagiarism tools detect verbatim sequences and grammatical structures matching other texts, indicating lack of original authorship or citation.",
    },
  ];
}
