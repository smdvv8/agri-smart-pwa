import { ApiError, toErrorResponse } from "@/lib/errors";
import { getPrisma } from "@/lib/prisma";
import { fetchWeather } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ regionId: string }> },
) {
  try {
    const { regionId } = await context.params;
    const prisma = getPrisma();
    const region = await prisma.region.findUnique({ where: { id: regionId } });

    if (!region) {
      throw new ApiError(404, "region_not_found", "Region was not found.");
    }

    const weather = await fetchWeather(region);
    return Response.json({ region, weather });
  } catch (error) {
    return toErrorResponse(error);
  }
}
