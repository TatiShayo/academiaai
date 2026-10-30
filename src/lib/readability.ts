export interface TextMetrics {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  syllables: number;
  complexWords: number;
  longWords: number;
  avgSentenceLength: number; // words per sentence
  avgSyllablesPerWord: number;
  readingTimeMinutes: number; // 200 wpm
  speakingTimeMinutes: number; // 130 wpm
}

export interface ReadabilityScores {
  fleschReadingEase: number;
  fleschReadingEaseLabel: string;
  fleschKincaidGradeLevel: number;
  gunningFogIndex: number;
  colemanLiauIndex: number;
  automatedReadabilityIndex: number;
  smogIndex: number;
  consensusGradeLevel: number;
}

export interface FullReadabilityReport {
  metrics: TextMetrics;
  scores: ReadabilityScores;
}

// Common abbreviations that shouldn't trigger a sentence split
const ABBREVIATIONS = new Set([
  "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "vs", "etc", "fig", "e.g", "i.e", "al",
  "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
  "st", "ave", "rd", "blvd", "dept", "univ", "inc", "ltd", "corp", "u.s", "u.k",
]);

/**
 * Count the number of syllables in an English word using phonetic heuristics.
 */
export function countSyllablesInWord(rawWord: string): number {
  const word = rawWord.toLowerCase().trim().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 2) return 1;

  // Words ending with 'e' (like 'make', 'game') where 'e' is silent
  let clean = word;
  if (clean.endsWith("e") && !clean.endsWith("le") && !clean.endsWith("ee")) {
    clean = clean.slice(0, -1);
  }

  // Count vowel groups
  const vowelMatches = clean.match(/[aeiouy]{1,2}/g);
  let syllables = vowelMatches ? vowelMatches.length : 1;

  // Common suffix adjustments
  if (word.endsWith("ed") && !word.endsWith("ted") && !word.endsWith("ded")) {
    syllables = Math.max(1, syllables - 1);
  }
  if (word.endsWith("es") && !word.endsWith("ches") && !word.endsWith("shes") && !word.endsWith("xes")) {
    syllables = Math.max(1, syllables - 1);
  }
  if (word.endsWith("tion") || word.endsWith("sion")) {
    // Usually grouped properly, but ensure minimum
    syllables = Math.max(1, syllables);
  }

  return Math.max(1, syllables);
}

/**
 * Split text into words safely.
 */
export function extractWords(text: string): string[] {
  if (!text || typeof text !== "string") return [];
  // Strip markdown, numbers, special characters, and split
  const cleaned = text.replace(/[*_#`~\[\]()<>{}|\\]/g, " ");
  return cleaned
    .split(/\s+/)
    .map((w) => w.replace(/^[^\w]+|[^\w]+$/g, "").trim())
    .filter((w) => /[a-zA-Z0-9]/.test(w));
}

/**
 * Split text into sentences intelligently handling abbreviations and numbers.
 */
export function extractSentences(text: string): string[] {
  if (!text || typeof text !== "string") return [];
  const cleanText = text.trim();
  if (!cleanText) return [];

  // Match sentence-ending punctuation followed by whitespace or end of string
  const rawSentences = cleanText.split(/(?<=[.!?])\s+(?=[A-Z0-9"']|$)/g);
  const sentences: string[] = [];

  for (let i = 0; i < rawSentences.length; i++) {
    const s = rawSentences[i].trim();
    if (!s) continue;

    const lastWordMatch = s.match(/([a-zA-Z]+)\.$/);
    if (lastWordMatch && ABBREVIATIONS.has(lastWordMatch[1].toLowerCase()) && i + 1 < rawSentences.length) {
      // Merge with next sentence
      rawSentences[i + 1] = s + " " + rawSentences[i + 1];
    } else {
      sentences.push(s);
    }
  }

  return sentences.length > 0 ? sentences : [cleanText];
}

/**
 * Compute raw text metrics.
 */
export function computeTextMetrics(text: string): TextMetrics {
  if (!text || typeof text !== "string") {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      syllables: 0,
      complexWords: 0,
      longWords: 0,
      avgSentenceLength: 0,
      avgSyllablesPerWord: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const wordsList = extractWords(text);
  const words = wordsList.length;
  const sentencesList = extractSentences(text);
  const sentences = Math.max(1, sentencesList.length);

  const paragraphsList = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const paragraphs = Math.max(1, paragraphsList.length);

  let syllables = 0;
  let complexWords = 0; // >= 3 syllables
  let longWords = 0; // >= 7 characters

  for (const w of wordsList) {
    const syl = countSyllablesInWord(w);
    syllables += syl;
    if (syl >= 3) complexWords++;
    if (w.length >= 7) longWords++;
  }

  const safeWords = Math.max(1, words);
  const avgSentenceLength = words > 0 ? Number((words / sentences).toFixed(2)) : 0;
  const avgSyllablesPerWord = words > 0 ? Number((syllables / safeWords).toFixed(2)) : 0;

  const readingTimeMinutes = Number((words / 200).toFixed(2));
  const speakingTimeMinutes = Number((words / 130).toFixed(2));

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences: words > 0 ? sentences : 0,
    paragraphs: words > 0 ? paragraphs : 0,
    syllables,
    complexWords,
    longWords,
    avgSentenceLength,
    avgSyllablesPerWord,
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}

function getFleschReadingEaseLabel(score: number): string {
  if (score >= 90) return "Very Easy (5th grade level)";
  if (score >= 80) return "Easy (6th grade level)";
  if (score >= 70) return "Fairly Easy (7th grade level)";
  if (score >= 60) return "Standard (8th-9th grade level)";
  if (score >= 50) return "Fairly Difficult (10th-12th grade level)";
  if (score >= 30) return "Difficult (College level)";
  return "Very Confusing (Graduate / Professional level)";
}

/**
 * Compute standard readability scores.
 */
export function computeReadabilityScores(metrics: TextMetrics): ReadabilityScores {
  const { words, sentences, syllables, complexWords, charactersNoSpaces } = metrics;

  if (words === 0 || sentences === 0) {
    return {
      fleschReadingEase: 0,
      fleschReadingEaseLabel: "N/A",
      fleschKincaidGradeLevel: 0,
      gunningFogIndex: 0,
      colemanLiauIndex: 0,
      automatedReadabilityIndex: 0,
      smogIndex: 0,
      consensusGradeLevel: 0,
    };
  }

  const W = words;
  const S = sentences;
  const L = syllables;
  const C = complexWords;
  const chars = charactersNoSpaces;

  // 206.835 - 1.015 * (W / S) - 84.6 * (L / W)
  const freRaw = 206.835 - 1.015 * (W / S) - 84.6 * (L / W);
  const fleschReadingEase = Number(Math.max(0, Math.min(100, freRaw)).toFixed(1));
  const fleschReadingEaseLabel = getFleschReadingEaseLabel(fleschReadingEase);

  // 0.39 * (W / S) + 11.8 * (L / W) - 15.59
  const fkglRaw = 0.39 * (W / S) + 11.8 * (L / W) - 15.59;
  const fleschKincaidGradeLevel = Number(Math.max(0, fkglRaw).toFixed(1));

  // 0.4 * ((W / S) + 100 * (C / W))
  const fogRaw = 0.4 * (W / S + 100 * (C / W));
  const gunningFogIndex = Number(Math.max(0, fogRaw).toFixed(1));

  // 0.0588 * (chars / W * 100) - 0.296 * (S / W * 100) - 15.8
  const lettersPer100 = (chars / W) * 100;
  const sentencesPer100 = (S / W) * 100;
  const clRaw = 0.0588 * lettersPer100 - 0.296 * sentencesPer100 - 15.8;
  const colemanLiauIndex = Number(Math.max(0, clRaw).toFixed(1));

  // 4.71 * (chars / W) + 0.5 * (W / S) - 21.43
  const ariRaw = 4.71 * (chars / W) + 0.5 * (W / S) - 21.43;
  const automatedReadabilityIndex = Number(Math.max(0, ariRaw).toFixed(1));

  // 1.0430 * sqrt(30 * (C / S)) + 3.1291
  let smogIndex = 0;
  if (S >= 3) {
    const smogRaw = 1.043 * Math.sqrt(30 * (C / S)) + 3.1291;
    smogIndex = Number(Math.max(0, smogRaw).toFixed(1));
  } else {
    smogIndex = fleschKincaidGradeLevel;
  }

  // Consensus grade level: average of calculated grade levels
  const validGrades = [
    fleschKincaidGradeLevel,
    gunningFogIndex,
    colemanLiauIndex,
    automatedReadabilityIndex,
    smogIndex,
  ].filter((g) => g > 0);

  const consensusGradeLevel = validGrades.length > 0
    ? Number((validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length).toFixed(1))
    : 0;

  return {
    fleschReadingEase,
    fleschReadingEaseLabel,
    fleschKincaidGradeLevel,
    gunningFogIndex,
    colemanLiauIndex,
    automatedReadabilityIndex,
    smogIndex,
    consensusGradeLevel,
  };
}

/**
 * Compute both metrics and readability scores in a unified report.
 */
export function analyzeReadability(text: string): FullReadabilityReport {
  const metrics = computeTextMetrics(text);
  const scores = computeReadabilityScores(metrics);
  return { metrics, scores };
}
