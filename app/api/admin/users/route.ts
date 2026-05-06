import { toErrorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const prisma = getPrisma();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        region: true,
        district: true,
        role: true,
        language: true,
        createdAt: true,
      },
    });

    return Response.json({ users });
  } catch (error) {
    return toErrorResponse(error);
  }
}
