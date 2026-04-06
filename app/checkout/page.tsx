'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { ArrowLeft, Shield, CreditCard, Wallet, Truck, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'razorpay',
  });

  // Pre-fill from session
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
      }));
    }
    setIsLoading(false);
  }, [session]);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push('/cart');
    }
  }, [items, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            designId: item.designId || '',
            name: item.name,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            gender: item.gender || 'unisex',
            fit: item.fit || 'regular',
          })),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          paymentMethod: formData.paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setIsProcessing(false);
        return;
      }

      if (formData.paymentMethod === 'razorpay') {
        // TODO: Wire up Razorpay SDK here
        // For now, simulate success → treat as COD until Razorpay is integrated
        clearCart();
        router.push(`/order-success?id=${data.orderId}&orderNumber=${data.orderNumber}`);
      } else {
        // Cash on Delivery
        clearCart();
        router.push(`/order-success?id=${data.orderId}&orderNumber=${data.orderNumber}`);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F5' }}>
        <div className="text-[11px] uppercase tracking-widest text-[#8B7355]">Loading checkout…</div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal + shipping;

  const inputClass = "w-full px-4 py-3.5 border border-[#C8C2B8] bg-white text-[#1C1C1C] text-sm placeholder:text-[#B0A898] focus:outline-none focus:border-[#1C1C1C] transition-colors";
  const labelClass = "block text-[11px] uppercase tracking-widest text-[#8B7355] mb-2 font-medium";

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      {/* Header */}
      <div className="border-b border-[#E8E2D9] px-5 lg:px-10 py-10 max-w-[1440px] mx-auto">
        <Link href="/cart" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8B7355] hover:text-[#1C1C1C] transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to bag
        </Link>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">Secure checkout</p>
        <h1
          className="text-4xl lg:text-5xl text-[#1C1C1C] leading-none"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
        >
          Checkout
        </h1>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-10">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">

            {/* Left — Form */}
            <div className="lg:col-span-2 space-y-8">

              {/* Contact */}
              <div>
                <h2
                  className="text-lg text-[#1C1C1C] mb-5"
                  style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
                >
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-name" className={labelClass}>Full Name *</label>
                    <input id="checkout-name" type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required autoComplete="name" />
                  </div>
                  <div>
                    <label htmlFor="checkout-email" className={labelClass}>Email *</label>
                    <input id="checkout-email" type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required autoComplete="email" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="checkout-phone" className={labelClass}>Phone *</label>
                    <input id="checkout-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputClass} required autoComplete="tel" />
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#E8E2D9]" />

              {/* Shipping */}
              <div>
                <h2
                  className="text-lg text-[#1C1C1C] mb-5"
                  style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
                >
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="checkout-address" className={labelClass}>Street Address *</label>
                    <input id="checkout-address" type="text" name="address" value={formData.address} onChange={handleChange} placeholder="House No., Building, Street" className={inputClass} required autoComplete="street-address" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="checkout-city" className={labelClass}>City *</label>
                      <input id="checkout-city" type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} required autoComplete="address-level2" />
                    </div>
                    <div>
                      <label htmlFor="checkout-state" className={labelClass}>State *</label>
                      <select id="checkout-state" name="state" value={formData.state} onChange={handleChange} className={inputClass} required>
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="max-w-xs">
                    <label htmlFor="checkout-pincode" className={labelClass}>PIN Code *</label>
                    <input id="checkout-pincode" type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="400001" className={inputClass} pattern="[0-9]{6}" maxLength={6} required autoComplete="postal-code" />
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#E8E2D9]" />

              {/* Payment Method */}
              <div>
                <h2
                  className="text-lg text-[#1C1C1C] mb-5"
                  style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
                >
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 border cursor-pointer transition ${formData.paymentMethod === 'razorpay' ? 'border-[#1C1C1C] bg-[#F0EDE8]' : 'border-[#D9D4CC] hover:border-[#8B7355]'}`}>
                    <input type="radio" name="paymentMethod" value="razorpay" checked={formData.paymentMethod === 'razorpay'} onChange={handleChange} className="w-4 h-4 accent-[#1C1C1C]" />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-[#1C1C1C] flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Online Payment
                      </div>
                      <p className="text-[11px] text-[#8B7355] mt-0.5">Card, UPI, Net Banking — Powered by Razorpay</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border cursor-pointer transition ${formData.paymentMethod === 'cod' ? 'border-[#1C1C1C] bg-[#F0EDE8]' : 'border-[#D9D4CC] hover:border-[#8B7355]'}`}>
                    <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="w-4 h-4 accent-[#1C1C1C]" />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-[#1C1C1C] flex items-center gap-2">
                        <Wallet className="w-4 h-4" /> Cash on Delivery
                      </div>
                      <p className="text-[11px] text-[#8B7355] mt-0.5">Pay when your order arrives (₹49 extra)</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right — Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 border border-[#E8E2D9] p-6 lg:p-8">
                <h2
                  className="text-lg text-[#1C1C1C] mb-6"
                  style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
                >
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto scrollbar-none">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-18 bg-[#F0EDE8] flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-[#C8C2B8]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1C1C1C] truncate">{item.name}</p>
                        <p className="text-[11px] text-[#8B7355]">{item.size} · {item.color}</p>
                        <p className="text-sm font-medium text-[#1C1C1C] mt-1">
                          ₹{(item.basePrice + item.printPrice).toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="border-t border-[#E8E2D9] pt-4 space-y-2.5 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#6B6055] font-light">Subtotal ({getTotalItems()} items)</span>
                    <span className="text-[#1C1C1C]">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6055] font-light">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-700 font-medium' : 'text-[#1C1C1C]'}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6055] font-light flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> Delivery
                    </span>
                    <span className="text-[11px] text-[#8B7355]">3–5 business days</span>
                  </div>
                </div>

                <div className="border-t border-[#E8E2D9] pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#1C1C1C]">Total</span>
                    <span className="text-lg font-semibold text-[#1C1C1C]">₹{total.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-[#8B7355] mt-1">Inclusive of all taxes</p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#1C1C1C] text-[#FAF8F5] text-[11px] uppercase tracking-[0.18em] font-semibold hover:bg-[#333] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing…' : `Pay ₹${total.toLocaleString()}`}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#8B7355] tracking-wider">
                  <Shield className="w-3.5 h-3.5" />
                  <span>256-bit SSL Encrypted · Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}