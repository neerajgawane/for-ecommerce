'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-screen">
        <ShoppingBag className="h-24 w-24 mx-auto mb-4 text-gray-300" />
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some products to get started!</p>
        <Link href="/products">
          <button className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800">
            Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 border p-4 rounded-lg">
              <div className="w-24 h-24 bg-gray-100 rounded relative overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  Color: {item.color} | Size: {item.size}
                </p>
                <p className="font-semibold mt-2">
                  ₹{(item.basePrice + item.printPrice) * item.quantity}
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 border rounded hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 border rounded hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="border p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>
          <Link href="/checkout">
            <button className="w-full bg-black text-white py-3 rounded font-medium hover:bg-gray-800 mb-2">
              Proceed to Checkout
            </button>
          </Link>
          <button
            onClick={clearCart}
            className="w-full border border-gray-300 py-3 rounded font-medium hover:border-black"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}