import { NextRequest } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { parseJson } from "@/lib/api";
import { aiChatSchema } from "@/lib/validators";
import { fetchWeather } from "@/lib/weather";
import { generateStructuredJson } from "@/lib/openai";
import { chatAdviceJsonSchema } from "@/lib/ai-schemas";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type ChatAdvice = {
  answer_ru: string;
  answer_tj: string;
};

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, {
      key: "ai-chat",
      limit: 30,
      windowMs: 60 * 60 * 1000,
    });

    const user = await requireUser();
    const data = await parseJson(request, aiChatSchema);
    const prisma = getPrisma();

    const [region, crop] = await Promise.all([
      data.regionId
        ? prisma.region.findUnique({ where: { id: data.regionId } })
        : null,
      data.cropId ? prisma.crop.findUnique({ where: { id: data.cropId } }) : null,
    ]);

    if (data.regionId && !region) {
      throw new ApiError(404, "region_not_found", "Region was not found.");
    }

    if (data.cropId && !crop) {
      throw new ApiError(404, "crop_not_found", "Crop was not found.");
    }

    const weather = region ? await fetchWeather(region) : null;

    const advice = await generateStructuredJson<ChatAdvice>({
      name: "agronomist_chat",
      schema: chatAdviceJsonSchema,
      system:
        "You are a practical agronomist AI assistant for Tajikistan. Answer simply in Russian and Tajik. Use only provided context and say when a professional agronomist is needed.",
      user: JSON.stringify({
        question: data.question,
        language: data.language,
        region,
        crop,
        weather,
      }),
    });

    const answer = data.language === "TJ" ? advice.answer_tj : advice.answer_ru;
    const saved = await prisma.aiChatMessage.create({
      data: {
        userId: user.id,
        question: data.question,
        answer,
        language: data.language,
      },
    });

    return Response.json({ answer, advice, messageId: saved.id });
  } catch (error) {
    return toErrorResponse(error);
  }
}
