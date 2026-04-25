import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ── GET /api/admin/stats — enhanced dashboard stats ───────────────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session?.user as any)?.role;

    if (!session?.user || (role !== 'admin' && role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel
    const [
      totalProducts,
      totalOrders,
      revenueResult,
      monthRevenueResult,
      totalCustomers,
      weekOrders,
      pendingOrders,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),

      prisma.order.count(),

      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: { not: 'failed' } },
      }),

      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          paymentStatus: { not: 'failed' },
          createdAt: { gte: startOfMonth },
        },
      }),

      prisma.user.count(),

      prisma.order.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),

      prisma.order.count({
        where: { status: 'pending' },
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
          paymentStatus: true,
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

      // Low stock variants (stock < 10)
      prisma.productVariant.findMany({
        where: { stock: { lt: 10 } },
        select: {
          id: true,
          colorName: true,
          size: true,
          stock: true,
          product: { select: { id: true, name: true } },
        },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
    ]);

    const totalRevenue = revenueResult._sum.totalAmount || 0;
    const thisMonthRevenue = monthRevenueResult._sum.totalAmount || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return NextResponse.json({
      totalRevenue,
      thisMonthRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      weekOrders,
      pendingOrders,
      avgOrderValue,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: o.customerName,
        product: o.items[0]?.product?.name || 'Custom Design',
        amount: o.totalAmount,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
      })),
      lowStockProducts: lowStockProducts.map((v) => ({
        id: v.id,
        productId: v.product.id,
        productName: v.product.name,
        colorName: v.colorName,
        size: v.size,
        stock: v.stock,
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
