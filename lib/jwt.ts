import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { missingProvider } from "@/lib/errors";

export const AUTH_COOKIE = "agri_smart_token";

export type AuthTokenPayload = {
  userId: string;
  role: "FARMER" | "BUYER" | "ADMIN";
};

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw missingProvider("JWT_SECRET");
  }

  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function signAuthToken(payload: AuthTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (
      typeof payload.userId !== "string" ||
      !["FARMER", "BUYER", "ADMIN"].includes(String(payload.role))
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      role: payload.role as AuthTokenPayload["role"],
    };
  } catch {
    return null;
  }
}
