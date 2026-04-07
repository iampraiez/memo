import { NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    reset: number;
  };
}

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Note: In a real production scale-out (multiple instances), use Redis.
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000,
) {
  const now = Date.now();
  const record = store[identifier] || { count: 0, reset: now + windowMs };

  if (now > record.reset) {
    record.count = 0;
    record.reset = now + windowMs;
  }

  record.count++;
  store[identifier] = record;

  if (record.count > limit) {
    return {
      success: false,
      response: NextResponse.json(
        { message: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(record.reset / 1000).toString(),
          },
        },
      ),
    };
  }

  return {
    success: true,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": (limit - record.count).toString(),
      "X-RateLimit-Reset": Math.ceil(record.reset / 1000).toString(),
    },
  };
}
