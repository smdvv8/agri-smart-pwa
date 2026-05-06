import "server-only";

import { NextRequest } from "next/server";
import { ApiError } from "@/lib/errors";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimit(
  request: NextRequest,
  options: { key: string; limit: number; windowMs: number },
) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "local";
  const bucketKey = `${options.key}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  if (bucket.count >= options.limit) {
    throw new ApiError(
      429,
      "rate_limited",
      "Too many requests. Please wait before trying again.",
    );
  }

  bucket.count += 1;
}
