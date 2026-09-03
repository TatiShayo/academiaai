import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockChat, mockCheckUsage, mockTrackUsage, mockCheckApiRateLimit, mockIncrementWords } = vi.hoisted(() => ({
  mockChat: vi.fn(),
  mockCheckUsage: vi.fn(),
  mockTrackUsage: vi.fn(),
  mockCheckApiRateLimit: vi.fn(),
  mockIncrementWords: vi.fn(),
}));

vi.mock("@/lib/openai", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    chat: mockChat,
    wrapUntrusted: (t: string) => t,
  };
});

vi.mock("@/lib/tool-guard", () => ({
  checkUsage: mockCheckUsage,
  trackUsage: mockTrackUsage,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkApiRateLimit: mockCheckApiRateLimit,
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock("@/lib/usage", () => ({
  incrementWordsProcessed: mockIncrementWords,
  getUsage: vi.fn().mockResolvedValue({ docCount: 0, month: "2026-08", plan: "free" }),
  canProcess: vi.fn().mockResolvedValue(true),
  getRemaining: vi.fn().mockResolvedValue(3),
  getLimit: vi.fn().mockReturnValue(3),
  getTotalWordsProcessed: vi.fn().mockResolvedValue(15000),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue(
            table === "api_keys"
              ? { data: { user_id: "user-123", revoked: false }, error: null }
              : { data: null, error: null }
          ),
        }),
      }),
      update: () => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  }),
}));

import { POST as citationsPost } from "@/app/api/tools/citations/route";
import { POST as enhancePost } from "@/app/api/tools/enhance/route";
import { POST as plagiarismPost } from "@/app/api/tools/plagiarism-risk/route";
import { POST as quizPost } from "@/app/api/tools/quiz/route";
import { POST as syllabusPost } from "@/app/api/tools/syllabus/route";
import { POST as v1CitationsPost } from "@/app/api/v1/citations/route";
import { POST as v1EnhancePost } from "@/app/api/v1/enhance/route";
import { POST as v1HumanizePost } from "@/app/api/v1/humanize/route";

describe("API Routes Edge Cases & Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckUsage.mockResolvedValue({ userId: "user-123" });
    mockTrackUsage.mockResolvedValue(undefined);
    mockCheckApiRateLimit.mockReturnValue({ allowed: true, remaining: 99 });
    mockIncrementWords.mockResolvedValue(undefined);
    mockChat.mockResolvedValue("Formatted result from AI model");
  });

  it("handles malformed JSON in citations tool endpoint with 400", async () => {
    const req = new NextRequest("http://localhost/api/tools/citations", {
      method: "POST",
      body: "{ invalid json ...",
    });
    const res = await citationsPost(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid JSON request");
  });

  it("accepts structured citation input in tools/citations", async () => {
    const req = new NextRequest("http://localhost/api/tools/citations", {
      method: "POST",
      body: JSON.stringify({
        title: "Relativity Theory",
        author: "Einstein, Albert",
        year: 1916,
        style: "IEEE",
      }),
    });
    const res = await citationsPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.style).toBe("IEEE");
    expect(json.citation).toBeDefined();
  });

  it("handles enhance tool with fallback when AI fails", async () => {
    mockChat.mockRejectedValueOnce(new Error("API Timeout"));
    const req = new NextRequest("http://localhost/api/tools/enhance", {
      method: "POST",
      body: JSON.stringify({
        text: "This is a good text that has enough length to satisfy the validator.",
        level: "PhD",
      }),
    });
    const res = await enhancePost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.enhancedText).toBeDefined();
    expect(json.improvements).toBeDefined();
  });

  it("handles plagiarism scanner with aligned properties (score and flagged)", async () => {
    mockChat.mockResolvedValueOnce(
      JSON.stringify({
        score: 42,
        flagged: [
          { sentence: "Sentence one", risk: "High", reason: "Found online", suggestion: "Rephrase" }
        ]
      })
    );

    const req = new NextRequest("http://localhost/api/tools/plagiarism-risk", {
      method: "POST",
      body: JSON.stringify({
        text: "This is a text that is long enough to satisfy the schema validation character limit.",
      }),
    });
    const res = await plagiarismPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.score).toBe(42);
    expect(json.riskScore).toBe(42);
    expect(json.flagged).toHaveLength(1);
    expect(json.flaggedSentences).toHaveLength(1);
  });

  it("rejects v1 endpoints without Bearer token with 401", async () => {
    const req = new NextRequest("http://localhost/api/v1/humanize", {
      method: "POST",
      body: JSON.stringify({ text: "Sample text" }),
    });
    const res = await v1HumanizePost(req);
    expect(res.status).toBe(401);
  });

  it("handles v1 enhance with rate limit exceeded with 429", async () => {
    mockCheckApiRateLimit.mockReturnValueOnce({ allowed: false, remaining: 0 });
    const req = new NextRequest("http://localhost/api/v1/enhance", {
      method: "POST",
      headers: { Authorization: "Bearer acad_12345" },
      body: JSON.stringify({ text: "Valid text for enhancement", level: "Undergraduate" }),
    });
    const res = await v1EnhancePost(req);
    expect(res.status).toBe(429);
  });

  it("handles v1 citations with valid Bearer token", async () => {
    const req = new NextRequest("http://localhost/api/v1/citations", {
      method: "POST",
      headers: { Authorization: "Bearer acad_12345" },
      body: JSON.stringify({ source: "Nature Study (2024)", format: "APA" }),
    });
    const res = await v1CitationsPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.citation).toBeDefined();
  });

  it("handles quiz endpoint with valid mock response", async () => {
    const req = new NextRequest("http://localhost/api/tools/quiz", {
      method: "POST",
      body: JSON.stringify({
        text: "Quantum computing utilizes qubits instead of classical binary bits to compute.",
      }),
    });
    const res = await quizPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.questions).toBeDefined();
    expect(Array.isArray(json.questions)).toBe(true);
  });

  it("handles syllabus organizer endpoint", async () => {
    const req = new NextRequest("http://localhost/api/tools/syllabus", {
      method: "POST",
      body: JSON.stringify({
        text: "Course Title: Intro to Microeconomics. Topics: Supply, demand, elasticity, monopoly.",
      }),
    });
    const res = await syllabusPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.courseTitle).toBeDefined();
    expect(json.weeks).toBeDefined();
  });
});
