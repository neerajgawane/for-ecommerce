/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import HeroCollage from '@/components/HeroCollage';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  // Fetch featured products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        // API returns a flat array of products
        const productsArray = Array.isArray(data) ? data : [];
        // Show featured products first, fallback to all products
        const featured = productsArray.filter((p: any) => p.isFeatured);
        setFeaturedProducts((featured.length > 0 ? featured : productsArray).slice(0, 8));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>

      {/* ── HERO COLLAGE ─────────────────────────────────────────── */}
      <HeroCollage />

      {/* ── MARQUEE STRIP ─────────────────────────────────────────── */}
      <div className="bg-[#1C1C1C] text-[#FAF8F5] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap" style={{ animation: 'marquee 25s linear infinite' }}>
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-[10px] tracking-[0.3em] uppercase font-medium mx-8 flex-shrink-0">
              Premium Quality &nbsp;·&nbsp; Fast Delivery &nbsp;·&nbsp; Custom Prints &nbsp;·&nbsp; Made With Care &nbsp;·&nbsp; Free Shipping Above ₹999 &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-5 lg:px-10 max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">Curated for you</p>
              <h2
                className="text-3xl lg:text-4xl text-[#1C1C1C] leading-tight"
                style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
              >
                Featured Products
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase font-semibold text-[#1C1C1C] hover:text-[#8B7355] transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-12">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                category={product.category}
                price={product.basePrice + product.printPrice}
                frontImage={(() => {
                  const img = (product.variants ?? [])[0]?.frontImage || '';
                  return img && img !== '/placeholder.png' ? img : '';
                })()}
                backImage={(() => {
                  const img = (product.variants ?? [])[0]?.backImage;
                  return img && img !== '/placeholder.png' ? img : undefined;
                })()}
                isFeatured={product.isFeatured}
              />
            ))}
          </div>

          <div className="md:hidden mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 text-xs tracking-[0.18em] uppercase font-semibold bg-[#1C1C1C] text-[#FAF8F5] hover:bg-[#333] transition-colors"
            >
              View All Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* ── WHY FOR? ──────────────────────────────────────────────── */}
      <section className="py-20 px-5 lg:px-10" style={{ background: '#F0EDE8' }}>
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            {[
              { num: '01', title: 'Full Customization', desc: 'Complete creative freedom. Design your t-shirt exactly how you want it.' },
              { num: '02', title: 'Premium Quality', desc: 'Soft, breathable fabric with high-definition printing that stands the test of time.' },
              { num: '03', title: 'Fast Delivery', desc: 'Get your custom design delivered in 5–7 days. Fast turnaround, zero compromise.' },
            ].map((item) => (
              <div key={item.num}>
                <span className="text-[11px] tracking-[0.3em] text-[#8B7355] uppercase font-semibold block mb-4">{item.num}</span>
                <h3
                  className="text-xl text-[#1C1C1C] mb-3 leading-snug"
                  style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-[#6B6055] leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 px-5 lg:px-10" style={{ background: '#FAF8F5' }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#8B7355] mb-4 font-medium">Start creating</p>
          <h2
            className="text-4xl lg:text-5xl text-[#1C1C1C] mb-6 leading-[1.1]"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            Ready to design<br />
            <em>your story?</em>
          </h2>
          <p className="text-base text-[#6B6055] mb-10 leading-relaxed font-light">
            Head to our design studio and bring your vision to life in just a few clicks.
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2.5 px-10 py-4 text-xs tracking-[0.18em] uppercase font-semibold bg-[#1C1C1C] text-[#FAF8F5] hover:bg-[#333] transition-colors duration-300"
          >
            Open Design Studio <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}