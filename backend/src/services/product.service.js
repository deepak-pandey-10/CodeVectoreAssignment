const prisma = require("../prisma/client");

const serialize = (data) =>
  JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint"
        ? value.toString()
        : value
    )
  );

const getProducts = async ({
  limit = 20,
  page = null,
  category = null,
  cursorTime = null,
  cursorId = null,
}) => {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const safePage =
    page === null
      ? null
      : Math.max(Number(page) || 1, 1);

  const where = {};

  if (category) {
    where.category = category;
  }

  if (safePage !== null) {
    const [total, products] = await prisma.$transaction([
      prisma.product.count({
        where,
      }),

      prisma.product.findMany({
        where,

        skip: (safePage - 1) * safeLimit,

        take: safeLimit,

        orderBy: [
          {
            updatedAt: "desc",
          },
          {
            id: "desc",
          },
        ],
      }),
    ]);

    const totalPages =
      Math.ceil(total / safeLimit);

    return {
      success: true,

      count: products.length,

      total,

      page: safePage,

      limit: safeLimit,

      totalPages,

      data: serialize(products),

      hasMore: safePage < totalPages,
    };
  }

  if (cursorTime && cursorId) {
    where.OR = [
      {
        updatedAt: {
          lt: new Date(cursorTime),
        },
      },

      {
        updatedAt: new Date(cursorTime),

        id: {
          lt: BigInt(cursorId),
        },
      },
    ];
  }

  const products = await prisma.product.findMany({
    where,

    take: safeLimit + 1,

    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        id: "desc",
      },
    ],
  });

  const hasMore =
    products.length > safeLimit;

  if (hasMore) {
    products.pop();
  }

  let nextCursor = null;

  if (
    hasMore &&
    products.length > 0
  ) {
    const last =
      products[products.length - 1];

    nextCursor = {
      updatedAt:
        last.updatedAt.toISOString(),

      id: last.id.toString(),
    };
  }

  return {
    success: true,

    count: products.length,

    data: serialize(products),

    nextCursor,

    hasMore,
  };
};

module.exports = {
  getProducts,
};
