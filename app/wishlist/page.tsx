'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight, X } from 'lucide-react';

const STORAGE_KEY = 'for-wishlist';

interface WishlistProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  addedAt: number;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!session?.user;

  // ── Load wishlist ─────────────────────────────────────────────────────────
  const loadWishlist = useCallback(async () => {
    setLoading(true);
    if (isLoggedIn) {
      // Fetch from DB API
      try {
        const res = await fetch('/api/wishlist');
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch {
        setItems([]);
      }
    } else {
      // Fall back to localStorage for guests
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setItems(JSON.parse(raw));
        else setItems([]);
      } catch {
        setItems([]);
      }
    }
    setLoading(false);
  }, [isLoggedIn]);

  useEffect(() => {
    if (status !== 'loading') {
      loadWishlist();
    }
  }, [status, loadWishlist]);

  // ── Remove item ───────────────────────────────────────────────────────────
  const removeItem = async (id: string) => {
    // Optimistic UI update
    const prev = items;
    setItems(items.filter((i) => i.id !== id));

    if (isLoggedIn) {
      try {
        const res = await fetch(`/api/wishlist?productId=${id}`, { method: 'DELETE' });
        if (!res.ok) setItems(prev); // revert on error
      } catch {
        setItems(prev);
      }
    } else {
      const updated = prev.filter((i) => i.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  // ── Clear all ─────────────────────────────────────────────────────────────
  const clearAll = async () => {
    const prev = items;
    setItems([]);

    if (isLoggedIn) {
      try {
        await Promise.all(
          prev.map((item) =>
            fetch(`/api/wishlist?productId=${item.id}`, { method: 'DELETE' })
          )
        );
      } catch {
        setItems(prev);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      {/* Header */}
      <div className="border-b border-[#E8E2D9] px-5 lg:px-10 py-12 max-w-[1440px] mx-auto">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">
          My Collection
        </p>
        <h1
          className="text-4xl lg:text-5xl text-[#1C1C1C] leading-none"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontWeight: 500,
          }}
        >
          Wishlist
        </h1>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-12">
        {/* Not logged in banner */}
        {!session && (
          <div className="border border-[#E8E2D9] bg-[#F0EDE8] px-6 py-5 flex items-start gap-4 mb-10">
            <Heart className="w-5 h-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#1C1C1C] mb-1">Save your wishlist forever</p>
              <p className="text-sm text-[#6B6055] font-light">
                Sign in to sync your wishlist across devices and never lose your favourite picks.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-3 text-[11px] uppercase tracking-widest font-semibold text-[#1C1C1C] border border-[#1C1C1C] px-5 py-2.5 hover:bg-[#1C1C1C] hover:text-[#FAF8F5] transition-colors"
              >
                Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="text-[11px] uppercase tracking-widest text-[#8B7355]">Loading…</div>
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <div className="py-24 text-center">
            <Heart className="w-12 h-12 text-[#C8C2B8] mx-auto mb-6" strokeWidth={1.5} />
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-2 font-medium">
              Nothing saved yet
            </p>
            <h2
              className="text-2xl text-[#1C1C1C] mb-6"
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                fontWeight: 500,
              }}
            >
              Your wishlist is empty
            </h2>
            <p className="text-sm text-[#6B6055] font-light mb-8">
              Browse our collection and tap the heart icon to save pieces you love.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-semibold bg-[#1C1C1C] text-[#FAF8F5] hover:bg-[#333] transition-colors"
            >
              Shop All Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-[#8B7355]">
                {items.length} item{items.length !== 1 ? 's' : ''} saved
              </p>
              <button
                onClick={clearAll}
                className="text-[11px] uppercase tracking-widest text-[#8B7355] hover:text-[#1C1C1C] transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
              {items.map((item) => (
                <div key={item.id} className="group relative">
                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 z-10 w-7 h-7 bg-white border border-[#E8E2D9] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#1C1C1C] hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <Link href={`/products/${item.id}`} className="block">
                    <div className="aspect-[3/4] bg-[#F0EDE8] overflow-hidden mb-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-10 h-10 text-[#C8C2B8]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] tracking-[0.18em] uppercase text-[#8B7355] mb-1 font-medium">
                      {item.category}
                    </p>
                    <h3 className="text-sm font-medium text-[#1C1C1C] mb-1.5 leading-snug group-hover:text-[#8B7355] transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-sm font-semibold text-[#1C1C1C]">₹{item.price.toLocaleString()}</span>
                  </Link>

                  <Link
                    href={`/products/${item.id}`}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-[#1C1C1C] text-[10px] uppercase tracking-widest font-semibold text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-[#FAF8F5] transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-[#8B7355] hover:text-[#1C1C1C] transition-colors"
              >
                Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
