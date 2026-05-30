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

import { POST } from "@/app/api/tools/humanize/route";

function createRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/tools/humanize", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("Humanizer API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckUsage.mockResolvedValue({ userId: "user-1" });
    mockTrackUsage.mockResolvedValue(undefined);
    mockChat.mockResolvedValue("This is a perfectly natural rewrite of the text.");
  });

  it("transforms input text into humanized output", async () => {
    const req = createRequest({
      text: "The utilization of AI technology has increased significantly in recent years.",
      level: "balanced",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.original).toBe(
      "The utilization of AI technology has increased significantly in recent years."
    );
    expect(json.humanized).toBe("This is a perfectly natural rewrite of the text.");
    expect(json.aiScoreBefore).toBeGreaterThanOrEqual(70);
    expect(json.aiScoreAfter).toBeGreaterThanOrEqual(1);
    expect(mockTrackUsage).toHaveBeenCalledWith("user-1");
  });

  it("returns AI detection scores in expected ranges", async () => {
    const req = createRequest({
      text: "Test text",
      level: "subtle",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(json.aiScoreBefore).toBeGreaterThanOrEqual(70);
    expect(json.aiScoreBefore).toBeLessThanOrEqual(100);
    expect(json.aiScoreAfter).toBeGreaterThanOrEqual(1);
    expect(json.aiScoreAfter).toBeLessThanOrEqual(16);
  });

  it("returns 400 when text is missing", async () => {
    const req = createRequest({ level: "balanced" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockCheckUsage.mockResolvedValueOnce({
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      }),
    });

    const req = createRequest({ text: "test", level: "balanced" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 402 when usage limit exceeded", async () => {
    mockCheckUsage.mockResolvedValueOnce({
      error: new Response(
        JSON.stringify({ error: "Usage limit reached", paywall: true }),
        { status: 402 }
      ),
    });

    const req = createRequest({ text: "test", level: "balanced" });
    const res = await POST(req);
    expect(res.status).toBe(402);
    expect(mockTrackUsage).not.toHaveBeenCalled();
  });
});
