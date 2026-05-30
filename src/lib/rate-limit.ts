const rateLimitMap = new Map<string, { timestamps: number[] }>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const FREE_LIMIT = 3;

export function checkRateLimit(userId: string, isPro: boolean): { allowed: boolean; retryAfter?: number } {
  if (isPro) return { allowed: true };

  const now = Date.now();
  let entry = rateLimitMap.get(userId);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitMap.set(userId, entry);
  }

  entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (entry.timestamps.length >= FREE_LIMIT) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.timestamps.push(now);
  return { allowed: true };
}

// Clean up stale entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);
      if (entry.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }, WINDOW_MS);
}

const apiRateLimitMap = new Map<string, { count: number; dayStart: number }>();
const API_LIMIT_PRO = 100;
const API_LIMIT_BUSINESS = 1000;

export function checkApiRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  let entry = apiRateLimitMap.get(userId);

  if (!entry || now - entry.dayStart > oneDayMs) {
    entry = { count: 0, dayStart: now };
    apiRateLimitMap.set(userId, entry);
  }

  const limit = API_LIMIT_PRO;

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

// Clean up stale API entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    for (const [key, entry] of apiRateLimitMap) {
      if (now - entry.dayStart > oneDayMs) {
        apiRateLimitMap.delete(key);
      }
    }
  }, 60 * 60 * 1000); // hourly cleanup
}
