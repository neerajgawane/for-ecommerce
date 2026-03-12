'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, ArrowRight, Eye } from 'lucide-react';

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
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        // Show only first 8 products (or featured ones)
        const featured = data.products.slice(0, 8);
        setProducts(featured);
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header - Matching your homepage style */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black mb-2">Featured Products</h2>
            <p className="text-gray-600">Ready-to-wear custom designs</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 text-black font-semibold hover:gap-3 transition-all group"
          >
            View All
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Products Grid - Matching your New Arrivals style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Product Image */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-gray-100">
                {product.variants[0]?.frontImage ? (
                  <>
                    {/* Front Image */}
                    <img
                      src={product.variants[0].frontImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition duration-500"
                      style={{
                        opacity: hoveredProduct === product.id && product.variants[0]?.backImage ? 0 : 1,
                        transform: hoveredProduct === product.id ? 'scale(1.05)' : 'scale(1)'
                      }}
                      loading="lazy"
                    />
                    {/* Back Image (shows on hover) */}
                    {product.variants[0]?.backImage && (
                      <img
                        src={product.variants[0].backImage}
                        alt={`${product.name} back`}
                        className="absolute inset-0 w-full h-full object-cover transition duration-500"
                        style={{
                          opacity: hoveredProduct === product.id ? 1 : 0,
                          transform: hoveredProduct === product.id ? 'scale(1.05)' : 'scale(1)'
                        }}
                        loading="lazy"
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                  </div>
                )}

                {/* Featured Badge */}
                {product.isFeatured && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
                    New
                  </div>
                )}

                {/* Quick View Button - Matching your style */}
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              {/* Product Info */}
              <h3 className="font-semibold mb-1 group-hover:text-purple-600 transition">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 uppercase mb-1">{product.category}</p>
              <p className="text-lg font-bold">₹{product.basePrice + product.printPrice}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}