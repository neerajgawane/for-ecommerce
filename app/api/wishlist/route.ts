import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// ── GET /api/wishlist — return current user's wishlist ─────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          variants: {
            take: 1,
            select: { frontImage: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Map to a clean shape for the frontend
  const wishlist = items.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    category: item.product.category,
    price: item.product.basePrice + item.product.printPrice,
    image: item.product.variants[0]?.frontImage ?? null,
    addedAt: item.createdAt.getTime(),
  }));

  return NextResponse.json(wishlist);
}

// ── POST /api/wishlist — add a product to wishlist ─────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  // Check product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Upsert — ignore if already in wishlist
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });

  return NextResponse.json({ message: 'Added to wishlist' }, { status: 201 });
}

// ── DELETE /api/wishlist?productId=xxx — remove from wishlist ──────────────────
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const productId = req.nextUrl.searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId query param is required' }, { status: 400 });
  }

  await prisma.wishlistItem.deleteMany({
    where: { userId, productId },
  });

  return NextResponse.json({ message: 'Removed from wishlist' });
}
