import { NextRequest } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { cropSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const prisma = getPrisma();
    const crops = await prisma.crop.findMany({
      orderBy: { nameRu: "asc" },
      include: { diseases: true },
    });

    return Response.json({ crops });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = cropSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(422, "validation_error", parsed.error.message);
    }

    const prisma = getPrisma();
    const crop = await prisma.crop.create({ data: parsed.data });
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "crop_create",
        targetType: "Crop",
        targetId: crop.id,
      },
    });

    return Response.json({ crop }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
