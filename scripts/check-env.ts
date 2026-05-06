import "dotenv/config";

const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "OPENAI_API_KEY",
  "HUGGINGFACE_API_KEY",
  "OPENWEATHER_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

let failed = false;

for (const key of required) {
  const configured = Boolean(process.env[key]);
  console.log(`${key}=${configured ? "configured" : "missing"}`);
  if (!configured) failed = true;
}

if (process.env.APP_URL?.includes("localhost") && process.env.ENVIRONMENT === "production") {
  console.log("APP_URL=invalid_for_production");
  failed = true;
}

process.exit(failed ? 1 : 0);
