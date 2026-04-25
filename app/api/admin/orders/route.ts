import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  variants: {
                    select: { frontImage: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.order.count({ where }),
    ]);

    // Get status counts for filters
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const statusCountMap: Record<string, number> = {};
    for (const sc of statusCounts) {
      statusCountMap[sc.status] = sc._count.id;
    }

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        total: o.totalAmount,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        shippingAddress: o.shippingAddress,
        shippingCity: o.shippingCity,
        shippingState: o.shippingState,
        shippingPincode: o.shippingPincode,
        itemsCount: o.items.length,
        items: o.items.map((item) => ({
          id: item.id,
          productName: item.product?.name || 'Custom Design',
          productImage: item.product?.variants?.[0]?.frontImage || null,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      statusCounts: statusCountMap,
    });
  } catch (error) {
    console.error('❌ Admin orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
