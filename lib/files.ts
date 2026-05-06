import "server-only";

import { ApiError } from "@/lib/errors";

const MAX_IMAGE_SIZE = 6 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function validateImageFile(file: File | null) {
  if (!file) {
    throw new ApiError(400, "file_required", "Image file is required.");
  }

  if (!ALLOWED_MIME.has(file.type)) {
    throw new ApiError(
      400,
      "invalid_file_type",
      "Only JPEG, PNG and WebP images are allowed.",
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new ApiError(
      400,
      "file_too_large",
      "Image must be 6 MB or smaller.",
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  return {
    file,
    buffer: Buffer.from(arrayBuffer),
    mimeType: file.type,
  };
}
