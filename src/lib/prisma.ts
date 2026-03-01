import { PrismaClient } from "@/generated/prisma_new";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma: PrismaClient = globalThis.prismaGlobal ?? new PrismaClient(
  process.env.NODE_ENV !== "production"
    ? { log: ["warn", "error"] }
    : undefined
);

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

