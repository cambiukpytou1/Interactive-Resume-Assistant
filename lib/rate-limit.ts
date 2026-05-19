/**
 * lib/rate-limit.ts
 *
 * Simple in-memory sliding-window rate limiter for the /api/chat endpoint.
 *
 * Limits each IP to MAX_REQUESTS requests per WINDOW_MS milliseconds.
 * In-memory is fine for a single-instance Vercel serverless function —
 * the window resets naturally when the function instance is recycled.
 *
 * Defaults: 10 requests per 60 seconds per IP.
 */

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000; // 60 seconds

type WindowEntry = {
  timestamps: number[];
};

// Module-level map — persists across requests within the same function instance
const store = new Map<string, WindowEntry>();

// Prune old entries every 5 minutes to prevent unbounded memory growth
let lastPruned = Date.now();
function maybePrune() {
  const now = Date.now();
  if (now - lastPruned < 5 * 60_000) return;
  lastPruned = now;
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  maybePrune();

  const now = Date.now();
  const entry = store.get(ip) ?? { timestamps: [] };

  // Drop timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldest = entry.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    store.set(ip, entry);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.timestamps.push(now);
  store.set(ip, entry);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.timestamps.length,
    retryAfterSeconds: 0
  };
}
