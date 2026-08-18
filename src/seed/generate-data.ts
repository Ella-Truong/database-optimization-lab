import "dotenv/config";
import { PrismaClient, OrderStatus } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { faker } from "@faker-js/faker";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

console.log(
  "DATABASE_URL:",
  connectionString.replace(/:[^:@]+@/, ":****@")
);

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

// =========================
// Dataset configuration
// =========================

const USER_COUNT = 10_000;
const PRODUCT_COUNT = 5_000;
const ORDER_COUNT = 50_000;

const BATCH_SIZE = 1_000;

faker.seed(12345);

// =========================
// Main
// =========================

async function main() {
  console.log("🌱 Starting database seed...");

  // =========================
  // Categories
  // =========================

  console.log("Creating categories...");

  const categoryNames = [
    "Electronics",
    "Computers",
    "Mobile Phones",
    "Clothing",
    "Shoes",
    "Accessories",
    "Home & Kitchen",
    "Furniture",
    "Appliances",
    "Books",
    "Sports",
    "Outdoor",
    "Beauty",
    "Health",
    "Toys",
    "Games",
    "Automotive",
    "Tools",
    "Garden",
    "Pet Supplies",
    "Office Supplies",
    "Jewelry",
    "Watches",
    "Bags",
    "Luggage",
    "Baby Products",
    "Groceries",
    "Music",
    "Movies",
    "Cameras",
    "Audio",
    "Printers",
    "Computer Accessories",
    "Smart Home",
    "Gaming",
    "Fitness",
    "Camping",
    "Cycling",
    "Running",
    "Fishing",
    "Kitchenware",
    "Cookware",
    "Bedding",
    "Lighting",
    "Decor",
    "Storage",
    "Cleaning",
    "Stationery",
    "Crafts",
    "Industrial",
  ];

  await prisma.category.createMany({
    data: categoryNames.map((name) => ({
      name,
    })),
  });

  const categoryRows = await prisma.category.findMany({
    select: {
      id: true,
    },
  });

  // =========================
  // Users
  // =========================

  console.log("Creating users...");

  const generatedUsers: {
    firstName: string;
    lastName: string;
  }[] = [];

  for (
    let start = 0;
    start < USER_COUNT;
    start += BATCH_SIZE
  ) {
    const count = Math.min(
      BATCH_SIZE,
      USER_COUNT - start
    );

    const users = Array.from({ length: count }, () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      generatedUsers.push({
        firstName,
        lastName,
      });

      return {
        username: `${firstName} ${lastName}`,
        country: faker.location.country(),
      };
    });

    await prisma.user.createMany({
      data: users,
    });
  }

  const userRows = await prisma.user.findMany({
    select: {
      id: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  // =========================
  // Accounts
  // =========================

  console.log("Creating accounts...");

  const accounts = userRows.map((user, index) => {
    const person = generatedUsers[index];

    return {
      userId: user.id,
      email: `${person.firstName}.${person.lastName}.${index + 1}@example.com`.toLowerCase(),
      passwordHash: faker.string.alphanumeric(60),
    };
  });

  for (
    let start = 0;
    start < accounts.length;
    start += BATCH_SIZE
  ) {
    await prisma.account.createMany({
      data: accounts.slice(start, start + BATCH_SIZE),
    });
  }

  // =========================
  // Products
  // =========================

  console.log("Creating products...");

  const productNames = new Set<string>();

  for (
    let start = 0;
    start < PRODUCT_COUNT;
    start += BATCH_SIZE
  ) {
    const count = Math.min(
      BATCH_SIZE,
      PRODUCT_COUNT - start
    );

    const products = [];

    while (products.length < count) {
      const name = faker.commerce.productName();

      if (productNames.has(name)) {
        continue;
      }

      productNames.add(name);

      products.push({
        name,
        price: faker.number.float({
          min: 5,
          max: 2000,
          fractionDigits: 2,
        }),
        available: faker.number.int({
          min: 0,
          max: 1000,
        }),
        categoryId:
          faker.helpers.arrayElement(categoryRows).id,
        createdAt: faker.date.between({
          from: "2020-01-01",
          to: new Date(),
        }),
      });
    }

    await prisma.product.createMany({
      data: products,
    });
  }

  const productRows = await prisma.product.findMany({
    select: {
      id: true,
      price: true,
    },
  });

  // =========================
  // Orders
  // =========================

  console.log("Creating orders...");

  for (
    let start = 0;
    start < ORDER_COUNT;
    start += BATCH_SIZE
  ) {
    const count = Math.min(
      BATCH_SIZE,
      ORDER_COUNT - start
    );

    const orders = Array.from({ length: count }, () => ({
      userId: faker.helpers.arrayElement(userRows).id,

      status: faker.helpers.arrayElement([
        OrderStatus.PENDING,
        OrderStatus.PAID,
        OrderStatus.SHIPPED,
        OrderStatus.CANCELLED,
      ]),

      createdAt: faker.date.between({
        from: "2022-01-01",
        to: new Date(),
      }),
    }));

    await prisma.order.createMany({
      data: orders,
    });
  }

  const orderRows = await prisma.order.findMany({
    select: {
      id: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  // =========================
  // Order Items
  // =========================

  console.log("Creating order items...");

  for (
    let start = 0;
    start < orderRows.length;
    start += BATCH_SIZE
  ) {
    const orderBatch = orderRows.slice(
      start,
      start + BATCH_SIZE
    );

    const items = [];

    for (const order of orderBatch) {
      const itemCount = faker.number.int({
        min: 1,
        max: 5,
      });

      for (let i = 0; i < itemCount; i++) {
        const product = faker.helpers.arrayElement(
          productRows
        );

        items.push({
          orderId: order.id,
          productId: product.id,
          quantity: faker.number.int({
            min: 1,
            max: 5,
          }),
          purchasedPrice: product.price,
        });
      }
    }

    await prisma.orderItem.createMany({
      data: items,
    });
  }

  console.log("🎉 Database seed completed!");
}

// =========================
// Run
// =========================

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });