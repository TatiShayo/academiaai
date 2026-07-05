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

import { POST } from "@/app/api/tools/citations/route";

function createRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/tools/citations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("Citation Generator API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckUsage.mockResolvedValue({ userId: "user-1" });
    mockTrackUsage.mockResolvedValue(undefined);
    mockChat.mockResolvedValue(
      "Smith, J. (2020). Understanding climate patterns. *Journal of Environmental Science*, 45(2), 112-128."
    );
  });

  it("generates a citation for a given source in APA format", async () => {
    const req = createRequest({
      source: "Understanding climate patterns by John Smith",
      format: "APA",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.source).toBe("Understanding climate patterns by John Smith");
    expect(json.format).toBe("APA");
    expect(json.citation).toContain("Smith");
    expect(json.citation).toContain("2020");
    expect(mockTrackUsage).toHaveBeenCalledWith("user-1");
  });

  it("generates a citation in MLA format", async () => {
    mockChat.mockResolvedValue(
      'Smith, John. "Understanding Climate Patterns." *Journal of Environmental Science*, vol. 45, no. 2, 2020, pp. 112-128.'
    );

    const req = createRequest({
      source: "DOI: 10.1234/envsci.2020",
      format: "MLA",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.format).toBe("MLA");
    expect(json.citation).toContain("Smith");
  });

  it("defaults to APA when no format specified", async () => {
    const req = createRequest({
      source: "Some book title",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.format).toBe("APA");
  });

  it("handles OpenAI error gracefully", async () => {
    mockChat.mockRejectedValueOnce(new Error("OpenAI API error"));

    const req = createRequest({
      source: "Some source",
      format: "APA",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBeDefined();
  });

  it("returns 400 when source is missing", async () => {
    const req = createRequest({ format: "APA" });
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
      source: "A valid source",
      format: "APA",
    });
    const res = await POST(req);
    expect(res.status).toBe(402);
  });
});
