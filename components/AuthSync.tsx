'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { switchCartToUser, switchCartToGuest } from '@/store/cartStore';

/**
 * Invisible component that syncs cart & wishlist data with the current session.
 * Place inside <SessionProvider> in the layout.
 *
 * On login  → switches cart localStorage key to user-specific + merges guest items
 * On logout → switches back to guest key
 */
export default function AuthSync() {
  const { data: session, status } = useSession();
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    const userId = (session?.user as { id?: string })?.id ?? null;

    // Avoid re-running if the userId hasn't changed
    if (userId === prevUserIdRef.current) return;
    prevUserIdRef.current = userId;

    if (userId) {
      // User just logged in — switch to their cart
      switchCartToUser(userId);

      // Migrate guest wishlist localStorage to DB
      migrateGuestWishlist();
    } else {
      // User just logged out — switch to guest cart
      switchCartToGuest();
    }
  }, [session, status]);

  return null;
}

// ── Migrate guest wishlist items to DB on login ─────────────────────────────
async function migrateGuestWishlist() {
  const WISHLIST_KEY = 'for-wishlist';
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return;

    const items: { id: string }[] = JSON.parse(raw);
    if (!items.length) return;

    // Add each item to the DB wishlist
    await Promise.allSettled(
      items.map((item) =>
        fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.id }),
        })
      )
    );

    // Clear guest wishlist after migration
    localStorage.removeItem(WISHLIST_KEY);
  } catch {
    // Non-blocking — guest wishlist stays if migration fails
  }
}
