const buckets = new Map<string, { tokens: number; lastRefill: number }>();

interface RateLimitConfig {
  maxTokens: number;
  refillRate: number;
  refillInterval: number;
}

const limits: Record<string, RateLimitConfig> = {
  "meals/analyze": { maxTokens: 10, refillRate: 10, refillInterval: 60000 },
  "meals/analyze-text": { maxTokens: 20, refillRate: 20, refillInterval: 60000 },
  "meals/suggest": { maxTokens: 10, refillRate: 10, refillInterval: 60000 },
  "meals/nlp-edit": { maxTokens: 10, refillRate: 10, refillInterval: 60000 },
};

export function checkRateLimit(
  userId: string,
  endpoint: string
): { allowed: boolean; retryAfter?: number } {
  const config = limits[endpoint];
  if (!config) return { allowed: true };

  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: config.maxTokens, lastRefill: now };
    buckets.set(key, bucket);
  }

  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(elapsed / config.refillInterval) * config.refillRate;
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(config.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return { allowed: true };
  }

  const retryAfter = Math.ceil((config.refillInterval - elapsed) / 1000);
  return { allowed: false, retryAfter };
}
