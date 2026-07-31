import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/customers — fetch all customers with order stats
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('order') || 'desc';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
          orders: {
            select: { totalAmount: true, status: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.user.count({ where }),
    ]);

    const customersData = customers.map((c) => {
      const totalSpent = c.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const lastOrder = c.orders.length > 0 ? c.orders[c.orders.length - 1] : null;

      return {
        id: c.id,
        name: c.name || 'No Name',
        email: c.email,
        image: c.image,
        createdAt: c.createdAt,
        totalOrders: c._count.orders,
        totalSpent: Math.round(totalSpent),
        lastOrderStatus: lastOrder?.status || null,
      };
    });

    return NextResponse.json({
      customers: customersData,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('❌ Customers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
