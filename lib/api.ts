import "server-only";

import { z } from "zod";
import { ApiError } from "@/lib/errors";

export async function parseJson<T>(request: Request, schema: z.ZodType<T>) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "invalid_json", "Request body must be valid JSON.");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(422, "validation_error", z.prettifyError(parsed.error));
  }

  return parsed.data;
}

export function configured(value?: string) {
  return value ? "configured" : "missing";
}

export function publicUser(user: {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  region: string | null;
  district: string | null;
  role: string;
  language: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt?: Date;
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    region: user.region,
    district: user.district,
    role: user.role,
    language: user.language,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
