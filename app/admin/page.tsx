/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Users,
  Clock,
  AlertTriangle,
  Plus,
  Eye,
  BarChart3,
} from 'lucide-react';

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

interface LowStockItem {
  id: string;
  productId: string;
  productName: string;
  colorName: string;
  size: string;
  stock: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    thisMonthRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    weekOrders: 0,
    pendingOrders: 0,
    avgOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalRevenue: data.totalRevenue || 0,
          thisMonthRevenue: data.thisMonthRevenue || 0,
          totalOrders: data.totalOrders || 0,
          totalProducts: data.totalProducts || 0,
          totalCustomers: data.totalCustomers || 0,
          weekOrders: data.weekOrders || 0,
          pendingOrders: data.pendingOrders || 0,
          avgOrderValue: data.avgOrderValue || 0,
        });
        setRecentOrders(data.recentOrders || []);
        setLowStockProducts(data.lowStockProducts || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/analytics">
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </Link>
          <Link href="/admin/products/new">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              ₹{stats.thisMonthRevenue.toLocaleString()} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.weekOrders} this week · {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.avgOrderValue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalProducts} active products
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" /> Recent Orders
              </CardTitle>
              <Link href="/admin/orders" className="text-xs text-gray-500 hover:text-black transition underline">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No orders yet</p>
                <p className="text-xs text-gray-400 mt-1">Orders will appear here once customers start placing them</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.slice(0, 8).map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{order.orderNumber}</p>
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{order.customer} · {order.product}</p>
                      <p className="text-[10px] text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-sm font-bold">₹{order.amount.toLocaleString()}</span>
                      <p className={`text-[10px] ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        {order.paymentStatus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">All products are well stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">{item.colorName} · {item.size}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-sm font-bold ${item.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {item.stock === 0 ? 'Out of stock' : `${item.stock} left`}
                      </span>
                      <Link href={`/admin/products/${item.productId}/edit`}>
                        <button className="p-1 hover:bg-gray-100 rounded transition">
                          <Eye className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 md:grid-cols-4">
        <Link href="/admin/products/new" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-black transition group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Add Product</p>
              <p className="text-xs text-gray-400">Create new product</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/orders" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-black transition group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">View Orders</p>
              <p className="text-xs text-gray-400">Manage fulfillment</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/analytics" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-black transition group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Analytics</p>
              <p className="text-xs text-gray-400">View reports</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/settings" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-black transition group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Settings</p>
              <p className="text-xs text-gray-400">Store configuration</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}