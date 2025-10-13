// Danger: Clears all application data from the database.
// Usage: npm run prisma:clear

const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  // Fast path for Postgres: TRUNCATE with RESTART IDENTITY CASCADE
  // Table names follow @@map() names from schema.prisma
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "quiz_answers","quiz_attempts","questions","skills","users" RESTART IDENTITY CASCADE;'
  );

  console.log("All tables truncated and identities reset.");
}

main()
  .catch((e) => {
    console.error("Clear failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
