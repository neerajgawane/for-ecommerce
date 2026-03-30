import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('📦 API: Returning', products.length, 'products');

    // Make sure we're returning an array
    return NextResponse.json(products);
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}