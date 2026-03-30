'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { Mail, Phone, MapPin, CreditCard, Wallet, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
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

  // Pre-fill from NextAuth session
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

  // Check if cart is empty
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push('/cart');
    }
  }, [items, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // TODO: Create order in database
      // const orderResponse = await fetch('/api/checkout', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     items,
      //     ...formData,
      //     subtotal: getTotalPrice(),
      //     tax: Math.round(getTotalPrice() * 0.18),
      //     total: Math.round(getTotalPrice() * 1.18),
      //   }),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (formData.paymentMethod === 'razorpay') {
        // TODO: Initialize Razorpay
        // const options = {
        //   key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        //   amount: Math.round(getTotalPrice() * 1.18) * 100,
        //   currency: 'INR',
        //   name: 'FOR',
        //   description: 'Custom T-Shirt Order',
        //   order_id: orderData.razorpayOrderId,
        //   handler: async (response) => {
        //     // Verify payment
        //     await fetch('/api/payment/verify', {
        //       method: 'POST',
        //       body: JSON.stringify(response),
        //     });
        //     clearCart();
        //     router.push(`/order-success?id=${orderData.id}`);
        //   },
        // };
        // const razorpay = new window.Razorpay(options);
        // razorpay.open();

        // For now, simulate success
        setTimeout(() => {
          clearCart();
          router.push('/order-success');
        }, 1000);
      } else {
        // Cash on Delivery
        clearCart();
        router.push('/order-success');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }


  const subtotal = getTotalPrice();
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </Link>
          <h1 className="text-4xl font-black mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">

              {/* Contact Information */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House No., Building, Street"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">State *</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Select State</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="West Bengal">West Bengal</option>
                        {/* Add more states */}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">PIN Code *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="110001"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${formData.paymentMethod === 'razorpay' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-semibold flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Online Payment
                      </div>
                      <p className="text-sm text-gray-600">Pay securely with card, UPI, net banking</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${formData.paymentMethod === 'cod' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-semibold flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        Cash on Delivery
                      </div>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.size} • {item.color}</p>
                        <p className="text-sm font-bold">₹{item.basePrice + item.printPrice} x {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-2 mb-6 pb-6 border-t border-b py-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (18%)</span>
                    <span>₹{gst}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold mb-6">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${total}`}
                </button>

                {/* Security Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}