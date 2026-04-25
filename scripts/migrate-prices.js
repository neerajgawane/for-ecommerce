const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Get all products that still have printPrice > 0
    const products = await prisma.product.findMany({
      where: { printPrice: { gt: 0 } },
    });
    
    console.log(`Found ${products.length} products to migrate`);
    
    for (const p of products) {
      const newBasePrice = p.basePrice + p.printPrice;
      await prisma.product.update({
        where: { id: p.id },
        data: {
          basePrice: newBasePrice,
          printPrice: 0,
        },
      });
      console.log(`  ✅ "${p.name}": ${p.basePrice}+${p.printPrice} → ₹${newBasePrice}`);
    }
    
    console.log('Migration complete!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
