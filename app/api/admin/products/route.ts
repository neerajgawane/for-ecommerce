import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    // Build variant data with auto-generated SKUs
    const variantsData = Array.isArray(body.variants)
      ? body.variants.map((v: { color: string; colorName: string; size: string; frontImage: string; backImage: string; stock: number }, idx: number) => ({
          color: v.color,
          colorName: v.colorName,
          size: v.size,
          frontImage: v.frontImage,
          backImage: v.backImage || v.frontImage, // fallback to front if no back
          stock: v.stock || 50,
          sku: `${(body.name || 'PROD').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}-${v.colorName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}-${v.size}-${Date.now()}-${idx}`,
        }))
      : [];

    const product = await prisma.product.create({
      data: {
        name: String(body.name),
        description: body.description ? String(body.description) : null,
        basePrice: Number(body.basePrice),
        printPrice: Number(body.printPrice),
        category: body.category ? String(body.category) : 't-shirt',
        gender: body.gender ? String(body.gender) : 'unisex',
        fit: body.fit ? String(body.fit) : 'regular',
        isFeatured: Boolean(body.isFeatured),
        isActive: true,
        stockCount: 100,
        variants: {
          create: variantsData,
        },
      },
      include: {
        variants: true,
      },
    });

    console.log(`✅ Product "${product.name}" created with ${product.variants.length} variants`);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product: ' + (error as Error).message },
      { status: 500 }
    );
  }
}