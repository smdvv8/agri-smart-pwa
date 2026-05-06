import "dotenv/config";
import { defineConfig } from "prisma/config";

const fallbackDevUrl =
  "postgresql://postgres:postgres@localhost:5432/agri_smart_tj?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ||
      (process.env.NODE_ENV === "production" ? "" : fallbackDevUrl),
  },
});
