require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding 200,000 products...");

  await prisma.$executeRawUnsafe(`
    INSERT INTO "Product"
    ("name","category","price","createdAt","updatedAt")

    SELECT
      'Product ' || gs,

      (
        ARRAY[
          'Electronics',
          'Fashion',
          'Books',
          'Sports',
          'Furniture'
        ]
      )[1 + floor(random() * 5)],

      round((random() * 5000)::numeric, 2),

      NOW() - (random() * interval '365 days'),

      NOW() - (random() * interval '30 days')

    FROM generate_series(1, 200000) gs;
  `);

  console.log("✅ 200,000 products inserted");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());