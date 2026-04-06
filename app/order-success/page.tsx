'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Home, ArrowRight } from 'lucide-react';

interface OrderData {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  shippingCity: string;
  shippingState: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
  }>;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const orderNumberParam = searchParams.get('orderNumber');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch {
        // Non-blocking — we still show a success page
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const orderNumber = order?.orderNumber || orderNumberParam || 'FOR-XXXXXX';
  const estimatedDelivery = '3–5 business days';

  const steps = [
    { icon: CheckCircle, color: 'bg-[#1C1C1C]', iconColor: 'text-[#FAF8F5]', title: 'Order Confirmed', desc: 'We\'ve received your order and will begin processing shortly.', active: true },
    { icon: Package, color: 'bg-[#F0EDE8]', iconColor: 'text-[#8B7355]', title: 'Preparing Your Order', desc: 'Your items will be carefully packed with premium materials.', active: false },
    { icon: Truck, color: 'bg-[#F0EDE8]', iconColor: 'text-[#8B7355]', title: 'Shipped', desc: 'Your order will be dispatched and you\'ll receive tracking details.', active: false },
    { icon: Home, color: 'bg-[#F0EDE8]', iconColor: 'text-[#8B7355]', title: 'Delivered', desc: 'Your custom pieces arrive at your doorstep. Enjoy!', active: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F5' }}>
        <div className="text-[11px] uppercase tracking-widest text-[#8B7355]">Loading order details…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      <div className="max-w-3xl mx-auto px-5 py-16 lg:py-24">

        {/* Success header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#1C1C1C] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#FAF8F5]" />
          </div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-medium">Thank you for your order</p>
          <h1
            className="text-4xl lg:text-5xl text-[#1C1C1C] leading-tight mb-3"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            Order Placed Successfully
          </h1>
          <p className="text-sm text-[#6B6055] font-light">
            A confirmation email has been sent to {order?.customerEmail || 'your inbox'}.
          </p>
        </div>

        {/* Order details card */}
        <div className="border border-[#E8E2D9] p-6 lg:p-8 mb-8">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#8B7355] font-medium mb-1">Order Number</p>
              <p className="text-lg font-semibold text-[#1C1C1C] tracking-wide">{orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#8B7355] font-medium mb-1">Estimated Delivery</p>
              <p className="text-lg font-semibold text-[#1C1C1C]">{estimatedDelivery}</p>
            </div>
          </div>

          {order && (
            <div className="border-t border-[#E8E2D9] pt-5 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-[#8B7355] font-medium mb-1">Shipping To</p>
                <p className="text-[#1C1C1C]">{order.customerName}</p>
                <p className="text-[#6B6055] font-light">{order.shippingCity}, {order.shippingState}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-[#8B7355] font-medium mb-1">Payment</p>
                <p className="text-[#1C1C1C] capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] tracking-[0.15em] uppercase text-[#8B7355] font-medium mb-1">Total</p>
                <p className="text-lg font-semibold text-[#1C1C1C]">₹{order.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress steps */}
        <div className="border border-[#E8E2D9] p-6 lg:p-8 mb-8">
          <h3
            className="text-base text-[#1C1C1C] mb-6"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            What happens next
          </h3>
          <div className="space-y-5">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-9 h-9 ${step.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <step.icon className={`w-4.5 h-4.5 ${step.iconColor}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${step.active ? 'text-[#1C1C1C]' : 'text-[#8B7355]'}`}>{step.title}</p>
                  <p className="text-[12px] text-[#6B6055] font-light mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 py-4 bg-[#1C1C1C] text-[#FAF8F5] text-[11px] uppercase tracking-[0.18em] font-semibold hover:bg-[#333] transition-colors"
          >
            <Package className="w-4 h-4" /> View My Orders
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 py-4 border border-[#1C1C1C] text-[#1C1C1C] text-[11px] uppercase tracking-[0.18em] font-semibold hover:bg-[#1C1C1C] hover:text-[#FAF8F5] transition-colors"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F5' }}>
          <div className="text-[11px] uppercase tracking-widest text-[#8B7355]">Loading…</div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}