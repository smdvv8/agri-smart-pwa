import { toErrorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const prisma = getPrisma();

    const [
      users,
      products,
      diagnoses,
      irrigations,
      chats,
      activeProducts,
      hiddenProducts,
      soldProducts,
      recentLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.marketProduct.count(),
      prisma.diagnosisHistory.count(),
      prisma.irrigationHistory.count(),
      prisma.aiChatMessage.count(),
      prisma.marketProduct.count({ where: { status: "ACTIVE" } }),
      prisma.marketProduct.count({ where: { status: "HIDDEN" } }),
      prisma.marketProduct.count({ where: { status: "SOLD" } }),
      prisma.adminLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { admin: { select: { fullName: true, email: true } } },
      }),
    ]);

    return Response.json({
      totals: { users, products, diagnoses, irrigations, chats },
      productStatus: [
        { name: "ACTIVE", value: activeProducts },
        { name: "SOLD", value: soldProducts },
        { name: "HIDDEN", value: hiddenProducts },
      ],
      recentLogs,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
