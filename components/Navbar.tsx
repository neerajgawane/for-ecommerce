'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

const CATEGORIES = [
  { id: 'new', label: 'NEW', href: '/products?featured=true' },
  { id: 't-shirts', label: 'T-SHIRTS', href: '/products?category=t-shirt' },
  { id: 'hoodies', label: 'HOODIES', href: '/products?category=hoodie' },
  { id: 'custom', label: 'CUSTOM DESIGN', href: '/studio' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="text-2xl lg:text-3xl font-bold tracking-tight">
              FOR
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
              <Link href="/products" className="hover:text-gray-600 transition">
                NEW ARRIVALS
              </Link>
              <Link href="/products" className="hover:text-gray-600 transition">
                CLOTHING
              </Link>
              <Link href="/studio" className="hover:text-gray-600 transition">
                CUSTOM DESIGN
              </Link>
              <Link href="/about" className="hover:text-gray-600 transition">
                ABOUT
              </Link>
            </nav>

            {/* Header Actions */}
            <div className="flex items-center gap-4 lg:gap-6">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hover:text-gray-600 transition"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link href="/cart" className="hover:text-gray-600 transition relative">
                <ShoppingBag className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {getTotalItems()}
                  </span>
                )}
              </Link>

              <button className="hidden lg:block hover:text-gray-600 transition">
                <Heart className="w-5 h-5" />
              </button>

              <Link href="/login" className="hover:text-gray-600 transition">
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar (toggleable) */}
        {searchOpen && (
          <div className="border-t border-gray-200 bg-white">
            <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Category Tabs */}
      <div className="sticky top-16 lg:top-20 z-40 bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="text-xs lg:text-sm font-medium whitespace-nowrap pb-1 border-b-2 border-transparent hover:border-black transition"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="text-2xl font-bold">FOR</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-4">
              <Link
                href="/products"
                className="block text-sm font-medium py-2 hover:text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                NEW ARRIVALS
              </Link>
              <Link
                href="/products"
                className="block text-sm font-medium py-2 hover:text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                CLOTHING
              </Link>
              <Link
                href="/studio"
                className="block text-sm font-medium py-2 hover:text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                CUSTOM DESIGN
              </Link>
              <Link
                href="/about"
                className="block text-sm font-medium py-2 hover:text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                ABOUT
              </Link>
            </nav>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}