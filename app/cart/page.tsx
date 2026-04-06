'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();
  const shipping = totalPrice >= 999 ? 0 : 79;
  const finalTotal = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: '#FAF8F5' }}>
        <ShoppingBag className="w-16 h-16 text-[#C8C2B8] mb-6" strokeWidth={1.5} />
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-2 font-medium">Nothing here yet</p>
        <h1
          className="text-3xl text-[#1C1C1C] mb-4"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
        >
          Your bag is empty
        </h1>
        <p className="text-sm text-[#6B6055] font-light mb-8 text-center max-w-sm">
          Looks like you haven&apos;t added anything to your bag yet. Browse our collection to find something you love.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2.5 px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-semibold bg-[#1C1C1C] text-[#FAF8F5] hover:bg-[#333] transition-colors"
        >
          Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      {/* Header */}
      <div className="border-b border-[#E8E2D9] px-5 lg:px-10 py-10 max-w-[1440px] mx-auto">
        <Link href="/products" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8B7355] hover:text-[#1C1C1C] transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        <h1
          className="text-4xl lg:text-5xl text-[#1C1C1C] leading-none"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
        >
          Shopping Bag
        </h1>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-10">
        <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-0">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex gap-4 lg:gap-6 py-6 ${index !== items.length - 1 ? 'border-b border-[#E8E2D9]' : ''}`}
              >
                {/* Image */}
                <div className="w-24 h-32 lg:w-28 lg:h-36 bg-[#F0EDE8] flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-[#C8C2B8]" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <p className="text-[10px] tracking-[0.18em] uppercase text-[#8B7355] mb-1 font-medium">
                      {item.gender || 'Unisex'} · {item.fit || 'Regular'} Fit
                    </p>
                    <h3 className="text-sm font-medium text-[#1C1C1C] leading-snug mb-1 truncate">{item.name}</h3>
                    <p className="text-[11px] text-[#6B6055]">{item.color} · Size {item.size}</p>
                  </div>

                  <div className="flex items-end justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-[#D9D4CC]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1.5 hover:bg-[#F0EDE8] transition-colors text-[#6B6055]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-4 py-1.5 text-sm font-medium text-[#1C1C1C] border-l border-r border-[#D9D4CC] min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-[#F0EDE8] transition-colors text-[#6B6055]"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price + Remove */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-[#1C1C1C]">
                        ₹{((item.basePrice + item.printPrice) * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#B5A898] hover:text-[#1C1C1C] transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <div className="pt-4">
              <button
                onClick={clearCart}
                className="text-[11px] uppercase tracking-widest text-[#8B7355] hover:text-[#1C1C1C] transition-colors font-medium"
              >
                Clear bag
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-[#E8E2D9] p-6 lg:p-8">
              <h2
                className="text-lg text-[#1C1C1C] mb-6"
                style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
              >
                Order Summary
              </h2>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-[#6B6055] font-light">Subtotal</span>
                  <span className="text-[#1C1C1C] font-medium">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6055] font-light">Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-700' : 'text-[#1C1C1C]'}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-[#8B7355]">Free shipping on orders above ₹999</p>
                )}
              </div>

              <div className="border-t border-[#E8E2D9] pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-[#1C1C1C]">Total</span>
                  <span className="text-lg font-semibold text-[#1C1C1C]">₹{finalTotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-[#8B7355] mt-1">Inclusive of all taxes</p>
              </div>

              <Link href="/checkout">
                <button className="w-full py-4 bg-[#1C1C1C] text-[#FAF8F5] text-[11px] uppercase tracking-[0.18em] font-semibold hover:bg-[#333] transition-colors mb-3">
                  Proceed to Checkout
                </button>
              </Link>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-[#8B7355] tracking-wider">
                <span>🔒 Secure Checkout</span>
                <span>·</span>
                <span>💳 Multiple Payment Options</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}