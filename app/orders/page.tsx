'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  product?: {
    id: string;
    name: string;
    category: string;
    variants?: Array<{ frontImage: string }>;
  } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Confirmed' },
  processing: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Processing' },
  shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Shipped' },
  delivered: { bg: 'bg-green-50', text: 'text-green-700', label: 'Delivered' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/orders');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [status]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F5' }}>
        <div className="text-[11px] uppercase tracking-widest text-[#8B7355]">Loading orders…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      {/* Header */}
      <div className="border-b border-[#E8E2D9] px-5 lg:px-10 py-12 max-w-[1440px] mx-auto">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">
          {session?.user?.name ? `Hello, ${session.user.name}` : 'Your Account'}
        </p>
        <h1
          className="text-4xl lg:text-5xl text-[#1C1C1C] leading-none"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
        >
          My Orders
        </h1>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-10">
        {orders.length === 0 ? (
          <div className="py-24 text-center">
            <Package className="w-12 h-12 text-[#C8C2B8] mx-auto mb-6" strokeWidth={1.5} />
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-2 font-medium">No orders yet</p>
            <h2
              className="text-2xl text-[#1C1C1C] mb-6"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
            >
              You haven&apos;t placed any orders
            </h2>
            <p className="text-sm text-[#6B6055] font-light mb-8">Browse our collection and place your first order.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-semibold bg-[#1C1C1C] text-[#FAF8F5] hover:bg-[#333] transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
              const firstItem = order.items[0];
              const firstImage = firstItem?.product?.variants?.[0]?.frontImage;

              return (
                <Link
                  key={order.id}
                  href={`/order-success?id=${order.id}&orderNumber=${order.orderNumber}`}
                  className="block border border-[#E8E2D9] hover:border-[#8B7355] transition-colors"
                >
                  <div className="p-5 lg:p-6 flex items-center gap-4 lg:gap-6">
                    {/* Image */}
                    <div className="w-16 h-20 lg:w-20 lg:h-24 bg-[#F0EDE8] flex-shrink-0 overflow-hidden">
                      {firstImage ? (
                        <img src={firstImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-[#C8C2B8]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <p className="text-sm font-medium text-[#1C1C1C]">{order.orderNumber}</p>
                          <p className="text-[11px] text-[#8B7355] mt-0.5">{formatDate(order.createdAt)}</p>
                        </div>
                        <span className={`text-[10px] tracking-[0.1em] uppercase font-semibold px-2.5 py-1 ${statusStyle.bg} ${statusStyle.text}`}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#6B6055] font-light truncate">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        {firstItem?.product?.name ? ` · ${firstItem.product.name}` : ''}
                        {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-[#1C1C1C]">₹{order.totalAmount.toLocaleString()}</span>
                        <span className="text-[10px] uppercase tracking-wider text-[#8B7355] capitalize">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#C8C2B8] flex-shrink-0 hidden lg:block" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
