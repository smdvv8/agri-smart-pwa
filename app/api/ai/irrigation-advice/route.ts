import { NextRequest } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parseJson } from "@/lib/api";
import { irrigationSchema } from "@/lib/validators";
import { fetchWeather } from "@/lib/weather";
import { generateStructuredJson } from "@/lib/openai";
import { irrigationAdviceJsonSchema } from "@/lib/ai-schemas";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type IrrigationAdvice = {
  irrigation_needed: boolean;
  best_time_ru: string;
  best_time_tj: string;
  water_amount_ru: string;
  water_amount_tj: string;
  reason_ru: string;
  reason_tj: string;
  rain_warning_ru: string;
  rain_warning_tj: string;
  water_saving_ru: string[];
  water_saving_tj: string[];
  disclaimer_ru: string;
  disclaimer_tj: string;
};

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, {
      key: "ai-irrigation",
      limit: 12,
      windowMs: 60 * 60 * 1000,
    });

    const user = await requireUser();
    const data = await parseJson(request, irrigationSchema);
    const prisma = getPrisma();

    const [crop, region] = await Promise.all([
      prisma.crop.findUnique({ where: { id: data.cropId } }),
      prisma.region.findUnique({ where: { id: data.regionId } }),
    ]);

    if (!crop) throw new ApiError(404, "crop_not_found", "Crop was not found.");
    if (!region) throw new ApiError(404, "region_not_found", "Region was not found.");

    const weather = await fetchWeather(region);

    const advice = await generateStructuredJson<IrrigationAdvice>({
      name: "irrigation_advice",
      schema: irrigationAdviceJsonSchema,
      system:
        "You are an agronomist AI assistant for farmers in Tajikistan. Use only the provided crop, region and weather data. Do not invent sensor data. Answer in Russian and Tajik using practical, simple field advice.",
      user: JSON.stringify({
        farmer: { id: user.id, language: user.language },
        crop,
        region,
        weather,
        field: data,
        required_disclaimers: {
          ru: "Это ИИ-помощник, а не замена профессиональному агроному.",
          tj: "Ин ёрдамчии ИИ аст, на ҷойгузини агрономи касбӣ.",
        },
      }),
    });

    const saved = await prisma.irrigationHistory.create({
      data: {
        userId: user.id,
        cropId: crop.id,
        regionId: region.id,
        soilType: data.soilType,
        growthStage: data.growthStage,
        fieldSize: data.fieldSize,
        dripIrrigation: data.dripIrrigation,
        aiAdviceJson: advice,
      },
    });

    return Response.json({ advice, weather, historyId: saved.id });
  } catch (error) {
    return toErrorResponse(error);
  }
}
