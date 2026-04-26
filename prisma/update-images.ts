import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * This script updates ALL product variants to use the proper local mockup images
 * instead of random Unsplash URLs. It also fixes the hover bug where products
 * looked like they were changing — now front and back use the SAME image
 * (or a proper front/back pair where available).
 */

// Map product names to their proper images
const productImageMap: Record<string, { front: string; back: string }> = {
  // ── Client mockup images ──────────────────────────────────────────────────
  "FOR Signature Tee": {
    front: "/products/for-athletic-both.png",
    back: "/products/for-athletic-both.png",
  },

  // ── Generated Gen-Z mockups ───────────────────────────────────────────────
  "Urban Edge Oversized Tee": {
    front: "/products/tokyo-neon-front.png",
    back: "/products/tokyo-neon-front.png",
  },
  "Essential Classic Tee": {
    front: "/products/explore-retro-front.png",
    back: "/products/explore-retro-front.png",
  },
  "Midnight Rider Graphic Tee": {
    front: "/products/graffiti-black-front.png",
    back: "/products/graffiti-black-back.png",
  },
  "Cloud Nine Slim Fit Tee": {
    front: "/products/lavender-art-front.png",
    back: "/products/lavender-art-front.png",
  },
  "Raw Edge Drop Shoulder Tee": {
    front: "/products/anime-overdrive-front.png",
    back: "/products/anime-overdrive-front.png",
  },
  "Horizon Polo Tee": {
    front: "/products/for-athletic-both.png",
    back: "/products/for-athletic-both.png",
  },
  "Bloom Oversized Tee": {
    front: "/products/lavender-art-front.png",
    back: "/products/lavender-art-front.png",
  },
  "Luna Crop Top": {
    front: "/products/for-floral-girl.png",
    back: "/products/for-floral-girl.png",
  },
  "Serene Fitted Tee": {
    front: "/products/explore-retro-front.png",
    back: "/products/explore-retro-front.png",
  },
  "Aura Graphic Tee": {
    front: "/products/graffiti-black-front.png",
    back: "/products/graffiti-black-back.png",
  },
  "Drift Acid Wash Tee": {
    front: "/products/chi-jersey-front.png",
    back: "/products/chi-jersey-front.png",
  },
  "Eco Organic Cotton Tee": {
    front: "/products/explore-retro-front.png",
    back: "/products/explore-retro-front.png",
  },
  "FOR x Street Hoodie Tee": {
    front: "/products/tokyo-neon-front.png",
    back: "/products/tokyo-neon-front.png",
  },
  "Zen Henley Tee": {
    front: "/products/for-athletic-both.png",
    back: "/products/for-athletic-both.png",
  },
};

// Default image for any product not in the map
const defaultImages = {
  front: "/products/explore-retro-front.png",
  back: "/products/explore-retro-front.png",
};

async function main() {
  console.log("🖼️  Updating product images...\n");

  const products = await prisma.product.findMany({
    include: { variants: true },
  });

  let updated = 0;

  for (const product of products) {
    const images = productImageMap[product.name] || defaultImages;

    // Update all variants for this product
    const result = await prisma.productVariant.updateMany({
      where: { productId: product.id },
      data: {
        frontImage: images.front,
        backImage: images.back,
      },
    });

    console.log(
      `✅ ${product.name} — ${result.count} variants → ${images.front}`
    );
    updated += result.count;
  }

  console.log(`\n🎉 Updated ${updated} total variants across ${products.length} products`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
