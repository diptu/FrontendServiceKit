import { PrismaClient } from "@prisma/client";

/**
 * Standard Next.js Prisma singleton: dev's hot-reload re-evaluates this
 * module on every edit, and each fresh PrismaClient opens its own
 * connection pool -- without caching on `globalThis`, repeated edits exhaust
 * SQLite's connection/file-handle limit within a single dev session.
 */
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma = globalThis.prismaGlobal ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
