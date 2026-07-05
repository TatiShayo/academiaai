import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockChat, mockCheckUsage, mockTrackUsage } = vi.hoisted(() => ({
  mockChat: vi.fn(),
  mockCheckUsage: vi.fn(),
  mockTrackUsage: vi.fn(),
}));

vi.mock("@/lib/openai", () => ({ chat: mockChat }));
vi.mock("@/lib/tool-guard", () => ({
  checkUsage: mockCheckUsage,
  trackUsage: mockTrackUsage,
}));

import { POST } from "@/app/api/tools/plagiarism-risk/route";

function createRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/tools/plagiarism-risk", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("Plagiarism Risk Scanner API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckUsage.mockResolvedValue({ userId: "user-1" });
    mockTrackUsage.mockResolvedValue(undefined);
    mockChat.mockResolvedValue(
      JSON.stringify({
        score: 25,
        flagged: [
          { sentence: "Climate change represents a significant global challenge.", risk: "low", reason: "Common academic phrasing" },
          { sentence: "The data suggests a strong correlation.", risk: "medium", reason: "Frequently used in academic papers" },
        ],
      })
    );
  });

  it("returns risk score and flagged sentences", async () => {
    const req = createRequest({
      text: "Climate change represents a significant global challenge that requires immediate action. The data suggests a strong correlation.",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.score).toBe(25);
    expect(json.flagged).toHaveLength(2);
    expect(json.flagged[0].risk).toBe("low");
    expect(json.flagged[1].risk).toBe("medium");
    expect(mockTrackUsage).toHaveBeenCalledWith("user-1");
  });

  it("handles OpenAI error gracefully with fallback", async () => {
    mockChat.mockRejectedValueOnce(new Error("OpenAI API error"));

    const req = createRequest({
      text: "This is a sufficiently long test text that exceeds the minimum fifty character requirement for the plagiarism scanner.",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.score).toBeGreaterThanOrEqual(0);
    expect(json.score).toBeLessThanOrEqual(30);
    expect(json.flagged).toBeDefined();
    expect(Array.isArray(json.flagged)).toBe(true);
  });

  it("returns 400 when text is under 50 chars", async () => {
    const req = createRequest({ text: "Short text" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when text is missing", async () => {
    const req = createRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 402 when usage limit exceeded", async () => {
    mockCheckUsage.mockResolvedValueOnce({
      error: new Response(
        JSON.stringify({ error: "Usage limit reached", paywall: true }),
        { status: 402 }
      ),
    });

    const req = createRequest({
      text: "This is a valid test text that meets the minimum character count requirement for processing.",
    });
    const res = await POST(req);
    expect(res.status).toBe(402);
  });
});
