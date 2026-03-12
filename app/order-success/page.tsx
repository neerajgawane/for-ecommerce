'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Home, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderSuccessPage() {

  // Trigger confetti animation on mount
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#ec4899', '#3b82f6'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a855f7', '#ec4899', '#3b82f6'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // TODO: Get order ID from URL params
  const orderNumber = 'ORD-2024-12345';
  const estimatedDelivery = '5-7 business days';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-6">

        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-black mb-2">Order Placed Successfully! 🎉</h1>
          <p className="text-xl text-gray-600">Thank you for your purchase</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600 mb-2">Order Number</p>
            <p className="text-2xl font-bold">{orderNumber}</p>
          </div>

          <div className="border-t border-b py-6 mb-6">
            <p className="text-center text-gray-600 mb-2">Estimated Delivery</p>
            <p className="text-center text-lg font-semibold">{estimatedDelivery}</p>
          </div>

          {/* What's Next */}
          <div>
            <h3 className="font-bold mb-4">What happens next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">Order Confirmed</p>
                  <p className="text-sm text-gray-600">We have received your order and will start processing it soon</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Design Printing</p>
                  <p className="text-sm text-gray-600">Your custom design will be printed on premium quality t-shirt</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Shipped to You</p>
                  <p className="text-sm text-gray-600">Your order will be shipped to your address within 2-3 days</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Home className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold">Delivered</p>
                  <p className="text-sm text-gray-600">Receive your custom t-shirt and enjoy wearing your art!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            <Package className="w-5 h-5" />
            Track Order
          </Link>

          <Link
            href="/studio"
            className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-black text-black rounded-lg font-semibold hover:bg-black hover:text-white transition"
          >
            Design Another
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Email Confirmation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            📧 Order confirmation email has been sent to your inbox
          </p>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-8">
          <Link href="/" className="text-purple-600 hover:underline font-semibold">
            Continue Shopping →
          </Link>
        </div>
      </div>
    </div>
  );
}