import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockConstructEvent, mockIsStripeConfigured, mockSetPro, mockSetFree, mockUnlockSingle, mockInsert } =
  vi.hoisted(() => ({
    mockConstructEvent: vi.fn(),
    mockIsStripeConfigured: vi.fn(),
    mockSetPro: vi.fn(),
    mockSetFree: vi.fn(),
    mockUnlockSingle: vi.fn(),
    mockInsert: vi.fn(),
  }));

vi.mock("next/headers", () => ({
  headers: async () => ({ get: () => "sig_test" }),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  },
  isStripeConfigured: mockIsStripeConfigured,
}));

vi.mock("@/lib/usage", () => ({
  setPro: mockSetPro,
  setFree: mockSetFree,
  unlockSingle: mockUnlockSingle,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: mockInsert,
    }),
  }),
}));

import { POST } from "@/app/api/stripe/webhook/route";

const EVENT = {
  id: "evt_replay_probe_001",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_001",
      metadata: { user_id: "user-pro-1", type: "pro" },
    },
  },
};

function postWebhook() {
  return POST(
    new NextRequest("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: JSON.stringify(EVENT),
    })
  );
}

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsStripeConfigured.mockReturnValue(true);
    mockConstructEvent.mockReturnValue(EVENT);
    mockInsert.mockResolvedValue({ error: null });
    mockSetPro.mockResolvedValue(undefined);
  });

  it("returns 503 when Stripe is not configured (never silently acks)", async () => {
    mockIsStripeConfigured.mockReturnValue(false);

    const res = await postWebhook();
    expect(res.status).toBe(503);
    expect(mockConstructEvent).not.toHaveBeenCalled();
  });

  it("provisions the plan on first delivery", async () => {
    const res = await postWebhook();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
    expect(mockSetPro).toHaveBeenCalledWith("user-pro-1");
    expect(mockInsert).toHaveBeenCalledWith({ id: "evt_replay_probe_001", type: "checkout.session.completed" });
  });

  it("acks a replayed event as duplicate without provisioning twice", async () => {
    mockInsert
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { code: "23505" } });

    const first = await postWebhook();
    expect(first.status).toBe(200);

    const second = await postWebhook();
    expect(second.status).toBe(200);
    const json = await second.json();
    expect(json.duplicate).toBe(true);

    // setPro ran exactly once across both deliveries.
    expect(mockSetPro).toHaveBeenCalledTimes(1);
  });

  it("fails closed (500) when the ledger write errors", async () => {
    mockInsert.mockResolvedValue({ error: { code: "500", message: "ledger down" } });

    const res = await postWebhook();
    expect(res.status).toBe(500);
    expect(mockSetPro).not.toHaveBeenCalled();
  });
});
