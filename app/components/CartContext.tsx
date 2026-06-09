'use client';
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface CartItem {
  id: number;
  slug: string;
  title: string;
  image: string | null;
  price: number;
  discountedPrice?: number;
  discountLabel?: string;
  variant?: string;
  quantity: number;
  bxgyBuyQty?: number; // optional — product page se pass karo ya API se fetch hoga
  bxgyGetQty?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number, variant?: string) => void;
  updateQty: (id: number, variant: string | undefined, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalSavings: number;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

// ─────────────────────────────────────────────────────────────
// Discount cache — har product ke liye ek baar API call
// ─────────────────────────────────────────────────────────────
const discountCache: Record<number, { buyQty: number; getQty: number } | null> = {};

async function fetchBxgyDiscount(productId: number): Promise<{ buyQty: number; getQty: number } | null> {
  // Cache mein hai toh wahi return karo
  if (productId in discountCache) return discountCache[productId];

  try {
    const res = await fetch(`${API_URL}/api/product-discount/${productId}`);
    const data = await res.json();

    if (
      data.has_discount &&
      data.type === 'buy_x_get_y' &&
      data.get_value_type === 'free'
    ) {
      const result = {
        buyQty: Number(data.buy_quantity ?? 2),
        getQty: Number(data.get_quantity ?? 1),
      };
      discountCache[productId] = result;
      return result;
    }

    discountCache[productId] = null;
    return null;
  } catch {
    discountCache[productId] = null;
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Async BXGY sync — API se discount fetch karke free items
// recalculate karta hai. Pure paid items lo, free items drop
// karo, phir discount ke hisaab se naye free items add karo.
// ─────────────────────────────────────────────────────────────
async function syncBxgyItems(items: CartItem[]): Promise<CartItem[]> {
  // Sirf paid items rakho pehle (free items fresh recalculate hongi)
  const paidItems = items.filter(i => !i.variant?.includes('__FREE__'));
  const result: CartItem[] = [...paidItems];

  // Unique product IDs
  const productIds = [...new Set(paidItems.map(i => i.id))];

  for (const productId of productIds) {
    const productPaidItems = paidItems.filter(i => i.id === productId);
    const baseItem = productPaidItems[0];

    // BXGY data — pehle CartItem se lo, nahi toh API se fetch karo
    let buyQty = baseItem.bxgyBuyQty;
    let getQty = baseItem.bxgyGetQty;

    if (!buyQty || !getQty) {
      const discount = await fetchBxgyDiscount(productId);
      if (!discount) continue; // Koi discount nahi
      buyQty = discount.buyQty;
      getQty = discount.getQty;
    }

    // Total paid quantity
    const totalPaidQty = productPaidItems.reduce((sum, i) => sum + i.quantity, 0);
    const freeQty = Math.floor(totalPaidQty / buyQty) * getQty;

    if (freeQty > 0) {
      result.push({
        ...baseItem,
        bxgyBuyQty: buyQty,
        bxgyGetQty: getQty,
        quantity: freeQty,
        variant: `__FREE__${buyQty}__${baseItem.variant || ''}`.trim(),
        discountedPrice: 0,
        discountLabel: `Buy ${buyQty} Get ${getQty}`,
      });
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// CartProvider
// ─────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems]           = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted]       = useState(false);

  // LocalStorage restore
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        // Restore karte waqt bhi BXGY sync karo
        syncBxgyItems(parsed).then(synced => setItems(synced));
      }
    } catch {}
  }, []);

  // LocalStorage save
  useEffect(() => {
    if (mounted) localStorage.setItem('cart', JSON.stringify(items));
  }, [items, mounted]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // ── addToCart ──────────────────────────────────────────────
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const paidPrev = prev.filter(i => !i.variant?.includes('__FREE__'));
      const existing = paidPrev.find(i => i.id === item.id && i.variant === item.variant);
      let updated: CartItem[];
      if (existing) {
        updated = paidPrev.map(i =>
          i.id === item.id && i.variant === item.variant
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        updated = [...paidPrev, { ...item, quantity: 1 }];
      }

      // Async sync — result aane pe state update
      syncBxgyItems(updated).then(synced => setItems(synced));

      // Abhi ke liye free items ke bina state set karo (flash avoid)
      return updated;
    });
    setDrawerOpen(true);
  };

  // ── removeFromCart ─────────────────────────────────────────
  const removeFromCart = (id: number, variant?: string) => {
    setItems(prev => {
      const isFree = variant?.includes('__FREE__');
      let filtered: CartItem[];

      if (isFree) {
        filtered = prev.filter(i => !(i.id === id && i.variant === variant));
      } else {
        // Paid item + us product ki saari free items hato
        filtered = prev.filter(
          i => !(i.id === id && (i.variant === variant || i.variant?.includes('__FREE__')))
        );
      }

      syncBxgyItems(filtered).then(synced => setItems(synced));
      return filtered;
    });
  };

  // ── updateQty ─────────────────────────────────────────────
  const updateQty = (id: number, variant: string | undefined, qty: number) => {
    if (variant?.includes('__FREE__')) return; // Free item manual change nahi

    if (qty < 1) {
      removeFromCart(id, variant);
      return;
    }

    setItems(prev => {
      const paidPrev = prev.filter(i => !i.variant?.includes('__FREE__'));
      const updated = paidPrev.map(i =>
        i.id === id && i.variant === variant ? { ...i, quantity: qty } : i
      );

      // Async BXGY recalculate
      syncBxgyItems(updated).then(synced => setItems(synced));

      return updated; // Temporary state without free items
    });
  };

  // ── clearCart ─────────────────────────────────────────────
  const clearCart = () => setItems([]);

  // ── Totals ────────────────────────────────────────────────
  const totalItems = items.reduce((a, i) => a + i.quantity, 0);

  const totalPrice = items.reduce((a, i) => {
    if (i.variant?.includes('__FREE__')) return a;
    return a + (i.discountedPrice ?? i.price) * i.quantity;
  }, 0);

  const totalSavings = items.reduce((a, i) => {
    if (i.variant?.includes('__FREE__')) return a + i.price * i.quantity;
    if (i.discountedPrice !== undefined && i.discountedPrice < i.price) {
      return a + (i.price - i.discountedPrice) * i.quantity;
    }
    return a;
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      totalItems,
      totalPrice,
      totalSavings,
      drawerOpen,
      setDrawerOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
