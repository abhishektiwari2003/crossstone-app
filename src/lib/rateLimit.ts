/**
 * In-memory sliding window rate limiter.
 * Suitable for single-instance deployments.
 * For multi-instance, replace with Redis-backed (@upstash/ratelimit).
 */

type RateLimitEntry = {
    timestamps: number[];
};

type RateLimitConfig = {
    maxRequests: number;
    windowMs: number;
};

type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    resetAt: number;
};

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Periodic cleanup every 5 minutes to prevent memory leaks
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
    if (cleanupInterval) return;
    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [, store] of stores) {
            for (const [key, entry] of store) {
                entry.timestamps = entry.timestamps.filter((t) => now - t < 300_000);
                if (entry.timestamps.length === 0) {
                    store.delete(key);
                }
            }
        }
    }, 300_000); // 5 min cleanup
    // Don't prevent Node.js from exiting
    if (cleanupInterval.unref) cleanupInterval.unref();
}

export function createRateLimiter(name: string, config: RateLimitConfig) {
    const store = new Map<string, RateLimitEntry>();
    stores.set(name, store);
    ensureCleanup();

    return function checkRateLimit(identifier: string): RateLimitResult {
        const now = Date.now();
        const windowStart = now - config.windowMs;

        let entry = store.get(identifier);
        if (!entry) {
            entry = { timestamps: [] };
            store.set(identifier, entry);
        }

        // Remove timestamps outside the window
        entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

        if (entry.timestamps.length >= config.maxRequests) {
            const oldestInWindow = entry.timestamps[0];
            return {
                allowed: false,
                remaining: 0,
                resetAt: oldestInWindow + config.windowMs,
            };
        }

        entry.timestamps.push(now);

        return {
            allowed: true,
            remaining: config.maxRequests - entry.timestamps.length,
            resetAt: now + config.windowMs,
        };
    };
}

// ─── Pre-configured limiters ───

/** Auth endpoints: 5 requests per minute per IP */
export const authLimiter = createRateLimiter("auth", {
    maxRequests: 5,
    windowMs: 60_000,
});

/** Mutation endpoints: 60 requests per minute per user */
export const mutationLimiter = createRateLimiter("mutation", {
    maxRequests: 60,
    windowMs: 60_000,
});

/**
 * Extract client identifier from request headers.
 * Uses X-Forwarded-For, then falls back to a generic key.
 */
export function getClientIdentifier(req: Request, userId?: string): string {
    if (userId) return `user:${userId}`;

    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return `ip:${forwarded.split(",")[0].trim()}`;

    return `ip:unknown`;
}
