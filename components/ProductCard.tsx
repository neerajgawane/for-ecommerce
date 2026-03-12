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
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] bg-gray-100 mb-3 overflow-hidden">
        {/* Front Image */}
        <img
          src={frontImage}
          alt={name}
          className="w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: isHovered && backImage ? 0 : 1 }}
        />

        {/* Back Image (shown on hover) */}
        {backImage && (
          <img
            src={backImage}
            alt={`${name} back`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0 }}
          />
        )}

        {/* Badges */}
        {isFeatured && (
          <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
            New Arrival
          </div>
        )}

        {/* Quick Actions - Desktop Only */}
        <div className="hidden lg:flex absolute bottom-4 left-4 right-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="flex-1 bg-white text-black text-xs font-semibold py-2 px-4 uppercase tracking-wide hover:bg-black hover:text-white transition">
            Quick Buy
          </button>
        </div>

        {/* Wishlist */}
        <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-black line-clamp-2 group-hover:underline">
          {name}
        </h3>
        <p className="text-xs text-gray-500 uppercase">{category}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-black">₹{price}</span>
        </div>

        {/* Rating (optional) */}
        {rating && reviewCount && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="text-yellow-500">★</span>
            <span>{rating}</span>
            <span className="text-gray-400">({reviewCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
}