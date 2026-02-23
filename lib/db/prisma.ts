import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing env: DATABASE_URL");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// Prevent multiple Prisma Client instances in development (hot-reload safe).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// When DATABASE_URL is present (runtime), initialise immediately with the
// standard singleton pattern.  During the Next.js build phase DATABASE_URL is
// not set, so we defer creation until the first actual query via a Proxy to
// avoid throwing at module-import time.
export const prisma: PrismaClient = process.env.DATABASE_URL
  ? (globalForPrisma.prisma ??
    (() => {
      globalForPrisma.prisma = createPrismaClient();
      return globalForPrisma.prisma;
    })())
  : new Proxy({} as PrismaClient, {
      get(_target, prop, receiver) {
        if (!globalForPrisma.prisma) {
          globalForPrisma.prisma = createPrismaClient();
        }
        return Reflect.get(globalForPrisma.prisma, prop, receiver);
      },
    });
