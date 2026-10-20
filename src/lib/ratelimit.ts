import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Free service, so we cap spend in three ways:
//   - a short burst limit per visitor (stops scripts hammering the API)
//   - a daily limit per visitor (a browser, identified by an anonymous cookie)
//   - a daily limit per network, so clearing cookies can't get unlimited marks
//     (set high because a whole school shares one IP address)
//   - a global daily cap across everyone (a hard ceiling on the bill)
export const PER_VISITOR_PER_DAY = Number(process.env.LIMIT_PER_VISITOR_PER_DAY || 10);
export const PER_VISITOR_PER_MINUTE = Number(process.env.LIMIT_PER_VISITOR_PER_MINUTE || 4);
export const PER_NETWORK_PER_DAY = Number(process.env.LIMIT_PER_NETWORK_PER_DAY || 400);
export const GLOBAL_PER_DAY = Number(process.env.LIMIT_GLOBAL_PER_DAY || 1500);

export type LimitResult =
  | { ok: true; remainingToday: number }
  | { ok: false; reason: "burst" | "daily" | "network" | "global"; retryAfterSeconds: number };

interface Limiter {
  check(visitor: Visitor): Promise<LimitResult>;
}

export interface Visitor {
  id: string;
  network: string;
}

class UpstashLimiter implements Limiter {
  private burst: Ratelimit;
  private daily: Ratelimit;
  private network: Ratelimit;
  private global: Ratelimit;

  constructor(redis: Redis) {
    this.burst = new Ratelimit({ redis, prefix: "mma:burst", limiter: Ratelimit.slidingWindow(PER_VISITOR_PER_MINUTE, "1 m") });
    this.daily = new Ratelimit({ redis, prefix: "mma:daily", limiter: Ratelimit.fixedWindow(PER_VISITOR_PER_DAY, "1 d") });
    this.network = new Ratelimit({ redis, prefix: "mma:network", limiter: Ratelimit.fixedWindow(PER_NETWORK_PER_DAY, "1 d") });
    this.global = new Ratelimit({ redis, prefix: "mma:global", limiter: Ratelimit.fixedWindow(GLOBAL_PER_DAY, "1 d") });
  }

  async check(visitor: Visitor): Promise<LimitResult> {
    const secs = (reset: number) => Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    const burst = await this.burst.limit(visitor.id);
    if (!burst.success) return { ok: false, reason: "burst", retryAfterSeconds: secs(burst.reset) };
    const daily = await this.daily.limit(visitor.id);
    if (!daily.success) return { ok: false, reason: "daily", retryAfterSeconds: secs(daily.reset) };
    const network = await this.network.limit(visitor.network);
    if (!network.success) return { ok: false, reason: "network", retryAfterSeconds: secs(network.reset) };
    const global = await this.global.limit("all");
    if (!global.success) return { ok: false, reason: "global", retryAfterSeconds: secs(global.reset) };
    return { ok: true, remainingToday: daily.remaining };
  }
}

// Used in local development when Upstash isn't configured. Per-process only,
// so not suitable for production on serverless hosting.
class MemoryLimiter implements Limiter {
  private hits = new Map<string, number[]>();

  private count(key: string, windowMs: number, max: number): { ok: boolean; remaining: number; retryAfterSeconds: number } {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      this.hits.set(key, recent);
      return { ok: false, remaining: 0, retryAfterSeconds: Math.ceil((recent[0] + windowMs - now) / 1000) };
    }
    recent.push(now);
    this.hits.set(key, recent);
    return { ok: true, remaining: max - recent.length, retryAfterSeconds: 0 };
  }

  async check(visitor: Visitor): Promise<LimitResult> {
    const day = 24 * 60 * 60 * 1000;
    const burst = this.count(`b:${visitor.id}`, 60_000, PER_VISITOR_PER_MINUTE);
    if (!burst.ok) return { ok: false, reason: "burst", retryAfterSeconds: burst.retryAfterSeconds };
    const daily = this.count(`d:${visitor.id}`, day, PER_VISITOR_PER_DAY);
    if (!daily.ok) return { ok: false, reason: "daily", retryAfterSeconds: daily.retryAfterSeconds };
    const network = this.count(`n:${visitor.network}`, day, PER_NETWORK_PER_DAY);
    if (!network.ok) return { ok: false, reason: "network", retryAfterSeconds: network.retryAfterSeconds };
    const global = this.count("g", day, GLOBAL_PER_DAY);
    if (!global.ok) return { ok: false, reason: "global", retryAfterSeconds: global.retryAfterSeconds };
    return { ok: true, remainingToday: daily.remaining };
  }
}

let limiter: Limiter | null = null;

export function getLimiter(): Limiter {
  if (!limiter) {
    // The Vercel Marketplace integration may set KV_* names instead; Redis.fromEnv reads both.
    const env = process.env;
    const hasUpstash =
      (env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL) &&
      (env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN);
    limiter = hasUpstash ? new UpstashLimiter(Redis.fromEnv()) : new MemoryLimiter();
  }
  return limiter;
}

export const VISITOR_COOKIE = "mma_id";
const VISITOR_ID = /^[0-9a-f-]{36}$/;

// Schools put every student behind one IP address, so the per-visitor limits
// key on an anonymous random ID kept in a cookie, not on the IP.
export function identifyVisitor(headers: Headers, cookie: string | undefined): { visitor: Visitor; isNew: boolean } {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const network = forwarded || headers.get("x-real-ip") || "unknown";
  if (cookie && VISITOR_ID.test(cookie)) return { visitor: { id: cookie, network }, isNew: false };
  return { visitor: { id: crypto.randomUUID(), network }, isNew: true };
}
