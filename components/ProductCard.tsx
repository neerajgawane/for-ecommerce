'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  frontImage: string;
  backImage?: string;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
}

export default function ProductCard({
  id,
  name,
  category,
  price,
  frontImage,
  backImage,
  isFeatured = false,
  rating,
  reviewCount,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/products/${id}`}
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div
        className="relative aspect-[3/4] bg-[#F0EDE8] mb-3 overflow-hidden rounded-sm"
        style={{
          boxShadow: isHovered
            ? '0 8px 30px rgba(0,0,0,0.10)'
            : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Front Image */}
        {frontImage ? (
          <img
            src={frontImage}
            alt={name}
            className="w-full h-full object-cover transition-all duration-500"
            style={{
              opacity: isHovered && backImage ? 0 : 1,
              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-[#C8BFB4]" />
          </div>
        )}

        {/* Back Image (shown on hover) */}
        {backImage && (
          <img
            src={backImage}
            alt={`${name} back`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        )}

        {/* New Arrival Badge */}
        {isFeatured && (
          <div
            className="absolute top-3 left-3 text-[10px] font-semibold tracking-widest uppercase px-2 py-1"
            style={{
              background: '#1C1C1C',
              color: '#FAF8F5',
              letterSpacing: '0.12em',
            }}
          >
            New
          </div>
        )}

        {/* Wishlist */}
        <button
          className="absolute top-3 right-3 w-8 h-8 bg-[#FAF8F5]/90 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[#1C1C1C] hover:text-[#FAF8F5]"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(-4px)',
            transition: 'opacity 0.25s ease, transform 0.25s ease, background 0.2s, color 0.2s',
          }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          aria-label="Add to wishlist"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>

        {/* Quick Buy */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(6px)',
          }}
        >
          <button
            className="w-full py-2.5 text-[11px] font-semibold tracking-widest uppercase bg-[#1C1C1C] text-[#FAF8F5] hover:bg-[#333] transition-colors"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            Quick View
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-0.5 px-0.5">
        <h3 className="text-sm font-medium text-[#1C1C1C] leading-snug line-clamp-1 group-hover:text-[#8B7355] transition-colors duration-200">
          {name}
        </h3>
        <p className="text-[11px] text-[#8B7355] uppercase tracking-widest font-medium">{category}</p>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-semibold text-[#1C1C1C]">₹{price}</span>
          {rating && reviewCount && (
            <span className="text-[11px] text-[#B5A898]">
              ★ {rating} ({reviewCount})
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}