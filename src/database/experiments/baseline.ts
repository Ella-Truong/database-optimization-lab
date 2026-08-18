import "dotenv/config";
import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const userId = 5000;

  const result = await prisma.$queryRaw`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT *
    FROM "Order"
    WHERE "userId" = ${userId};
  `;

  console.log(result);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });