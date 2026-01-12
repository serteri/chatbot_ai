import Bottleneck from 'bottleneck';

// Rate limit configurations by plan
const RATE_LIMITS = {
    free: { maxConcurrent: 2, minTime: 3000, reservoir: 20, reservoirRefreshAmount: 20, reservoirRefreshInterval: 60 * 1000 },
    pro: { maxConcurrent: 5, minTime: 600, reservoir: 100, reservoirRefreshAmount: 100, reservoirRefreshInterval: 60 * 1000 },
    business: { maxConcurrent: 10, minTime: 120, reservoir: 500, reservoirRefreshAmount: 500, reservoirRefreshInterval: 60 * 1000 },
    enterprise: { maxConcurrent: 50, minTime: 20, reservoir: 5000, reservoirRefreshAmount: 5000, reservoirRefreshInterval: 60 * 1000 },
};

// Store for IP-based limiters
const ipLimiters = new Map<string, { limiter: Bottleneck; timestamp: number }>();

// Store for user-based limiters
const userLimiters = new Map<string, { limiter: Bottleneck; timestamp: number }>();

// Cleanup old limiters every 10 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000;
const LIMITER_TTL = 30 * 60 * 1000; // 30 minutes TTL

let lastCleanup = Date.now();

function cleanupOldLimiters() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;

    lastCleanup = now;

    for (const [key, value] of ipLimiters.entries()) {
        if (now - value.timestamp > LIMITER_TTL) {
            ipLimiters.delete(key);
        }
    }

    for (const [key, value] of userLimiters.entries()) {
        if (now - value.timestamp > LIMITER_TTL) {
            userLimiters.delete(key);
        }
    }
}

export type PlanType = 'free' | 'pro' | 'business' | 'enterprise';

function createLimiter(plan: PlanType): Bottleneck {
    const config = RATE_LIMITS[plan];
    return new Bottleneck({
        maxConcurrent: config.maxConcurrent,
        minTime: config.minTime,
        reservoir: config.reservoir,
        reservoirRefreshAmount: config.reservoirRefreshAmount,
        reservoirRefreshInterval: config.reservoirRefreshInterval,
    });
}

/**
 * Get or create a rate limiter for an IP address
 * Used for unauthenticated requests
 */
export function getIpLimiter(ip: string): Bottleneck {
    cleanupOldLimiters();

    const existing = ipLimiters.get(ip);
    if (existing) {
        existing.timestamp = Date.now();
        return existing.limiter;
    }

    // Unauthenticated requests get the strictest limits
    const limiter = createLimiter('free');
    ipLimiters.set(ip, { limiter, timestamp: Date.now() });
    return limiter;
}

/**
 * Get or create a rate limiter for a user based on their plan
 */
export function getUserLimiter(userId: string, plan: PlanType = 'free'): Bottleneck {
    cleanupOldLimiters();

    const key = `${userId}:${plan}`;
    const existing = userLimiters.get(key);
    if (existing) {
        existing.timestamp = Date.now();
        return existing.limiter;
    }

    const limiter = createLimiter(plan);
    userLimiters.set(key, { limiter, timestamp: Date.now() });
    return limiter;
}

export interface RateLimitResult {
    allowed: boolean;
    retryAfter?: number;
    remaining?: number;
}

/**
 * Check if a request is rate limited
 * Returns immediately without actually consuming quota
 */
export async function checkRateLimit(
    identifier: string,
    type: 'ip' | 'user' = 'ip',
    plan: PlanType = 'free'
): Promise<RateLimitResult> {
    const limiter = type === 'ip'
        ? getIpLimiter(identifier)
        : getUserLimiter(identifier, plan);

    const reservoir = await limiter.currentReservoir();

    if (reservoir !== null && reservoir <= 0) {
        return {
            allowed: false,
            retryAfter: Math.ceil(RATE_LIMITS[plan].reservoirRefreshInterval / 1000),
            remaining: 0,
        };
    }

    return {
        allowed: true,
        remaining: reservoir ?? undefined,
    };
}

/**
 * Wrap an async function with rate limiting
 * Will queue if rate limited, or reject if queue is full
 */
export async function withRateLimit<T>(
    identifier: string,
    fn: () => Promise<T>,
    options: {
        type?: 'ip' | 'user';
        plan?: PlanType;
        priority?: number;
    } = {}
): Promise<T> {
    const { type = 'ip', plan = 'free', priority = 5 } = options;

    const limiter = type === 'ip'
        ? getIpLimiter(identifier)
        : getUserLimiter(identifier, plan);

    return limiter.schedule({ priority }, fn);
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
    plan: PlanType = 'free',
    remaining?: number
): Record<string, string> {
    const config = RATE_LIMITS[plan];
    return {
        'X-RateLimit-Limit': String(config.reservoir),
        'X-RateLimit-Remaining': String(remaining ?? config.reservoir),
        'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + Math.ceil(config.reservoirRefreshInterval / 1000)),
    };
}

/**
 * Rate limit error response
 */
export function rateLimitExceededResponse(retryAfter: number = 60) {
    return new Response(
        JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter,
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(retryAfter),
            },
        }
    );
}
