import { configured } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "ok",
    environment: process.env.ENVIRONMENT || process.env.NODE_ENV || "development",
    providers: {
      database: configured(process.env.DATABASE_URL),
      openai: configured(process.env.OPENAI_API_KEY),
      huggingface: configured(process.env.HUGGINGFACE_API_KEY),
      openweather: configured(process.env.OPENWEATHER_API_KEY),
      cloudinary:
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
          ? "configured"
          : "missing",
    },
  });
}
