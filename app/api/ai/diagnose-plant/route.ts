import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { diagnosisFieldsSchema } from "@/lib/validators";
import { validateImageFile } from "@/lib/files";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { classifyPlantImage } from "@/lib/huggingface";
import { fetchWeather } from "@/lib/weather";
import { generateStructuredJson } from "@/lib/openai";
import { diagnosisAdviceJsonSchema, toRiskLevel } from "@/lib/ai-schemas";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type DiagnosisAdvice = {
  crop: string;
  region: string;
  detected_problem: string;
  confidence: number;
  risk_level: "low" | "medium" | "high" | "critical";
  simple_explanation_ru: string;
  simple_explanation_tj: string;
  what_to_do_today_ru: string[];
  what_to_do_today_tj: string[];
  watering_advice_ru: string;
  watering_advice_tj: string;
  three_day_plan_ru: Array<{ day: number; actions: string[] }>;
  three_day_plan_tj: Array<{ day: number; actions: string[] }>;
  water_saving_tip_ru: string;
  water_saving_tip_tj: string;
  when_to_call_agronomist_ru: string;
  when_to_call_agronomist_tj: string;
  disclaimer_ru: string;
  disclaimer_tj: string;
};

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, {
      key: "ai-diagnosis",
      limit: 8,
      windowMs: 60 * 60 * 1000,
    });

    const user = await requireUser();
    const formData = await request.formData();
    const fields = diagnosisFieldsSchema.safeParse({
      cropId: formData.get("cropId"),
      regionId: formData.get("regionId"),
      soilType: formData.get("soilType"),
      growthStage: formData.get("growthStage"),
    });

    if (!fields.success) {
      throw new ApiError(422, "VALIDATION_ERROR", z.prettifyError(fields.error));
    }

    const image = await validateImageFile(formData.get("photo") as File | null);
    const prisma = getPrisma();
    const [crop, region] = await Promise.all([
      prisma.crop.findUnique({
        where: { id: fields.data.cropId },
        include: { diseases: true },
      }),
      prisma.region.findUnique({ where: { id: fields.data.regionId } }),
    ]);

    if (!crop) throw new ApiError(404, "CROP_NOT_FOUND", "Crop was not found.");
    if (!region) throw new ApiError(404, "REGION_NOT_FOUND", "Region was not found.");

    const [photoUrl, classification, weather] = await Promise.all([
      uploadImageToCloudinary({
        buffer: image.buffer,
        mimeType: image.mimeType,
        folder: "agri-smart-tj/plant-diagnosis",
      }),
      classifyPlantImage(image.buffer, image.mimeType),
      fetchWeather(region),
    ]);

    const advice = await generateStructuredJson<DiagnosisAdvice>({
      name: "plant_diagnosis_advice",
      schema: diagnosisAdviceJsonSchema,
      system:
        "You are an agronomist AI assistant for farmers in Tajikistan. The disease label and confidence come from a real image classification model. Do not change the confidence. Explain uncertainty clearly and recommend calling an agronomist for severe symptoms. Return Russian and Tajik text.",
      user: JSON.stringify({
        farmer: { id: user.id, language: user.language },
        crop,
        region,
        field: fields.data,
        weather,
        image_classification: classification,
        photo_url: photoUrl,
        required_disclaimers: {
          ru: "Это ИИ-помощник, а не замена профессиональному агроному.",
          tj: "Ин ёрдамчии ИИ аст, на ҷойгузини агрономи касбӣ.",
        },
      }),
    });

    const saved = await prisma.diagnosisHistory.create({
      data: {
        userId: user.id,
        cropId: crop.id,
        regionId: region.id,
        photoUrl,
        detectedProblem: advice.detected_problem || classification.label,
        confidence: classification.confidence,
        riskLevel: toRiskLevel(advice.risk_level),
        aiAdviceJson: {
          ...advice,
          confidence: classification.confidence,
          photoUrl,
        },
      },
    });

    return Response.json({
      success: true,
      data: {
        crop: advice.crop || crop.nameRu,
        region: advice.region || region.name,
        detected_problem: advice.detected_problem || classification.label,
        confidence: classification.confidence,
        risk_level: advice.risk_level,
        simple_explanation_ru: advice.simple_explanation_ru,
        simple_explanation_tj: advice.simple_explanation_tj,
        what_to_do_today_ru: advice.what_to_do_today_ru,
        what_to_do_today_tj: advice.what_to_do_today_tj,
        watering_advice_ru: advice.watering_advice_ru,
        watering_advice_tj: advice.watering_advice_tj,
        three_day_plan_ru: advice.three_day_plan_ru,
        three_day_plan_tj: advice.three_day_plan_tj,
        water_saving_tip_ru: advice.water_saving_tip_ru,
        water_saving_tip_tj: advice.water_saving_tip_tj,
        when_to_call_agronomist_ru: advice.when_to_call_agronomist_ru,
        when_to_call_agronomist_tj: advice.when_to_call_agronomist_tj,
        disclaimer_ru: advice.disclaimer_ru,
        disclaimer_tj: advice.disclaimer_tj,
        photoUrl,
        createdAt: saved.createdAt,
      },
      meta: {
        historyId: saved.id,
        classification,
        weather,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
