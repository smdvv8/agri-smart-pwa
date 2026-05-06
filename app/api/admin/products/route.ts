import { NextRequest } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const prisma = getPrisma();
    const products = await prisma.marketProduct.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        crop: true,
        region: true,
        user: { select: { id: true, fullName: true, phone: true, email: true } },
      },
    });

    return Response.json({
      products: products.map((product) => ({
        ...product,
        price: product.price.toString(),
      })),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    if (typeof body?.id !== "string") {
      throw new ApiError(422, "validation_error", "Product id is required.");
    }

    if (!["ACTIVE", "SOLD", "HIDDEN"].includes(body?.status)) {
      throw new ApiError(422, "validation_error", "Invalid product status.");
    }

    const prisma = getPrisma();
    const product = await prisma.marketProduct.update({
      where: { id: body.id },
      data: { status: body.status },
      include: { crop: true, region: true },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: `product_status_${body.status}`,
        targetType: "MarketProduct",
        targetId: product.id,
      },
    });

    return Response.json({ product: { ...product, price: product.price.toString() } });
  } catch (error) {
    return toErrorResponse(error);
  }
}
