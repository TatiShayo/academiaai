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

import { POST } from "@/app/api/tools/enhance/route";

function createRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/tools/enhance", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("Academic Enhancer API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckUsage.mockResolvedValue({ userId: "user-1" });
    mockTrackUsage.mockResolvedValue(undefined);
    mockChat.mockResolvedValue(
      "The investigation demonstrates noteworthy findings pertaining to the experimental framework."
    );
  });

  it("enhances text to undergraduate academic level", async () => {
    const req = createRequest({
      text: "The study shows some good results about the experiment.",
      level: "Undergraduate",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.original).toBe("The study shows some good results about the experiment.");
    expect(json.enhanced).toContain("investigation");
    expect(mockTrackUsage).toHaveBeenCalledWith("user-1");
  });

  it("enhances text to PhD level", async () => {
    mockChat.mockResolvedValue(
      "The methodological investigation exhibits empirically rigorous outcomes regarding the experimental framework."
    );

    const req = createRequest({
      text: "The study shows some good results about the experiment.",
      level: "PhD",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.enhanced).toBe(
      "The methodological investigation exhibits empirically rigorous outcomes regarding the experimental framework."
    );
  });

  it("returns word-change highlights", async () => {
    mockChat.mockResolvedValue("The investigation demonstrates remarkable findings.");

    const req = createRequest({
      text: "The study shows good results.",
      level: "Undergraduate",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(json.changes).toBeDefined();
    expect(Array.isArray(json.changes)).toBe(true);
  });

  it("returns 400 when text is missing", async () => {
    const req = createRequest({ level: "Masters" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("defaults to Undergraduate when level is unknown", async () => {
    const req = createRequest({
      text: "Test text for level fallback.",
      level: "Unknown",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
