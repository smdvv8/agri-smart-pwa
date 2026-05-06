import { NextResponse } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { getPrisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validators";
import { parseJson, publicUser } from "@/lib/api";
import { setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const data = await parseJson(request, registerSchema);
    const prisma = getPrisma();

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { phone: data.phone }] },
    });

    if (existing) {
      throw new ApiError(
        409,
        "user_exists",
        "User with this email or phone already exists.",
      );
    }

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        passwordHash: await hashPassword(data.password),
        region: data.region || null,
        district: data.district || null,
        role: data.role,
        language: data.language,
      },
    });

    const response = NextResponse.json({ user: publicUser(user) }, { status: 201 });
    return setAuthCookie(response, { userId: user.id, role: user.role });
  } catch (error) {
    return toErrorResponse(error);
  }
}
