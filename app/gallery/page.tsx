/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Palette, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';

interface GalleryProduct {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  printPrice: number;
  isFeatured: boolean;
  variants: Array<{
    frontImage: string;
    backImage: string;
    colorName: string;
  }>;
}

export default function GalleryPage() {
  const [products, setProducts] = useState<GalleryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const productsArray = Array.isArray(data) ? data : [];
        setProducts(productsArray);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['all', ...new Set(products.map((p) => p.category))];
  const filteredProducts =
    filter === 'all' ? products : products.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      {/* Header */}
      <div className="border-b border-[#E8E2D9] px-5 lg:px-10 py-12 max-w-[1440px] mx-auto">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">
          Browse &amp; Customize
        </p>
        <h1
          className="text-4xl lg:text-5xl text-[#1C1C1C] leading-none"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontWeight: 500,
          }}
        >
          Design Gallery
        </h1>
        <p className="text-sm text-[#6B6055] font-light mt-3 max-w-xl">
          Explore our collection of ready-to-wear designs, or head to the studio to
          create something entirely your own.
        </p>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-10">
        {/* Category Filters */}
        {categories.length > 1 && (
          <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-[11px] uppercase tracking-[0.18em] font-semibold px-5 py-2.5 border transition-colors whitespace-nowrap ${
                  filter === cat
                    ? 'bg-[#1C1C1C] text-[#FAF8F5] border-[#1C1C1C]'
                    : 'bg-transparent text-[#6B6055] border-[#D9D4CC] hover:border-[#1C1C1C] hover:text-[#1C1C1C]'
                }`}
              >
                {cat === 'all' ? 'All Designs' : cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="text-[11px] uppercase tracking-widest text-[#8B7355]">
              Loading designs…
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="py-24 text-center">
            <Palette
              className="w-14 h-14 text-[#C8C2B8] mx-auto mb-6"
              strokeWidth={1.5}
            />
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-2 font-medium">
              No designs yet
            </p>
            <h2
              className="text-2xl text-[#1C1C1C] mb-4"
              style={{
                fontFamily:
                  "var(--font-playfair), 'Playfair Display', Georgia, serif",
                fontWeight: 500,
              }}
            >
              The gallery is waiting for you
            </h2>
            <p className="text-sm text-[#6B6055] font-light mb-8 max-w-md mx-auto">
              Be the first to create a custom design. Head to our studio and
              bring your imagination to life.
            </p>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-[11px] uppercase tracking-[0.18em] font-semibold bg-[#1C1C1C] text-[#FAF8F5] hover:bg-[#333] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Open Design Studio
            </Link>
          </div>
        ) : (
          <>
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6 lg:gap-y-14">
              {filteredProducts.map((product) => {
                const frontImg = product.variants?.[0]?.frontImage;
                const backImg = product.variants?.[0]?.backImage;
                const price = product.basePrice + product.printPrice;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-[3/4] bg-[#F0EDE8] overflow-hidden mb-4">
                      {frontImg && frontImg !== '/placeholder.png' ? (
                        <>
                          <img
                            src={frontImg}
                            alt={product.name}
                            className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                          />
                          {backImg && backImg !== '/placeholder.png' && (
                            <img
                              src={backImg}
                              alt={`${product.name} back`}
                              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-10 h-10 text-[#C8C2B8]" />
                        </div>
                      )}

                      {/* Featured badge */}
                      {product.isFeatured && (
                        <div className="absolute top-3 left-3 bg-[#1C1C1C] text-[#FAF8F5] px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] font-semibold">
                          Featured
                        </div>
                      )}

                      {/* Color dots */}
                      {product.variants.length > 1 && (
                        <div className="absolute bottom-3 left-3 flex gap-1">
                          {product.variants.slice(0, 4).map((v, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: v.colorName?.toLowerCase() === 'white' ? '#F5F5F5' : '#333' }}
                            />
                          ))}
                          {product.variants.length > 4 && (
                            <span className="w-3.5 h-3.5 rounded-full bg-white/80 border-2 border-white shadow-sm flex items-center justify-center text-[7px] font-bold text-[#6B6055]">
                              +{product.variants.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] tracking-[0.18em] uppercase text-[#8B7355] mb-1 font-medium">
                      {product.category}
                    </p>
                    <h3 className="text-sm font-medium text-[#1C1C1C] mb-1.5 leading-snug group-hover:text-[#8B7355] transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-sm font-semibold text-[#1C1C1C]">
                      ₹{price.toLocaleString()}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-16 py-16 text-center border-t border-[#E8E2D9]">
              <p className="text-[11px] tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-medium">
                Want something unique?
              </p>
              <h2
                className="text-3xl lg:text-4xl text-[#1C1C1C] mb-4 leading-tight"
                style={{
                  fontFamily:
                    "var(--font-playfair), 'Playfair Display', Georgia, serif",
                  fontWeight: 500,
                }}
              >
                Create your own design
              </h2>
              <p className="text-sm text-[#6B6055] font-light mb-8 max-w-lg mx-auto">
                Our design studio lets you upload artwork, add text, and preview
                your custom tee before ordering.
              </p>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2.5 px-10 py-4 text-[11px] uppercase tracking-[0.18em] font-semibold bg-[#1C1C1C] text-[#FAF8F5] hover:bg-[#333] transition-colors"
              >
                Open Design Studio <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}