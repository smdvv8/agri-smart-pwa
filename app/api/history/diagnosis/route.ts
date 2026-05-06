import { toErrorResponse } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const prisma = getPrisma();
    const diagnoses = await prisma.diagnosisHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { crop: true, region: true },
    });

    return Response.json({ diagnoses });
  } catch (error) {
    return toErrorResponse(error);
  }
}
