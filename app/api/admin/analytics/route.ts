import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run all queries in parallel
    const [
      totalRevenue,
      monthRevenue,
      totalOrders,
      weekOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
      topProducts,
      ordersByStatus,
      categoryRevenue,
    ] = await Promise.all([
      // Total revenue (all time)
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: { not: 'failed' } },
      }),

      // This month's revenue
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          paymentStatus: { not: 'failed' },
          createdAt: { gte: startOfMonth },
        },
      }),

      // Total orders
      prisma.order.count(),

      // Orders this week
      prisma.order.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),

      // Total customers
      prisma.user.count(),

      // Total active products
      prisma.product.count({ where: { isActive: true } }),

      // Orders for last 30 days (for chart)
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: {
          id: true,
          totalAmount: true,
          createdAt: true,
          status: true,
          paymentStatus: true,
        },
        orderBy: { createdAt: 'asc' },
      }),

      // Top selling products (by order count)
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, price: true },
        _count: { id: true },
        where: { productId: { not: null } },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Revenue by category (through order items -> products)
      prisma.orderItem.findMany({
        where: { productId: { not: null } },
        select: {
          price: true,
          quantity: true,
          product: {
            select: { category: true },
          },
        },
      }),
    ]);

    // Process daily revenue for chart
    const dailyRevenue: Record<string, { revenue: number; orders: number }> = {};
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      dailyRevenue[key] = { revenue: 0, orders: 0 };
    }
    for (const order of recentOrders) {
      const key = order.createdAt.toISOString().split('T')[0];
      if (dailyRevenue[key]) {
        dailyRevenue[key].revenue += order.totalAmount;
        dailyRevenue[key].orders += 1;
      }
    }
    const dailyData = Object.entries(dailyRevenue).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue),
      orders: data.orders,
    }));

    // Get product names for top products
    const productIds = topProducts
      .map((tp) => tp.productId)
      .filter((id): id is string => id !== null);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const topProductsData = topProducts.map((tp) => ({
      id: tp.productId,
      name: productMap.get(tp.productId!)?.name || 'Unknown',
      category: productMap.get(tp.productId!)?.category || 'unknown',
      totalSold: tp._sum.quantity || 0,
      totalRevenue: Math.round(tp._sum.price || 0),
      orderCount: tp._count.id,
    }));

    // Process order status distribution
    const statusDistribution = ordersByStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
    }));

    // Process category revenue
    const categoryMap: Record<string, { revenue: number; count: number }> = {};
    for (const item of categoryRevenue) {
      const cat = item.product?.category || 'other';
      if (!categoryMap[cat]) categoryMap[cat] = { revenue: 0, count: 0 };
      categoryMap[cat].revenue += item.price * item.quantity;
      categoryMap[cat].count += item.quantity;
    }
    const categoryData = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      revenue: Math.round(data.revenue),
      count: data.count,
    }));

    const allTimeRevenue = totalRevenue._sum.totalAmount || 0;
    const thisMonthRevenue = monthRevenue._sum.totalAmount || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(allTimeRevenue / totalOrders) : 0;

    return NextResponse.json({
      overview: {
        totalRevenue: Math.round(allTimeRevenue),
        thisMonthRevenue: Math.round(thisMonthRevenue),
        totalOrders,
        weekOrders,
        totalCustomers,
        totalProducts,
        avgOrderValue,
      },
      dailyData,
      topProducts: topProductsData,
      statusDistribution,
      categoryRevenue: categoryData,
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
