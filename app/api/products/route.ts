import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch active products for customers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const gender = searchParams.get('gender') || 'all';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isActive: true, // Only show active products
    };

    // Search by name
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Filter by category
    if (category !== 'all') {
      where.category = category;
    }

    // Filter by gender
    if (gender !== 'all') {
      where.gender = {
        has: gender,
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: {
          take: 1, // Just get one variant for preview image
        },
      },
      orderBy: [
        { isFeatured: 'desc' }, // Featured products first
        { createdAt: 'desc' },
      ],
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