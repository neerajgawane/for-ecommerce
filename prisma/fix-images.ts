import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Fix: The for-athletic-both.png image shows BOTH front and back views
 * in a single image, which looks bad in product cards. Replace it with
 * a proper single-view image for those products.
 */

async function main() {
  console.log("🔧 Fixing product images...\n");

  // Products currently using the combined front+back image
  const productsToFix = [
    "FOR Signature Tee",
    "Horizon Polo Tee",
    "Zen Henley Tee",
  ];

  for (const name of productsToFix) {
    const product = await prisma.product.findFirst({ where: { name } });
    if (!product) {
      console.log(`⏭️  "${name}" not found, skipping`);
      continue;
    }

    // Use the explore-retro image instead (clean single-view mockup)
    const result = await prisma.productVariant.updateMany({
      where: { productId: product.id },
      data: {
        frontImage: "/products/explore-retro-front.png",
        backImage: "/products/explore-retro-front.png",
      },
    });
    console.log(`✅ Fixed "${name}" — ${result.count} variants updated`);
  }

  // Also fix any other products that might still have the combined image
  const remainingFix = await prisma.productVariant.updateMany({
    where: {
      frontImage: "/products/for-athletic-both.png",
    },
    data: {
      frontImage: "/products/explore-retro-front.png",
      backImage: "/products/explore-retro-front.png",
    },
  });

  if (remainingFix.count > 0) {
    console.log(`✅ Fixed ${remainingFix.count} additional variants with combined image`);
  }

  console.log("\n🎉 All images fixed!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
