import { describe, it, expect } from "vitest";
import {
  countSyllablesInWord,
  extractWords,
  extractSentences,
  computeTextMetrics,
  analyzeReadability,
} from "../lib/readability";

describe("Readability - Syllable Counter", () => {
  it("counts monosyllabic words correctly", () => {
    expect(countSyllablesInWord("the")).toBe(1);
    expect(countSyllablesInWord("cat")).toBe(1);
    expect(countSyllablesInWord("dog")).toBe(1);
    expect(countSyllablesInWord("a")).toBe(1);
    expect(countSyllablesInWord("run")).toBe(1);
    expect(countSyllablesInWord("thought")).toBe(1);
  });

  it("handles silent 'e' at end of words", () => {
    expect(countSyllablesInWord("make")).toBe(1);
    expect(countSyllablesInWord("game")).toBe(1);
    expect(countSyllablesInWord("late")).toBe(1);
    expect(countSyllablesInWord("stone")).toBe(1);
  });

  it("counts polysyllabic words accurately", () => {
    expect(countSyllablesInWord("academic")).toBe(4);
    expect(countSyllablesInWord("university")).toBe(5);
    expect(countSyllablesInWord("methodology")).toBe(5);
    expect(countSyllablesInWord("literature")).toBe(4);
    expect(countSyllablesInWord("synthesis")).toBe(3);
  });

  it("handles suffixes like -tion, -sion, -es, -ed", () => {
    expect(countSyllablesInWord("action")).toBe(2);
    expect(countSyllablesInWord("decision")).toBe(3);
    expect(countSyllablesInWord("tested")).toBe(2);
    expect(countSyllablesInWord("walked")).toBe(1);
  });

  it("handles empty and non-alphabetic inputs safely", () => {
    expect(countSyllablesInWord("")).toBe(0);
    expect(countSyllablesInWord("   ")).toBe(0);
    expect(countSyllablesInWord("12345")).toBe(0);
    expect(countSyllablesInWord("!!!")).toBe(0);
  });
});

describe("Readability - Word and Sentence Extraction", () => {
  it("extracts words from text ignoring punctuation and markdown", () => {
    const text = "# Heading\nThis is a **bold** and *italic* research study.";
    const words = extractWords(text);
    expect(words).toEqual(["Heading", "This", "is", "a", "bold", "and", "italic", "research", "study"]);
    expect(words).toHaveLength(9);
  });

  it("extracts sentences and does not split on abbreviations like Dr., e.g., i.e.", () => {
    const text = "Dr. Smith presented the paper. For e.g. this is a test. The results were conclusive.";
    const sentences = extractSentences(text);
    expect(sentences).toHaveLength(3);
    expect(sentences[0]).toBe("Dr. Smith presented the paper.");
    expect(sentences[1]).toBe("For e.g. this is a test.");
    expect(sentences[2]).toBe("The results were conclusive.");
  });

  it("does not split on decimal numbers like 3.14", () => {
    const text = "The value of pi is approximately 3.14159 in Euclidean geometry. This is fundamental.";
    const sentences = extractSentences(text);
    expect(sentences).toHaveLength(2);
  });

  it("handles empty or whitespace strings safely", () => {
    expect(extractWords("")).toEqual([]);
    expect(extractSentences("")).toEqual([]);
    expect(extractSentences("   ")).toEqual([]);
  });
});

describe("Readability - Metrics Computation", () => {
  it("computes accurate metrics for academic text", () => {
    const text = "Artificial intelligence models require extensive empirical evaluation to verify statistical significance.";
    const metrics = computeTextMetrics(text);

    expect(metrics.words).toBe(11);
    expect(metrics.sentences).toBe(1);
    expect(metrics.characters).toBe(text.length);
    expect(metrics.syllables).toBeGreaterThanOrEqual(30);
    expect(metrics.complexWords).toBeGreaterThanOrEqual(4); // artificial, intelligence, empirical, evaluation, significance
    expect(metrics.avgSentenceLength).toBe(11);
    expect(metrics.readingTimeMinutes).toBeGreaterThan(0);
    expect(metrics.speakingTimeMinutes).toBeGreaterThan(0);
  });

  it("guards against division by zero on empty text", () => {
    const metrics = computeTextMetrics("");
    expect(metrics.words).toBe(0);
    expect(metrics.sentences).toBe(0);
    expect(metrics.avgSentenceLength).toBe(0);
    expect(metrics.avgSyllablesPerWord).toBe(0);
    expect(metrics.readingTimeMinutes).toBe(0);
    expect(metrics.speakingTimeMinutes).toBe(0);
  });
});

describe("Readability - Indices & Scores", () => {
  it("computes all standard indices without NaN or Infinity", () => {
    const text =
      "The quick brown fox jumps over the lazy dog. Academic research demonstrates clear methodological rigor when experiments are properly controlled and replicated.";
    const report = analyzeReadability(text);

    const { scores, metrics } = report;
    expect(metrics.words).toBeGreaterThan(15);
    expect(scores.fleschReadingEase).toBeGreaterThanOrEqual(0);
    expect(scores.fleschReadingEase).toBeLessThanOrEqual(100);
    expect(typeof scores.fleschReadingEaseLabel).toBe("string");
    expect(scores.fleschKincaidGradeLevel).toBeGreaterThan(0);
    expect(scores.gunningFogIndex).toBeGreaterThan(0);
    expect(scores.colemanLiauIndex).toBeGreaterThan(0);
    expect(scores.automatedReadabilityIndex).toBeGreaterThan(0);
    expect(scores.smogIndex).toBeGreaterThan(0);
    expect(scores.consensusGradeLevel).toBeGreaterThan(0);
  });

  it("handles 0-word empty text safely without crashing or returning NaN", () => {
    const report = analyzeReadability("");
    expect(report.metrics.words).toBe(0);
    expect(report.scores.fleschReadingEase).toBe(0);
    expect(report.scores.fleschKincaidGradeLevel).toBe(0);
    expect(report.scores.gunningFogIndex).toBe(0);
    expect(report.scores.consensusGradeLevel).toBe(0);
    expect(report.scores.fleschReadingEaseLabel).toBe("N/A");
  });

  it("evaluates simple children text as high Flesch Reading Ease", () => {
    const simple = "The cat sat on the mat. The dog ran in the park. It was a good day.";
    const report = analyzeReadability(simple);
    expect(report.scores.fleschReadingEase).toBeGreaterThan(70);
    expect(report.scores.fleschKincaidGradeLevel).toBeLessThan(6);
  });

  it("evaluates dense doctoral text as lower Flesch Reading Ease and higher Grade Level", () => {
    const dense =
      "Epistemological formulations intrinsically necessitate interdisciplinary hermeneutic contextualization to substantiate ontological validity.";
    const report = analyzeReadability(dense);
    expect(report.scores.fleschReadingEase).toBeLessThan(35);
    expect(report.scores.fleschKincaidGradeLevel).toBeGreaterThan(10);
  });
});
