import { NextRequest } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { parseJson } from "@/lib/api";
import { marketPriceAdviceSchema } from "@/lib/validators";
import { fetchWeather } from "@/lib/weather";
import { generateStructuredJson } from "@/lib/openai";
import { marketPriceAdviceJsonSchema } from "@/lib/ai-schemas";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type MarketPriceAdvice = {
  recommended_price: string;
  reason_ru: string;
  reason_tj: string;
  selling_tip_ru: string;
  selling_tip_tj: string;
  description_improvement_ru: string;
  description_improvement_tj: string;
};

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, {
      key: "ai-market-price",
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });

    const user = await requireUser();
    const data = await parseJson(request, marketPriceAdviceSchema);
    const prisma = getPrisma();

    const product = await prisma.marketProduct.findUnique({
      where: { id: data.productId },
      include: { crop: true, region: true },
    });

    if (!product) {
      throw new ApiError(404, "product_not_found", "Market product was not found.");
    }

    if (product.userId !== user.id && user.role !== "ADMIN") {
      throw new ApiError(403, "forbidden", "You can request advice only for your product.");
    }

    const [similarProducts, weather] = await Promise.all([
      prisma.marketProduct.findMany({
        where: {
          cropId: product.cropId,
          regionId: product.regionId,
          status: "ACTIVE",
          NOT: { id: product.id },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          title: true,
          price: true,
          quantity: true,
          unit: true,
          createdAt: true,
        },
      }),
      fetchWeather(product.region),
    ]);

    const advice = await generateStructuredJson<MarketPriceAdvice>({
      name: "market_price_advice",
      schema: marketPriceAdviceJsonSchema,
      system:
        "You are an agricultural market advisor for Tajikistan. Use only the product, similar marketplace items and weather context. Do not claim access to external market prices.",
      user: JSON.stringify({
        product,
        quality: data.quality,
        similar_products: similarProducts.map((item) => ({
          ...item,
          price: item.price.toString(),
        })),
        weather,
      }),
    });

    const saved = await prisma.marketPriceAdvice.create({
      data: {
        userId: user.id,
        productId: product.id,
        adviceJson: advice,
      },
    });

    return Response.json({ advice, adviceId: saved.id });
  } catch (error) {
    return toErrorResponse(error);
  }
}
