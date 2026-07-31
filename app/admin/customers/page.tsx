/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Users,
  ShoppingBag,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  ArrowUpDown,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderStatus: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, sortBy, sortOrder]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchCustomers();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', currentPage.toString());
      params.set('sort', sortBy);
      params.set('order', sortOrder);

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      setCustomers(data.customers || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Registered', 'Total Orders', 'Total Spent'];
    const rows = customers.map((c) => [
      c.name,
      c.email,
      new Date(c.createdAt).toLocaleDateString(),
      c.totalOrders,
      `₹${c.totalSpent}`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  if (isLoading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalCount} registered {totalCount === 1 ? 'customer' : 'customers'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCustomers()}
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

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">With Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {customers.filter((c) => c.totalOrders > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{customers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Spend</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{customers.length > 0
              ? Math.round(
                  customers.reduce((s, c) => s + c.totalSpent, 0) /
                    customers.filter((c) => c.totalOrders > 0).length || 1
                ).toLocaleString()
              : 0}
          </p>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {customers.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 font-medium">No customers found</p>
            <p className="text-sm text-gray-400 mt-1">Customers will appear once they register</p>
          </div>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {customer.image ? (
                    <img src={customer.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-500">
                      {(customer.name || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{customer.name}</p>
                  <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(customer.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      {customer.totalOrders} orders
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">₹{customer.totalSpent.toLocaleString()}</p>
                  {customer.lastOrderStatus && (
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[customer.lastOrderStatus] || 'bg-gray-100 text-gray-700'}`}>
                      {customer.lastOrderStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 hover:text-black transition">
                    Joined <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <button onClick={() => toggleSort('orders')} className="flex items-center gap-1 hover:text-black transition">
                    Orders <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Spent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-600 font-medium">No customers found</p>
                    <p className="text-sm text-gray-400 mt-1">Customers will appear once they register</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {customer.image ? (
                            <img src={customer.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-semibold text-gray-500">
                              {(customer.name || 'U')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{customer.name}</p>
                          <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-gray-900">{formatDate(customer.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-gray-900">{customer.totalOrders}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-bold text-gray-900">₹{customer.totalSpent.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {customer.lastOrderStatus ? (
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[customer.lastOrderStatus] || 'bg-gray-100 text-gray-700'}`}>
                          {customer.lastOrderStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No orders</span>
                      )}
                    </td>
                  </tr>
                ))
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
