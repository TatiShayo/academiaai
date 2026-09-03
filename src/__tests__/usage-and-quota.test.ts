import { describe, it, expect, beforeEach } from "vitest";
import {
  getUsage,
  incrementUsage,
  isOverLimit,
  canProcess,
  getRemaining,
  getLimit,
  unlockSingle,
  setPro,
  setFree,
  FREE_LIMIT,
  UNLOCKED_LIMIT,
} from "../lib/usage-limits";

describe("Usage and Quota Enforcement", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with free plan and 0 document count", () => {
    const usage = getUsage();
    expect(usage.count).toBe(0);
    expect(usage.plan).toBe("free");
    expect(canProcess()).toBe(true);
    expect(isOverLimit()).toBe(false);
    expect(getRemaining()).toBe(FREE_LIMIT);
  });

  it("increments usage count correctly and respects free limit", () => {
    expect(canProcess()).toBe(true);
    expect(isOverLimit()).toBe(false);

    incrementUsage(); // 1
    expect(getUsage().count).toBe(1);
    expect(canProcess()).toBe(true);
    expect(isOverLimit()).toBe(false);
    expect(getRemaining()).toBe(2);

    incrementUsage(); // 2
    expect(getUsage().count).toBe(2);
    expect(canProcess()).toBe(true);
    expect(isOverLimit()).toBe(false);
    expect(getRemaining()).toBe(1);

    incrementUsage(); // 3 (hits limit)
    expect(getUsage().count).toBe(3);
    expect(canProcess()).toBe(false);
    expect(isOverLimit()).toBe(true);
    expect(getRemaining()).toBe(0);

    incrementUsage(); // 4 (exceeds limit)
    expect(getUsage().count).toBe(4);
    expect(canProcess()).toBe(false);
    expect(isOverLimit()).toBe(true);
    expect(getRemaining()).toBe(0);
  });

  it("handles pay-per-doc single unlock correctly", () => {
    // Exceed free limit
    incrementUsage();
    incrementUsage();
    incrementUsage();
    expect(canProcess()).toBe(false);

    // Purchase single doc unlock
    unlockSingle();
    const unlocked = getUsage();
    expect(unlocked.plan).toBe("unlocked");
    expect(unlocked.count).toBe(0);
    expect(getLimit()).toBe(UNLOCKED_LIMIT);
    expect(canProcess()).toBe(true);
    expect(getRemaining()).toBe(1);

    // Consume single doc
    incrementUsage();
    expect(canProcess()).toBe(false);
    expect(isOverLimit()).toBe(true);
    expect(getRemaining()).toBe(0);
  });

  it("handles Pro unlimited plan correctly", () => {
    setPro();
    const pro = getUsage();
    expect(pro.plan).toBe("pro");
    expect(canProcess()).toBe(true);
    expect(isOverLimit()).toBe(false);
    expect(getRemaining()).toBe(Infinity);

    // Increment 50 times
    for (let i = 0; i < 50; i++) {
      incrementUsage();
    }
    expect(canProcess()).toBe(true);
    expect(isOverLimit()).toBe(false);
    expect(getRemaining()).toBe(Infinity);
  });

  it("resets back to free plan properly", () => {
    setPro();
    expect(getUsage().plan).toBe("pro");

    setFree();
    const reset = getUsage();
    expect(reset.plan).toBe("free");
    expect(reset.count).toBe(0);
    expect(canProcess()).toBe(true);
  });
});
