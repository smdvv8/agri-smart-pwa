import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/errors";
import { getPrisma } from "@/lib/prisma";
import { AUTH_COOKIE, signAuthToken, verifyAuthToken } from "@/lib/jwt";

export async function setAuthCookie(
  response: NextResponse,
  payload: { userId: string; role: "FARMER" | "BUYER" | "ADMIN" },
) {
  const token = await signAuthToken(payload);

  response.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  return verifyAuthToken(token);
}

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    throw new ApiError(401, "unauthorized", "Authentication is required.");
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      region: true,
      district: true,
      role: true,
      language: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "unauthorized", "User session is no longer valid.");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new ApiError(403, "forbidden", "Admin access is required.");
  }

  return user;
}
