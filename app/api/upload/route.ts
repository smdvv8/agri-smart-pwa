import { NextRequest } from "next/server";
import { toErrorResponse } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { validateImageFile } from "@/lib/files";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, {
      key: "upload",
      limit: 30,
      windowMs: 60 * 60 * 1000,
    });

    await requireUser();
    const formData = await request.formData();
    const image = await validateImageFile(formData.get("file") as File | null);
    const url = await uploadImageToCloudinary({
      buffer: image.buffer,
      mimeType: image.mimeType,
      folder: "agri-smart-tj/uploads",
    });

    return Response.json({ url });
  } catch (error) {
    return toErrorResponse(error);
  }
}
