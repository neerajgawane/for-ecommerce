import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
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

    const product = await prisma.product.create({
      data: {
        name: String(body.name),
        description: body.description ? String(body.description) : null,
        basePrice: Number(body.basePrice),
        printPrice: Number(body.printPrice),
        category: body.category ? String(body.category) : 't-shirt',
        gender: Array.isArray(body.gender) ? body.gender : [],
        fits: Array.isArray(body.fits) ? body.fits : [],
        isFeatured: Boolean(body.isFeatured),
        isActive: true,
        stockCount: 100,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}