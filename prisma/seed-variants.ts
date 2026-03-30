import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get all existing products
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products`);

  if (products.length === 0) {
    console.log("No products found. Creating sample products first...");
    return;
  }

  const colors = [
    { color: "#000000", colorName: "Black" },
    { color: "#FFFFFF", colorName: "White" },
    { color: "#1B2A4A", colorName: "Navy Blue" },
  ];

  const sizes = ["S", "M", "L", "XL", "XXL"];

  for (const product of products) {
    // Check if product already has variants
    const existingVariants = await prisma.productVariant.count({
      where: { productId: product.id },
    });

    if (existingVariants > 0) {
      console.log(`⏭️ Skipping ${product.name} - already has ${existingVariants} variants`);
      continue;
    }

    console.log(`📦 Creating variants for: ${product.name}`);

    for (const colorObj of colors) {
      for (const size of sizes) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            color: colorObj.color,
            colorName: colorObj.colorName,
            size: size,
            frontImage: "/placeholder.png",
            backImage: "/placeholder.png",
            stock: 50,
            sku: `${product.id.slice(0, 8)}-${colorObj.colorName.toLowerCase().replace(/\s+/g, "-")}-${size.toLowerCase()}`,
          },
        });
      }
    }

    console.log(`✅ Created ${colors.length * sizes.length} variants for ${product.name}`);
  }

  console.log("\n🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
