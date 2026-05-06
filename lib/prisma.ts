import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { missingProvider } from "@/lib/errors";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw missingProvider("DATABASE_URL");
  }

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log:
        process.env.PRISMA_QUERY_LOGGING === "true"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }

  return globalForPrisma.prisma;
}
