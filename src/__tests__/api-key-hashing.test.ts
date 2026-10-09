import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSingle, mockEq, mockUpdateEq } = vi.hoisted(() => ({
  mockSingle: vi.fn(),
  mockEq: vi.fn(),
  mockUpdateEq: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: mockEq.mockReturnValue({ single: mockSingle }),
      }),
      update: () => ({
        eq: mockUpdateEq.mockResolvedValue({ error: null }),
      }),
    }),
  }),
}));

import { hashApiKey, resolveApiKey } from "@/lib/api-key-auth";

describe("API key hashing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("produces a deterministic 64-char hex digest", () => {
    const hash = hashApiKey("acad_abc123");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashApiKey("acad_abc123")).toBe(hash);
  });

  it("produces different digests for different keys", () => {
    expect(hashApiKey("acad_a")).not.toBe(hashApiKey("acad_b"));
  });

  it("never returns the plaintext key in the digest", () => {
    expect(hashApiKey("acad_supersecret")).not.toContain("acad_supersecret");
  });
});

describe("resolveApiKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves a valid key to its user id", async () => {
    mockSingle.mockResolvedValue({ data: { user_id: "user-1", revoked: false }, error: null });

    await expect(resolveApiKey("acad_valid")).resolves.toEqual({ userId: "user-1" });
    // Lookup must be by hash, never by plaintext.
    expect(mockEq).toHaveBeenCalledWith("api_key_hash", hashApiKey("acad_valid"));
  });

  it("rejects a revoked key", async () => {
    mockSingle.mockResolvedValue({ data: { user_id: "user-1", revoked: true }, error: null });
    await expect(resolveApiKey("acad_revoked")).resolves.toBeNull();
  });

  it("rejects an unknown key", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "no rows" } });
    await expect(resolveApiKey("acad_unknown")).resolves.toBeNull();
  });
});
