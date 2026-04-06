import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ── GET /api/admin/stats — dashboard stats (admin only) ───────────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session?.user as any)?.role;

    if (!session?.user || (role !== 'admin' && role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Run all queries in parallel
    const [totalProducts, totalOrders, revenueResult, recentOrders] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),

      prisma.order.count(),

      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: { not: 'failed' } },
      }),

      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
          items: {
            take: 1,
            select: { 
              product: { select: { name: true } },
              quantity: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = revenueResult._sum.totalAmount || 0;

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: o.customerName,
        product: o.items[0]?.product?.name || 'Custom Design',
        amount: o.totalAmount,
        status: o.status,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error('❌ Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats.' },
      { status: 500 }
    );
  }
}
