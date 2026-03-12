'use client';

import { useCartStore } from '@/store/cartStore';

export default function CartBadge() {
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const totalItems = getTotalItems();

  if (totalItems === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
      {totalItems}
    </span>
  );
}