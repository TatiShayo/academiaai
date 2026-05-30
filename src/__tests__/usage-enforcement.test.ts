import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockFrom, mockEq, mockSingle, mockUpsert } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockEq: vi.fn(),
  mockSingle: vi.fn(),
  mockUpsert: vi.fn(),
}));

const chain = {
  select: vi.fn().mockReturnThis(),
  eq: mockEq.mockReturnThis(),
  single: mockSingle,
  upsert: mockUpsert.mockReturnThis(),
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom.mockReturnValue(chain),
  })),
}));

import { getUsage, canProcess, getRemaining, unlockSingle, setPro, setFree, incrementUsage } from "@/lib/usage";

describe("Usage Limits Enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue(chain);
    mockEq.mockReturnValue(chain);
  });

  describe("free tier (3 docs/month)", () => {
    it("allows processing when under limit", async () => {
      mockSingle.mockResolvedValue({
        data: { doc_count: 1, month: getTestMonth(), plan: "free" },
      });

      const allowed = await canProcess("user-1");
      expect(allowed).toBe(true);
    });

    it("blocks processing at limit (3 docs)", async () => {
      mockSingle.mockResolvedValue({
        data: { doc_count: 3, month: getTestMonth(), plan: "free" },
      });

      const allowed = await canProcess("user-2");
      expect(allowed).toBe(false);
    });

    it("shows 3 remaining at start", async () => {
      mockSingle.mockResolvedValue({
        data: { doc_count: 0, month: getTestMonth(), plan: "free" },
      });

      const remaining = await getRemaining("user-3");
      expect(remaining).toBe(3);
    });

    it("shows 0 remaining at limit", async () => {
      mockSingle.mockResolvedValue({
        data: { doc_count: 3, month: getTestMonth(), plan: "free" },
      });

      const remaining = await getRemaining("user-4");
      expect(remaining).toBe(0);
    });

    it("resets count on new month", async () => {
      mockSingle.mockResolvedValue({
        data: { doc_count: 3, month: "2026-04", plan: "free" },
      });

      mockUpsert
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: mockSingle,
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: mockSingle,
        });

      mockSingle.mockResolvedValue({
        data: { doc_count: 0, month: getTestMonth(), plan: "free" },
      });

      const usage = await getUsage("user-5");
      expect(usage.docCount).toBe(0);
      expect(usage.month).toBe(getTestMonth());
      expect(usage.plan).toBe("free");
    });
  });

  describe("pro tier", () => {
    it("always allows processing", async () => {
      mockSingle.mockResolvedValue({
        data: { doc_count: 999, month: getTestMonth(), plan: "pro" },
      });

      const allowed = await canProcess("pro-user");
      expect(allowed).toBe(true);
    });

    it("returns Infinity remaining", async () => {
      mockSingle.mockResolvedValue({
        data: { doc_count: 500, month: getTestMonth(), plan: "pro" },
      });

      const remaining = await getRemaining("pro-user");
      expect(remaining).toBe(Infinity);
    });
  });

  describe("unlocked tier (pay-per-doc, 1 doc)", () => {
    it("allows processing with 0 docs used", async () => {
      mockSingle.mockResolvedValue({
        data: { doc_count: 0, month: getTestMonth(), plan: "unlocked" },
      });

      const allowed = await canProcess("unlocked-user");
      expect(allowed).toBe(true);
    });

    it("blocks processing after using the single doc", async () => {
      mockSingle.mockResolvedValue({
        data: { doc_count: 1, month: getTestMonth(), plan: "unlocked" },
      });

      const allowed = await canProcess("unlocked-user-2");
      expect(allowed).toBe(false);
    });

    it("starts with doc_count 0 after unlock", async () => {
      mockUpsert.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      });

      await unlockSingle("payer-1");
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ doc_count: 0, plan: "unlocked" }),
        { onConflict: "user_id" }
      );
    });
  });

  describe("setPro", () => {
    it("sets user to pro with 0 docs", async () => {
      mockUpsert.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      });

      await setPro("pro-user-1");
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ plan: "pro", doc_count: 0 }),
        { onConflict: "user_id" }
      );
    });
  });

  describe("setFree", () => {
    it("downgrades user to free with 0 docs", async () => {
      mockUpsert.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      });

      await setFree("ex-pro-user");
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ plan: "free", doc_count: 0 }),
        { onConflict: "user_id" }
      );
    });
  });

  describe("incrementUsage", () => {
    it("increases count by 1", async () => {
      mockSingle.mockResolvedValueOnce({
        data: { doc_count: 1, month: getTestMonth(), plan: "free" },
      });

      mockUpsert.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { doc_count: 2, month: getTestMonth(), plan: "free" },
        }),
      });

      const result = await incrementUsage("user-6");
      expect(result.docCount).toBe(2);
    });
  });
});

function getTestMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
