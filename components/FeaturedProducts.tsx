'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

interface Product {
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

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const productList = Array.isArray(data) ? data : data.products || [];
        setProducts(productList.slice(0, 8));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20" style={{ background: '#FAF8F5' }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10">
          <div className="flex items-center justify-center py-12">
            <div
              className="w-8 h-8 border-2 border-[#E8E2D9] border-t-[#1C1C1C] rounded-full"
              style={{ animation: 'spin 0.8s linear infinite' }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-20" style={{ background: '#FAF8F5' }}>
      <div className="max-w-[1440px] mx-auto px-5 lg:px-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-medium">Curated for you</p>
            <h2
              className="text-3xl lg:text-4xl text-[#1C1C1C] leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6 lg:gap-y-14">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              price={product.basePrice + product.printPrice}
              frontImage={(product.variants ?? [])[0]?.frontImage || ''}
              backImage={(product.variants ?? [])[0]?.backImage}
              isFeatured={product.isFeatured}
            />
          ))}
        </div>
      </div>
    </section>
  );
}