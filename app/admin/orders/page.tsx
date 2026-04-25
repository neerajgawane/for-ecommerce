/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  Download,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
  size: string;
  color: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  itemsCount: number;
  items: OrderItem[];
  shippingCity: string;
  shippingState: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: any; bg: string }> = {
  pending: { color: 'text-amber-700', icon: Clock, bg: 'bg-amber-50 border-amber-200' },
  confirmed: { color: 'text-blue-700', icon: CheckCircle, bg: 'bg-blue-50 border-blue-200' },
  processing: { color: 'text-purple-700', icon: Package, bg: 'bg-purple-50 border-purple-200' },
  shipped: { color: 'text-indigo-700', icon: Truck, bg: 'bg-indigo-50 border-indigo-200' },
  delivered: { color: 'text-green-700', icon: CheckCircle, bg: 'bg-green-50 border-green-200' },
  cancelled: { color: 'text-red-700', icon: XCircle, bg: 'bg-red-50 border-red-200' },
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', currentPage.toString());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      setOrders(data.orders || []);
      setStatusCounts(data.statusCounts || {});
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Order Number', 'Customer', 'Email', 'Phone', 'Total', 'Status', 'Payment', 'City', 'Date'];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.customerName,
      o.customerEmail,
      o.customerPhone,
      o.total,
      o.status,
      o.paymentStatus,
      o.shippingCity,
      new Date(o.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const allStatusCount = Object.values(statusCounts).reduce((s, c) => s + c, 0);

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: allStatusCount },
    { value: 'pending', label: 'Pending', count: statusCounts.pending || 0 },
    { value: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed || 0 },
    { value: 'processing', label: 'Processing', count: statusCounts.processing || 0 },
    { value: 'shipped', label: 'Shipped', count: statusCounts.shipped || 0 },
    { value: 'delivered', label: 'Delivered', count: statusCounts.delivered || 0 },
    { value: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled || 0 },
  ];

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalCount} total orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOrders()}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportCSV}
            className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number, customer name, or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition text-sm ${
              showFilters ? 'border-black bg-gray-50' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {statusFilter !== 'all' && (
              <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">1</span>
            )}
          </button>
        </div>

        {/* Status Filter Pills */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setStatusFilter(option.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  statusFilter === option.value
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Showing {orders.length} of {totalCount} orders
        {statusFilter !== 'all' && (
          <button
            onClick={() => setStatusFilter('all')}
            className="ml-2 text-black underline"
          >
            Clear filter
          </button>
        )}
      </p>

      {/* Orders List - Mobile */}
      <div className="block md:hidden space-y-3">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers start placing them</p>
          </div>
        ) : (
          orders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;

            return (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)} · {formatTime(order.createdAt)}</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${config.bg} ${config.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {order.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${PAYMENT_STATUS_COLORS[order.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>

                  {/* Quick status update */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      disabled={updatingOrderId === order.id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Orders Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-600 font-medium">No orders found</p>
                    <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers start placing them</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const StatusIcon = config.icon;
                  const isExpanded = expandedOrder === order.id;

                  return (
                    <>
                      <tr key={order.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-sm text-gray-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400">{order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-sm text-gray-900">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{order.customerEmail}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-sm text-gray-900">₹{order.total.toLocaleString()}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={updatingOrderId === order.id || order.status === 'delivered' || order.status === 'cancelled'}
                            className={`text-xs px-2 py-1 rounded-lg font-medium border transition disabled:opacity-60 ${config.bg} ${config.color}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PAYMENT_STATUS_COLORS[order.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
                          <p className="text-xs text-gray-400">{formatTime(order.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedOrder(isExpanded ? null : order.id);
                            }}
                            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            {isExpanded ? 'Hide' : 'Details'}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded order details row */}
                      {isExpanded && (
                        <tr key={`${order.id}-details`}>
                          <td colSpan={7} className="px-4 py-4 bg-gray-50 border-t border-b">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Items */}
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Items</p>
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                                      {item.productImage ? (
                                        <img src={item.productImage} alt="" className="w-10 h-10 object-cover rounded" />
                                      ) : (
                                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                          <Package className="w-4 h-4 text-gray-300" />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.productName}</p>
                                        <p className="text-xs text-gray-500">Size: {item.size} · Qty: {item.quantity}</p>
                                      </div>
                                      <p className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Shipping & Contact */}
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Details</p>
                                <div className="p-3 bg-white rounded-lg border space-y-2 text-sm">
                                  <p><span className="text-gray-500">Name:</span> {order.customerName}</p>
                                  <p><span className="text-gray-500">Email:</span> {order.customerEmail}</p>
                                  <p><span className="text-gray-500">Phone:</span> {order.customerPhone}</p>
                                  <p><span className="text-gray-500">Location:</span> {order.shippingCity}, {order.shippingState}</p>
                                  <p><span className="text-gray-500">Payment:</span> {order.paymentMethod}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}