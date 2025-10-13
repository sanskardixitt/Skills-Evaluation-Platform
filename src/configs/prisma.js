/**
 * Prisma Client Singleton
 *
 * This is one of the most important patterns when using Prisma.
 * We create a single instance of PrismaClient and reuse it throughout
 * our application. Why? Because each PrismaClient instance creates
 * a pool of database connections. If we created a new instance for
 * every request, we would quickly exhaust available connections and
 * our application would crash.
 *
 * Think of it like a taxi company. Instead of buying a new car for
 * every customer, you maintain a fleet that all customers share.
 */

// Import PrismaClient from the generated output path configured in prisma/schema.prisma
// generator client { output = "../src/generated/prisma" }
const { PrismaClient } = require("../generated/prisma");

const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// In development, save to global to persist through hot reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown - always disconnect when the app closes
// This ensures all pending operations complete and connections close properly
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
