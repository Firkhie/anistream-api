import { Redis } from "@upstash/redis";

import { env } from "./env.js";

/**
 * Optional Upstash Redis client. `null` when credentials are not configured,
 * in which case caching is safely skipped (fail-open).
 */
export const redis
  = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Safe Redis GET helper that never throws on connection errors.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis || env.NODE_ENV === "test") {
    return null;
  }

  try {
    const data = await redis.get<T>(key);
    return data ?? null;
  }
  catch (error) {
    console.warn(`[Redis GET Failed] key: ${key}`, (error as Error).message);
    return null;
  }
}

/**
 * Safe Redis SET helper with TTL that never throws on connection errors.
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (!redis || env.NODE_ENV === "test") {
    return;
  }

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  }
  catch (error) {
    console.warn(`[Redis SET Failed] key: ${key}`, (error as Error).message);
  }
}

/**
 * Safe Redis DELETE helper.
 */
export async function deleteCache(key: string): Promise<void> {
  if (!redis || env.NODE_ENV === "test") {
    return;
  }

  try {
    await redis.del(key);
  }
  catch (error) {
    console.warn(`[Redis DEL Failed] key: ${key}`, (error as Error).message);
  }
}

/**
 * Robust cache-aside helper:
 * 1. Checks cache first.
 * 2. On cache miss or cache error, executes fetcher().
 * 3. Populates cache asynchronously in the background.
 * Guarantees zero unhandled exceptions or 500 errors from Redis.
 */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const fresh = await fetcher();

  if (fresh !== null && fresh !== undefined) {
    await setCache(key, fresh, ttlSeconds);
  }

  return fresh;
}
