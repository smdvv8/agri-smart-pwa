import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "agri_smart_token";

const protectedPrefixes = [
  "/dashboard",
  "/weather",
  "/diagnosis",
  "/irrigation",
  "/ai-chat",
  "/crop-guide",
  "/history",
  "/profile",
  "/settings",
  "/market",
];

async function verifyToken(token?: string) {
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET),
    );

    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth =
    protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.startsWith("/admin");

  if (!needsAuth) return NextResponse.next();

  const session = await verifyToken(request.cookies.get(AUTH_COOKIE)?.value);
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.set("error", "admin_required");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/weather/:path*",
    "/diagnosis/:path*",
    "/irrigation/:path*",
    "/ai-chat/:path*",
    "/crop-guide/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/market/:path*",
    "/admin/:path*",
  ],
};
