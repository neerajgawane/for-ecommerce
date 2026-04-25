/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    thisMonthRevenue: number;
    totalOrders: number;
    weekOrders: number;
    totalCustomers: number;
    totalProducts: number;
    avgOrderValue: number;
  };
  dailyData: { date: string; revenue: number; orders: number }[];
  topProducts: {
    id: string;
    name: string;
    category: string;
    totalSold: number;
    totalRevenue: number;
    orderCount: number;
  }[];
  statusDistribution: { status: string; count: number }[];
  categoryRevenue: { category: string; revenue: number; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  processing: '#8B5CF6',
  shipped: '#6366F1',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartRange, setChartRange] = useState<'7' | '30'>('30');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Failed to load analytics</p>
          <p className="text-sm text-gray-400">{error}</p>
          <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, dailyData, topProducts, statusDistribution, categoryRevenue } = data;

  // Filter chart data by range
  const filteredDaily = chartRange === '7' ? dailyData.slice(-7) : dailyData;

  // Chart calculations
  const maxRevenue = Math.max(...filteredDaily.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...filteredDaily.map((d) => d.orders), 1);
  const totalStatusCount = statusDistribution.reduce((s, d) => s + d.count, 0) || 1;

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-gray-500">Overview of your store performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${overview.totalRevenue.toLocaleString()}`}
          subtitle={`This month: ₹${overview.thisMonthRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={overview.thisMonthRevenue > 0 ? 'up' : undefined}
        />
        <StatCard
          title="Total Orders"
          value={overview.totalOrders.toString()}
          subtitle={`${overview.weekOrders} this week`}
          icon={ShoppingCart}
          trend={overview.weekOrders > 0 ? 'up' : undefined}
        />
        <StatCard
          title="Total Customers"
          value={overview.totalCustomers.toString()}
          subtitle="Registered users"
          icon={Users}
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${overview.avgOrderValue.toLocaleString()}`}
          subtitle={`${overview.totalProducts} active products`}
          icon={Package}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <p className="text-sm text-gray-500">Daily revenue for the selected period</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartRange('7')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                chartRange === '7' ? 'bg-white text-black shadow-sm' : 'text-gray-500'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setChartRange('30')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                chartRange === '30' ? 'bg-white text-black shadow-sm' : 'text-gray-500'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-14 flex flex-col justify-between text-right pr-2">
            <span className="text-[10px] text-gray-400">{formatCurrency(maxRevenue)}</span>
            <span className="text-[10px] text-gray-400">{formatCurrency(maxRevenue / 2)}</span>
            <span className="text-[10px] text-gray-400">₹0</span>
          </div>

          {/* Chart area */}
          <div className="ml-14">
            <div className="flex items-end gap-[2px] h-52">
              {filteredDaily.map((day, i) => {
                const barH = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 group relative flex flex-col items-center justify-end"
                  >
                    <div
                      className="w-full bg-black/80 rounded-t-sm hover:bg-black transition-colors min-h-[2px]"
                      style={{ height: `${barH}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-[10px] px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                        <p className="font-semibold">₹{day.revenue.toLocaleString()}</p>
                        <p className="text-gray-300">{day.orders} orders</p>
                        <p className="text-gray-400">{formatDateShort(day.date)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-gray-400">{formatDateShort(filteredDaily[0]?.date || '')}</span>
              <span className="text-[10px] text-gray-400">{formatDateShort(filteredDaily[filteredDaily.length - 1]?.date || '')}</span>
            </div>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Period Revenue</p>
            <p className="text-lg font-bold mt-1">₹{filteredDaily.reduce((s, d) => s + d.revenue, 0).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Period Orders</p>
            <p className="text-lg font-bold mt-1">{filteredDaily.reduce((s, d) => s + d.orders, 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Avg Daily Revenue</p>
            <p className="text-lg font-bold mt-1">
              ₹{Math.round(filteredDaily.reduce((s, d) => s + d.revenue, 0) / (filteredDaily.length || 1)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Top Products</h2>
          <p className="text-sm text-gray-500 mb-4">Best selling products by units sold</p>
          {topProducts.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="w-10 h-10 mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No sales data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, i) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">₹{product.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{product.totalSold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Order Status</h2>
          <p className="text-sm text-gray-500 mb-4">Distribution of all orders by status</p>
          {statusDistribution.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingCart className="w-10 h-10 mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Visual bar */}
              <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
                {statusDistribution.map((s) => (
                  <div
                    key={s.status}
                    className="transition-all duration-500"
                    style={{
                      width: `${(s.count / totalStatusCount) * 100}%`,
                      backgroundColor: STATUS_COLORS[s.status] || '#9CA3AF',
                    }}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {statusDistribution.map((s) => (
                  <div key={s.status} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[s.status] || '#9CA3AF' }}
                    />
                    <span className="text-sm capitalize text-gray-700">{s.status}</span>
                    <span className="text-sm font-semibold text-gray-900 ml-auto">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Revenue */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Revenue by Category</h2>
        <p className="text-sm text-gray-500 mb-4">Sales performance across product categories</p>
        {categoryRevenue.length === 0 ? (
          <div className="py-8 text-center">
            <BarChart3 className="w-10 h-10 mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No category data yet</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categoryRevenue.map((cat) => {
              const maxCatRevenue = Math.max(...categoryRevenue.map((c) => c.revenue), 1);
              const pct = Math.round((cat.revenue / maxCatRevenue) * 100);
              return (
                <div key={cat.category} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-1 capitalize">{cat.category}</p>
                  <p className="text-xl font-bold text-gray-900">₹{cat.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{cat.count} items sold</p>
                  <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stat Card Component ──
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-500" />}
        {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
        <p className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
