import "server-only";

import { ApiError, externalServiceError, missingProvider } from "@/lib/errors";

type HuggingFaceClassification = {
  label: string;
  score: number;
};

type HuggingFaceError = {
  error?: string;
  estimated_time?: number;
};

const DEFAULT_PLANT_MODEL = "wambugu71/crop_leaf_diseases_vit";

export async function classifyPlantImage(buffer: Buffer, mimeType: string) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw missingProvider("HUGGINGFACE_API_KEY");
  }

  const configuredModel = process.env.HUGGINGFACE_PLANT_MODEL?.trim();
  const baseUrl =
    process.env.HUGGINGFACE_API_BASE_URL?.trim() ||
    "https://router.huggingface.co/hf-inference/models";
  const models = Array.from(
    new Set([configuredModel || DEFAULT_PLANT_MODEL, DEFAULT_PLANT_MODEL].filter(Boolean)),
  );

  const body = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;

  let lastError: Error | null = null;
  for (const model of models) {
    try {
      return await classifyWithModel({
        apiKey,
        baseUrl,
        body,
        mimeType,
        model,
      });
    } catch (error) {
      if (canRetryWithAnotherModel(error) && model !== DEFAULT_PLANT_MODEL) {
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? externalServiceError("Hugging Face", "no supported plant disease model is available");
}

async function classifyWithModel({
  apiKey,
  baseUrl,
  body,
  mimeType,
  model,
}: {
  apiKey: string;
  baseUrl: string;
  body: ArrayBuffer;
  mimeType: string;
  model: string;
}) {
  const url = `${baseUrl.replace(/\/$/, "")}/${model}`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": mimeType,
    Accept: "application/json",
    "x-wait-for-model": "true",
  };

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers,
    body,
  });

  const text = await response.text();
  if (!response.ok) {
    const retryable = response.status === 503 || response.status === 504;
    if (retryable) {
      await delay(1800);
      const retry = await fetchWithTimeout(url, {
        method: "POST",
        headers,
        body,
      });
      return parseClassificationResponse(retry, model);
    }

    throw externalServiceError("Hugging Face", normalizeHfError(text, response.statusText));
  }

  return parseClassificationText(text, model);
}

async function parseClassificationResponse(response: Response, model: string) {
  const text = await response.text();
  if (!response.ok) {
    throw externalServiceError("Hugging Face", normalizeHfError(text, response.statusText));
  }

  return parseClassificationText(text, model);
}

function parseClassificationText(text: string, model: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw externalServiceError("Hugging Face", "response was not valid JSON");
  }

  if (isHuggingFaceError(parsed)) {
    throw externalServiceError("Hugging Face", parsed.error || "model is not available");
  }

  const rows = Array.isArray(parsed)
    ? Array.isArray(parsed[0])
      ? parsed[0]
      : parsed
    : parsed;

  if (!Array.isArray(rows) || rows.length === 0) {
    throw externalServiceError("Hugging Face", "no image classification result");
  }

  const best = rows[0] as Partial<HuggingFaceClassification>;
  if (typeof best.label !== "string" || typeof best.score !== "number") {
    throw externalServiceError("Hugging Face", "unexpected classification shape");
  }

  return {
    model,
    label: best.label,
    confidence: best.score,
    candidates: rows as HuggingFaceClassification[],
  };
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw externalServiceError("Hugging Face", "request timed out after 45 seconds");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isHuggingFaceError(value: unknown): value is HuggingFaceError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as HuggingFaceError).error === "string"
  );
}

function normalizeHfError(text: string, fallback: string) {
  const trimmed = text.trim();

  try {
    const parsed = JSON.parse(trimmed) as HuggingFaceError;
    if (parsed.error) return parsed.error;
  } catch {
    if (trimmed.startsWith("<!DOCTYPE html") || trimmed.startsWith("<html")) {
      return "received an HTML error page instead of a JSON inference response";
    }
  }

  return trimmed || fallback;
}

function canRetryWithAnotherModel(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false;
  }

  return /Model not supported by provider/i.test(error.message);
}
