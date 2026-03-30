import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  basePrice: number;
  printPrice: number;
  // Studio / custom design extras
  designId?: string;
  designName?: string;
  designImage?: string;
  gender?: string;
  fit?: string;
  hasFront?: boolean;
  hasBack?: boolean;
  price?: number;
  customDesign?: {
    frontImage?: string;
    backImage?: string;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

// ── Helper: localStorage key for a given user ─────────────────────────────────
const GUEST_KEY = 'cart-guest';
const userCartKey = (userId: string) => `cart-${userId}`;

// Read raw items from a specific localStorage key
function readCartItems(key: string): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed?.state?.items ?? [];
  } catch {
    return [];
  }
}

// Write items to a specific localStorage key (Zustand persist format)
function writeCartItems(key: string, items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    key,
    JSON.stringify({ state: { items }, version: 0 })
  );
}

// ── The base Zustand cart store (always persists to current key) ─────────────
let currentStorageKey = GUEST_KEY;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.productId === item.productId &&
              i.color === item.color &&
              i.size === item.size
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === existingItem.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          } else {
            return {
              items: [...state.items, item],
            };
          }
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) =>
            total + (item.basePrice + item.printPrice) * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: GUEST_KEY, // initial key, will be swapped dynamically
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          // Always read from the current key, not the initial one
          return localStorage.getItem(currentStorageKey) ?? localStorage.getItem(name);
        },
        setItem: (_name: string, value: string) => {
          localStorage.setItem(currentStorageKey, value);
        },
        removeItem: (_name: string) => {
          localStorage.removeItem(currentStorageKey);
        },
      })),
    }
  )
);

// ── Switch cart to a specific user (call on login) ────────────────────────────
export function switchCartToUser(userId: string) {
  const newKey = userCartKey(userId);

  // 1. Read guest cart items (what the user added before logging in)
  const guestItems = readCartItems(GUEST_KEY);

  // 2. Read existing user cart items
  const userItems = readCartItems(newKey);

  // 3. Merge guest items into user cart (avoid duplicates by productId+color+size)
  const mergedItems = [...userItems];
  for (const guestItem of guestItems) {
    const existing = mergedItems.find(
      (i) =>
        i.productId === guestItem.productId &&
        i.color === guestItem.color &&
        i.size === guestItem.size
    );
    if (existing) {
      existing.quantity += guestItem.quantity;
    } else {
      mergedItems.push(guestItem);
    }
  }

  // 4. Clear guest cart
  localStorage.removeItem(GUEST_KEY);

  // 5. Switch the storage key
  currentStorageKey = newKey;

  // 6. Write merged items and update the store
  writeCartItems(newKey, mergedItems);
  useCartStore.setState({ items: mergedItems });
}

// ── Switch cart back to guest (call on logout) ────────────────────────────────
export function switchCartToGuest() {
  currentStorageKey = GUEST_KEY;
  // Start with empty guest cart
  useCartStore.setState({ items: [] });
}