import { NextRequest } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { diseaseSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const prisma = getPrisma();
    const diseases = await prisma.disease.findMany({
      orderBy: { createdAt: "desc" },
      include: { crop: true },
    });

    return Response.json({ diseases });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = diseaseSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(422, "validation_error", parsed.error.message);
    }

    const prisma = getPrisma();
    const crop = await prisma.crop.findUnique({ where: { id: parsed.data.cropId } });
    if (!crop) throw new ApiError(404, "crop_not_found", "Crop was not found.");

    const disease = await prisma.disease.create({ data: parsed.data });
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "disease_create",
        targetType: "Disease",
        targetId: disease.id,
      },
    });

    return Response.json({ disease }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
