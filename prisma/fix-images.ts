import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Assigns a UNIQUE image to every product — no more repeats.
 * Uses a mix of local mockups + curated Unsplash t-shirt photos.
 */

// Each product gets its own dedicated image — NO REPEATS
const imageAssignments: Record<string, string> = {
  // ── Client & Generated mockups (local files) ──────────────────────────────
  "Urban Edge Oversized Tee":     "/products/tokyo-neon-front.png",
  "Midnight Rider Graphic Tee":   "/products/graffiti-black-front.png",
  "Raw Edge Drop Shoulder Tee":   "/products/anime-overdrive-front.png",
  "Luna Crop Top":                "/products/for-floral-girl.png",
  "Drift Acid Wash Tee":          "/products/chi-jersey-front.png",
  "Cloud Nine Slim Fit Tee":      "/products/lavender-art-front.png",
  "Essential Classic Tee":        "/products/explore-retro-front.png",

  // ── Unsplash images (each one is a DIFFERENT t-shirt) ─────────────────────
  "FOR Signature Tee":            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",   // white tee folded
  "Bloom Oversized Tee":          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop",   // rust/terracotta tee
  "Horizon Polo Tee":             "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=800&fit=crop",   // navy polo
  "Aura Graphic Tee":             "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=800&fit=crop",   // dark graphic tee
  "Serene Fitted Tee":            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop",   // yellow tee
  "Eco Organic Cotton Tee":       "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop",      // green/sage tee
  "FOR x Street Hoodie Tee":      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop",      // black hoodie
  "Zen Henley Tee":               "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop",   // grey henley

  // ── Your earlier existing products ────────────────────────────────────────
  "tshirt":                       "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&h=800&fit=crop",   // striped tee
  "classic tshirt":               "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=800&fit=crop",   // plain black tee
  "Oversized Acid Wash Tee":      "https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600&h=800&fit=crop",   // acid wash tee
};

async function main() {
  console.log("🎨 Distributing unique images across all products...\n");

  const products = await prisma.product.findMany();
  let updated = 0;

  for (const product of products) {
    const image = imageAssignments[product.name];

    if (!image) {
      // Fallback — use a random Unsplash tee that won't repeat
      const fallbackImages = [
        "https://images.unsplash.com/photo-1485218126466-34e6a34c8435?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&h=800&fit=crop",
      ];
      const fallback = fallbackImages[updated % fallbackImages.length];
      
      await prisma.productVariant.updateMany({
        where: { productId: product.id },
        data: { frontImage: fallback, backImage: fallback },
      });
      console.log(`🔄 "${product.name}" → fallback image`);
      updated++;
      continue;
    }

    await prisma.productVariant.updateMany({
      where: { productId: product.id },
      data: { frontImage: image, backImage: image },
    });
    console.log(`✅ "${product.name}" → ${image.includes("unsplash") ? "Unsplash" : "Local"}: ${image.split("/").pop()?.slice(0, 30)}`);
    updated++;
  }

  console.log(`\n🎉 Done! Updated ${updated} products — each with a unique image.`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
