'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CartBadge() {
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const totalItems = getTotalItems();

  return (
    <Link href="/cart" className="relative">
      <ShoppingBag className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {totalItems}
        </span>
      )}
    </Link>
  );
}