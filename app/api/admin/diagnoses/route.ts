import { toErrorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const prisma = getPrisma();
    const diagnoses = await prisma.diagnosisHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        crop: true,
        region: true,
        user: { select: { id: true, fullName: true, phone: true, email: true } },
      },
    });

    return Response.json({ diagnoses });
  } catch (error) {
    return toErrorResponse(error);
  }
}
