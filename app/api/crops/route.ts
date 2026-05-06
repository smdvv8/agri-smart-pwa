import { toErrorResponse } from "@/lib/errors";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prisma = getPrisma();
    const [crops, regions] = await Promise.all([
      prisma.crop.findMany({
        orderBy: { nameRu: "asc" },
        include: { diseases: { orderBy: { nameRu: "asc" } } },
      }),
      prisma.region.findMany({ orderBy: { name: "asc" } }),
    ]);

    return Response.json({ crops, regions });
  } catch (error) {
    return toErrorResponse(error);
  }
}
