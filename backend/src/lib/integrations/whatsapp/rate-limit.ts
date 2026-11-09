const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const MAX_KEYS = 4000;

export function checkSenderRateLimit(waId: string): { allowed: boolean } {
  const now = Date.now();
  const key = waId || 'unknown';
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    if (buckets.size > MAX_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  b.count += 1;
  return { allowed: b.count <= MAX_PER_WINDOW };
}

export function _resetRateLimits() {
  buckets.clear();
}
