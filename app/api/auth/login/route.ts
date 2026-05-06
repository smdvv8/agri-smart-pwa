import { NextResponse } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { getPrisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validators";
import { parseJson, publicUser } from "@/lib/api";
import { setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const data = await parseJson(request, loginSchema);
    const prisma = getPrisma();
    const identifier = data.identifier.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: data.identifier }],
      },
    });

    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      throw new ApiError(401, "invalid_credentials", "Invalid login or password.");
    }

    const response = NextResponse.json({ user: publicUser(user) });
    return setAuthCookie(response, { userId: user.id, role: user.role });
  } catch (error) {
    return toErrorResponse(error);
  }
}
