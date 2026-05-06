import { NextRequest } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { marketProductSchema, marketSearchSchema } from "@/lib/validators";
import { validateImageFile } from "@/lib/files";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const search = marketSearchSchema.parse({
      q: request.nextUrl.searchParams.get("q") || undefined,
      regionId: request.nextUrl.searchParams.get("regionId") || undefined,
      cropId: request.nextUrl.searchParams.get("cropId") || undefined,
      page: request.nextUrl.searchParams.get("page") || undefined,
      pageSize: request.nextUrl.searchParams.get("pageSize") || undefined,
    });

    const prisma = getPrisma();
    const products = await prisma.marketProduct.findMany({
      where: {
        status: "ACTIVE",
        regionId: search.regionId,
        cropId: search.cropId,
        ...(search.q
          ? {
              OR: [
                { title: { contains: search.q, mode: "insensitive" } },
                { description: { contains: search.q, mode: "insensitive" } },
                { district: { contains: search.q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        quantity: true,
        unit: true,
        district: true,
        phone: true,
        photoUrl: true,
        status: true,
        createdAt: true,
        crop: true,
        region: true,
        user: { select: { id: true, fullName: true, role: true } },
      },
      skip: (search.page - 1) * search.pageSize,
      take: search.pageSize + 1,
    });
    const hasNextPage = products.length > search.pageSize;
    const pageItems = hasNextPage ? products.slice(0, search.pageSize) : products;

    return Response.json({
      products: pageItems.map((product) => ({
        ...product,
        price: product.price.toString(),
      })),
      pagination: {
        page: search.page,
        pageSize: search.pageSize,
        hasNextPage,
        nextPage: hasNextPage ? search.page + 1 : null,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, {
      key: "market-create",
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });

    const user = await requireUser();
    const formData = await request.formData();
    const parsed = marketProductSchema.safeParse({
      title: formData.get("title"),
      cropId: formData.get("cropId"),
      description: formData.get("description"),
      price: formData.get("price"),
      quantity: formData.get("quantity"),
      unit: formData.get("unit"),
      regionId: formData.get("regionId"),
      district: formData.get("district"),
      phone: formData.get("phone"),
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Проверьте поля формы.";
      throw new ApiError(422, "validation_error", message);
    }

    const prisma = getPrisma();
    const [crop, region] = await Promise.all([
      prisma.crop.findUnique({ where: { id: parsed.data.cropId } }),
      prisma.region.findUnique({ where: { id: parsed.data.regionId } }),
    ]);

    if (!crop) throw new ApiError(404, "crop_not_found", "Crop was not found.");
    if (!region) throw new ApiError(404, "region_not_found", "Region was not found.");

    const photo = formData.get("photo") as File | null;
    let photoUrl: string | undefined;
    if (photo && photo.size > 0) {
      const image = await validateImageFile(photo);
      photoUrl = await uploadImageToCloudinary({
        buffer: image.buffer,
        mimeType: image.mimeType,
        folder: "agri-smart-tj/market",
      });
    }

    const product = await prisma.marketProduct.create({
      data: {
        userId: user.id,
        cropId: crop.id,
        title: parsed.data.title,
        description: parsed.data.description,
        price: parsed.data.price,
        quantity: parsed.data.quantity,
        unit: parsed.data.unit,
        regionId: region.id,
        district: parsed.data.district,
        phone: parsed.data.phone,
        photoUrl,
      },
      include: { crop: true, region: true },
    });

    return Response.json(
      { product: { ...product, price: product.price.toString() } },
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
