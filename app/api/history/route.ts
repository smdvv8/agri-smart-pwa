import { toErrorResponse } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const prisma = getPrisma();
    const [diagnoses, irrigations, chats] = await Promise.all([
      prisma.diagnosisHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { crop: true, region: true },
      }),
      prisma.irrigationHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { crop: true, region: true },
      }),
      prisma.aiChatMessage.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return Response.json({ diagnoses, irrigations, chats });
  } catch (error) {
    return toErrorResponse(error);
  }
}
