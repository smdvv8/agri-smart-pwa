import "server-only";

import { v2 as cloudinary } from "cloudinary";
import { missingProvider } from "@/lib/errors";

let configured = false;

function configureCloudinary() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw missingProvider("Cloudinary");
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

export async function uploadImageToCloudinary({
  buffer,
  mimeType,
  folder,
}: {
  buffer: Buffer;
  mimeType: string;
  folder: string;
}) {
  const client = configureCloudinary();
  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64}`;

  const result = await client.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    overwrite: false,
  });

  return result.secure_url;
}
