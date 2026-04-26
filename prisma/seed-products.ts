import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Product Data ──────────────────────────────────────────────────────────────
const products = [
  // ── MEN'S T-SHIRTS ──────────────────────────────────────────────────────────
  {
    name: "Urban Edge Oversized Tee",
    description:
      "Premium heavyweight cotton oversized t-shirt with dropped shoulders. Perfect for streetwear styling with a relaxed, contemporary fit.",
    basePrice: 599,
    printPrice: 100,
    category: "t-shirt",
    gender: "men",
    fit: "oversized",
    isFeatured: true,
    colors: [
      { color: "#000000", colorName: "Black" },
      { color: "#FFFFFF", colorName: "White" },
      { color: "#2D2D2D", colorName: "Charcoal" },
      { color: "#1B2A4A", colorName: "Navy Blue" },
    ],
  },
  {
    name: "Essential Classic Tee",
    description:
      "Your everyday go-to tee. Made from 100% combed cotton with a clean, minimal design. Soft hand-feel and lasting comfort.",
    basePrice: 399,
    printPrice: 100,
    category: "t-shirt",
    gender: "men",
    fit: "regular",
    isFeatured: true,
    colors: [
      { color: "#FFFFFF", colorName: "White" },
      { color: "#000000", colorName: "Black" },
      { color: "#808080", colorName: "Grey" },
      { color: "#C8102E", colorName: "Red" },
    ],
  },
  {
    name: "Midnight Rider Graphic Tee",
    description:
      "Bold graphic tee featuring original FOR artwork. Printed with eco-friendly water-based inks on premium 220 GSM cotton.",
    basePrice: 699,
    printPrice: 150,
    category: "t-shirt",
    gender: "men",
    fit: "regular",
    isFeatured: false,
    colors: [
      { color: "#000000", colorName: "Black" },
      { color: "#1B2A4A", colorName: "Navy Blue" },
      { color: "#2F4F2F", colorName: "Dark Green" },
    ],
  },
  {
    name: "Cloud Nine Slim Fit Tee",
    description:
      "Tailored slim fit for a sharp silhouette. Crafted from breathable stretch cotton blend that moves with you.",
    basePrice: 499,
    printPrice: 100,
    category: "t-shirt",
    gender: "men",
    fit: "slim",
    isFeatured: false,
    colors: [
      { color: "#FFFFFF", colorName: "White" },
      { color: "#87CEEB", colorName: "Sky Blue" },
      { color: "#000000", colorName: "Black" },
    ],
  },
  {
    name: "Raw Edge Drop Shoulder Tee",
    description:
      "Street-ready oversized tee with raw-cut edges and a boxy cut. Heavy 240 GSM fabric that drapes perfectly.",
    basePrice: 749,
    printPrice: 100,
    category: "t-shirt",
    gender: "men",
    fit: "oversized",
    isFeatured: true,
    colors: [
      { color: "#2D2D2D", colorName: "Charcoal" },
      { color: "#F5F5DC", colorName: "Cream" },
      { color: "#8B4513", colorName: "Brown" },
    ],
  },
  {
    name: "Horizon Polo Tee",
    description:
      "Modern polo with a casual edge. Pique cotton fabric with subtle FOR embroidery on the chest. Business casual redefined.",
    basePrice: 899,
    printPrice: 0,
    category: "polo",
    gender: "men",
    fit: "regular",
    isFeatured: false,
    colors: [
      { color: "#000000", colorName: "Black" },
      { color: "#FFFFFF", colorName: "White" },
      { color: "#1B2A4A", colorName: "Navy Blue" },
    ],
  },

  // ── WOMEN'S T-SHIRTS ────────────────────────────────────────────────────────
  {
    name: "Bloom Oversized Tee",
    description:
      "Effortlessly chic oversized tee designed for the modern woman. Soft-washed cotton with a relaxed boyfriend fit.",
    basePrice: 599,
    printPrice: 100,
    category: "t-shirt",
    gender: "women",
    fit: "oversized",
    isFeatured: true,
    colors: [
      { color: "#FFB6C1", colorName: "Blush Pink" },
      { color: "#E6E6FA", colorName: "Lavender" },
      { color: "#FFFFFF", colorName: "White" },
      { color: "#000000", colorName: "Black" },
    ],
  },
  {
    name: "Luna Crop Top",
    description:
      "Trendy cropped tee with a flattering length. Perfect for high-waisted jeans or skirts. Lightweight and breathable.",
    basePrice: 449,
    printPrice: 100,
    category: "crop-top",
    gender: "women",
    fit: "regular",
    isFeatured: true,
    colors: [
      { color: "#FFFFFF", colorName: "White" },
      { color: "#000000", colorName: "Black" },
      { color: "#FF69B4", colorName: "Hot Pink" },
      { color: "#E6E6FA", colorName: "Lavender" },
    ],
  },
  {
    name: "Serene Fitted Tee",
    description:
      "Clean, feminine silhouette with a slightly fitted cut. Made from premium pima cotton for an ultra-soft feel.",
    basePrice: 499,
    printPrice: 100,
    category: "t-shirt",
    gender: "women",
    fit: "slim",
    isFeatured: false,
    colors: [
      { color: "#F0E68C", colorName: "Pale Yellow" },
      { color: "#98FB98", colorName: "Mint Green" },
      { color: "#FFFFFF", colorName: "White" },
    ],
  },
  {
    name: "Aura Graphic Tee",
    description:
      "Statement graphic tee with original FOR artwork. Oversized fit with vintage-washed finish for a lived-in look.",
    basePrice: 649,
    printPrice: 150,
    category: "t-shirt",
    gender: "women",
    fit: "oversized",
    isFeatured: false,
    colors: [
      { color: "#000000", colorName: "Black" },
      { color: "#2D2D2D", colorName: "Charcoal" },
      { color: "#F5F5DC", colorName: "Cream" },
    ],
  },

  // ── UNISEX ──────────────────────────────────────────────────────────────────
  {
    name: "FOR Signature Tee",
    description:
      "The OG FOR classic. Minimal branding, maximum quality. 200 GSM combed cotton in a universally flattering regular fit.",
    basePrice: 499,
    printPrice: 0,
    category: "t-shirt",
    gender: "unisex",
    fit: "regular",
    isFeatured: true,
    colors: [
      { color: "#000000", colorName: "Black" },
      { color: "#FFFFFF", colorName: "White" },
      { color: "#808080", colorName: "Grey" },
      { color: "#1B2A4A", colorName: "Navy Blue" },
      { color: "#C8102E", colorName: "Red" },
    ],
  },
  {
    name: "Drift Acid Wash Tee",
    description:
      "Vintage-inspired acid wash tee with unique color variations. Each piece is individually washed for a one-of-a-kind look.",
    basePrice: 799,
    printPrice: 100,
    category: "t-shirt",
    gender: "unisex",
    fit: "oversized",
    isFeatured: false,
    colors: [
      { color: "#808080", colorName: "Grey Wash" },
      { color: "#6495ED", colorName: "Blue Wash" },
      { color: "#2D2D2D", colorName: "Black Wash" },
    ],
  },
  {
    name: "Eco Organic Cotton Tee",
    description:
      "Sustainably sourced 100% organic cotton tee. GOTS certified. Minimal carbon footprint, maximum comfort.",
    basePrice: 599,
    printPrice: 100,
    category: "t-shirt",
    gender: "unisex",
    fit: "regular",
    isFeatured: false,
    colors: [
      { color: "#F5F5DC", colorName: "Natural" },
      { color: "#98FB98", colorName: "Sage Green" },
      { color: "#D2B48C", colorName: "Sand" },
    ],
  },
  {
    name: "FOR x Street Hoodie Tee",
    description:
      "Hooded long-sleeve tee that bridges the gap between a hoodie and a tee. Lightweight French terry fabric.",
    basePrice: 999,
    printPrice: 100,
    category: "hoodie",
    gender: "unisex",
    fit: "oversized",
    isFeatured: true,
    colors: [
      { color: "#000000", colorName: "Black" },
      { color: "#808080", colorName: "Grey" },
      { color: "#1B2A4A", colorName: "Navy Blue" },
    ],
  },
  {
    name: "Zen Henley Tee",
    description:
      "Relaxed henley with a 3-button placket. Slub cotton fabric adds texture and character. Great for layering.",
    basePrice: 549,
    printPrice: 0,
    category: "t-shirt",
    gender: "men",
    fit: "regular",
    isFeatured: false,
    colors: [
      { color: "#FFFFFF", colorName: "White" },
      { color: "#808080", colorName: "Grey" },
      { color: "#8B4513", colorName: "Brown" },
      { color: "#2F4F2F", colorName: "Olive" },
    ],
  },
];

// ── T-shirt mockup images from Unsplash (free to use) ─────────────────────────
// These are real, high-quality t-shirt images
const tshirtImages = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1627225924765-552d49cf2b5d?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1485218126466-34e6a34c8435?w=600&h=700&fit=crop",
];

const sizes = ["S", "M", "L", "XL", "XXL"];

// ── Main Seed Function ───────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Starting product seed...\n");

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];

    // Check if product with same name already exists
    const existing = await prisma.product.findFirst({
      where: { name: p.name },
    });

    if (existing) {
      console.log(`⏭️  Skipping "${p.name}" — already exists`);
      skipped++;
      continue;
    }

    // Pick images (cycle through available images)
    const frontImage = tshirtImages[i % tshirtImages.length];
    const backImage = tshirtImages[(i + 1) % tshirtImages.length];

    // Create product with all variants in one transaction
    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        basePrice: p.basePrice,
        printPrice: p.printPrice,
        category: p.category,
        gender: p.gender,
        fit: p.fit,
        isFeatured: p.isFeatured,
        isActive: true,
        stockCount: p.colors.length * sizes.length * 50,
        variants: {
          create: p.colors.flatMap((colorObj) =>
            sizes.map((size) => ({
              color: colorObj.color,
              colorName: colorObj.colorName,
              size,
              frontImage,
              backImage,
              stock: Math.floor(Math.random() * 40) + 20, // 20-60 random stock
              sku: `FOR-${p.name
                .slice(0, 4)
                .toUpperCase()
                .replace(/\s/g, "")}-${colorObj.colorName
                .slice(0, 3)
                .toUpperCase()
                .replace(/\s/g, "")}-${size}-${Date.now()
                .toString(36)
                .slice(-4)}`,
            }))
          ),
        },
      },
      include: { variants: true },
    });

    const variantCount = product.variants.length;
    console.log(
      `✅ Created "${product.name}" — ${variantCount} variants (${p.colors.length} colors × ${sizes.length} sizes)`
    );
    created++;
  }

  console.log(`\n🎉 Seed complete!`);
  console.log(`   Created: ${created} products`);
  console.log(`   Skipped: ${skipped} products (already existed)`);

  const totalProducts = await prisma.product.count();
  const totalVariants = await prisma.productVariant.count();
  console.log(`\n📊 Database totals: ${totalProducts} products, ${totalVariants} variants`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
