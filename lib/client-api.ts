"use client";

const cache = new Map<string, { expiresAt: number; promise: Promise<unknown> }>();
const DEFAULT_TTL = 30_000;

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const method = init?.method?.toUpperCase() || "GET";
  const cacheKey = `${method}:${url}`;

  if (method === "GET") {
    const hit = cache.get(cacheKey);
    if (hit && hit.expiresAt > Date.now()) {
      return hit.promise as Promise<T>;
    }

    const promise = requestJson<T>(url, init);
    cache.set(cacheKey, { expiresAt: Date.now() + DEFAULT_TTL, promise });
    return promise;
  }

  const result = await requestJson<T>(url, init);
  cache.clear();
  return result;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    error?: { message?: string };
  };

  if (!response.ok || data.success === false) {
    throw new Error(data.error?.message || "Request failed");
  }

  return data as T;
}

export function clearApiCache() {
  cache.clear();
}
