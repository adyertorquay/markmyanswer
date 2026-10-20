import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { MODEL, type Feedback, type MarkRequest } from "./marker";

// The same answer to the same question always gets the same feedback. Marking
// is not fully deterministic, so without this a student (or teacher) who
// resubmits an unchanged answer can see the mark move by one. It also saves
// the cost of marking it again.
const TTL_SECONDS = 60 * 60 * 24 * 90;

interface FeedbackCache {
  get(key: string): Promise<Feedback | null>;
  set(key: string, feedback: Feedback): Promise<void>;
}

class UpstashCache implements FeedbackCache {
  constructor(private redis: Redis) {}

  get(key: string) {
    return this.redis.get<Feedback>(`mma:feedback:${key}`);
  }

  async set(key: string, feedback: Feedback) {
    await this.redis.set(`mma:feedback:${key}`, feedback, { ex: TTL_SECONDS });
  }
}

// Local development only: per-process, like MemoryLimiter.
class MemoryCache implements FeedbackCache {
  private entries = new Map<string, Feedback>();

  async get(key: string) {
    return this.entries.get(key) ?? null;
  }

  async set(key: string, feedback: Feedback) {
    this.entries.set(key, feedback);
  }
}

let cache: FeedbackCache | null = null;

export function getFeedbackCache(): FeedbackCache {
  if (!cache) {
    const env = process.env;
    const hasUpstash =
      (env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL) &&
      (env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN);
    cache = hasUpstash ? new UpstashCache(Redis.fromEnv()) : new MemoryCache();
  }
  return cache;
}

// Whitespace differences (an extra space or blank line) don't change the mark.
const normalise = (text?: string) => (text ?? "").replace(/\s+/g, " ").trim();

export function feedbackKey(req: MarkRequest): string {
  const parts = [
    MODEL,
    req.type.type,
    req.marks,
    normalise(req.question),
    normalise(req.context),
    normalise(req.answer),
    normalise(req.previousAnswer),
    req.previousMark ?? "",
  ];
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}
