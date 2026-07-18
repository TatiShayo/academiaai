import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Regression test for the e2e-bypass abuse chain.
 *
 * Before the fix, `checkUsage()` honoured the `e2e-bypass=true` cookie in ALL
 * environments. Because the cookie was also set with httpOnly:false, any client
 * could set it and obtain an authenticated, unlimited context: bypassing auth,
 * rate limiting AND per-user quota on every LLM endpoint (denial-of-wallet).
 *
 * The fix gates the bypass behind an explicit E2E_TEST_MODE=true opt-in that
 * production deployments never set. This test proves that without that flag the
 * cookie no longer grants access and an unauthenticated caller is rejected with
 * 401, while a test-mode server still permits it.
 */

const { mockCookies, mockGetUser } = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockGetUser: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mockCookies }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mockGetUser } })),
}));
vi.mock("@/lib/usage", () => ({
  getUsage: vi.fn(async () => ({ plan: "free", docCount: 0, month: "2026-07" })),
  canProcess: vi.fn(async () => true),
  incrementUsage: vi.fn(),
  incrementWordsProcessed: vi.fn(),
}));

describe("e2e-bypass guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate an attacker presenting the forged bypass cookie.
    mockCookies.mockResolvedValue({
      get: (name: string) => (name === "e2e-bypass" ? { value: "true" } : undefined),
    });
    // No authenticated Supabase session.
    mockGetUser.mockResolvedValue({ data: { user: null } });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("ignores the bypass cookie when E2E_TEST_MODE is unset and rejects with 401", async () => {
    vi.stubEnv("E2E_TEST_MODE", "");
    const { checkUsage } = await import("@/lib/tool-guard");

    const result = await checkUsage();

    expect(result.userId).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(401);
  });

  it("allows the bypass only when the server is explicitly in E2E_TEST_MODE", async () => {
    vi.stubEnv("E2E_TEST_MODE", "true");
    const { checkUsage } = await import("@/lib/tool-guard");

    const result = await checkUsage();

    expect(result.userId).toBe("e2e-test-user");
    expect(result.error).toBeUndefined();
  });
});
