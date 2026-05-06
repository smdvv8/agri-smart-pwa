import { NextRequest } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const prisma = getPrisma();
    const product = await prisma.marketProduct.findUnique({
      where: { id },
      include: {
        crop: true,
        region: true,
        user: { select: { id: true, fullName: true, role: true } },
      },
    });

    if (!product || product.status === "HIDDEN") {
      throw new ApiError(404, "product_not_found", "Market product was not found.");
    }

    return Response.json({ product: { ...product, price: product.price.toString() } });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = await request.json();
    const status = body?.status;

    if (!["ACTIVE", "SOLD", "HIDDEN"].includes(status)) {
      throw new ApiError(422, "validation_error", "Invalid product status.");
    }

    const prisma = getPrisma();
    const existing = await prisma.marketProduct.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "product_not_found", "Market product was not found.");
    }

    if (existing.userId !== user.id && user.role !== "ADMIN") {
      throw new ApiError(403, "forbidden", "You cannot update this product.");
    }

    const product = await prisma.marketProduct.update({
      where: { id },
      data: { status },
      include: { crop: true, region: true },
    });

    return Response.json({ product: { ...product, price: product.price.toString() } });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const prisma = getPrisma();
    const existing = await prisma.marketProduct.findUnique({ where: { id } });

    if (!existing) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Market product was not found.");
    }

    if (existing.userId !== user.id && user.role !== "ADMIN") {
      throw new ApiError(403, "FORBIDDEN", "You cannot delete this product.");
    }

    const product = await prisma.marketProduct.update({
      where: { id },
      data: { status: "HIDDEN" },
      include: { crop: true, region: true },
    });

    if (user.role === "ADMIN") {
      await prisma.adminLog.create({
        data: {
          adminId: user.id,
          action: "product_delete",
          targetType: "MarketProduct",
          targetId: product.id,
        },
      });
    }

    return Response.json({
      success: true,
      product: { ...product, price: product.price.toString() },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
