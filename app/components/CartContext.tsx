'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
  // BXGY metadata — product page se aata hai
  bxgyBuyQty?: number;
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
// BXGY recalculate helper
// Yeh function BXGY metadata CartItem ke andar stored data se
// use karta hai — koi API call nahi, pure sync calculation.
// ─────────────────────────────────────────────────────────────
function recalculateBxgy(items: CartItem[]): CartItem[] {
  const productIds = [...new Set(items.map(i => i.id))];
  const result: CartItem[] = [];

  for (const productId of productIds) {
    const allItemsForProduct = items.filter(i => i.id === productId);

    // Paid aur free items alag karo
    const paidItems = allItemsForProduct.filter(i => !i.variant?.includes('__FREE__'));
    // Free items ko hum khud recalculate karenge — purani entries drop karo

    // Agar koi paid item nahi toh skip
    if (paidItems.length === 0) continue;

    // Paid items result mein add karo
    result.push(...paidItems);

    // BXGY metadata check karo (pehle paid item se lo)
    const baseItem = paidItems[0];
    const buyQty = baseItem.bxgyBuyQty;
    const getQty = baseItem.bxgyGetQty;

    // BXGY metadata nahi hai — koi free item nahi jodna
    if (!buyQty || !getQty) continue;

    // Total paid quantity
    const totalPaidQty = paidItems.reduce((sum, i) => sum + i.quantity, 0);

    // Kitne free milenge
    const sets = Math.floor(totalPaidQty / buyQty);
    const freeQty = sets * getQty;

    if (freeQty > 0) {
      // Free item as separate cart entry
      result.push({
        ...baseItem,
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

  // LocalStorage se restore
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  // LocalStorage mein save
  useEffect(() => {
    if (mounted) localStorage.setItem('cart', JSON.stringify(items));
  }, [items, mounted]);

  // Body scroll lock when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // ── addToCart ──────────────────────────────────────────────
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.id === item.id && i.variant === item.variant
      );
      let updated: CartItem[];
      if (existing) {
        updated = prev.map(i =>
          i.id === item.id && i.variant === item.variant
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        updated = [...prev, { ...item, quantity: 1 }];
      }
      return recalculateBxgy(updated);
    });
    setDrawerOpen(true);
  };

  // ── removeFromCart ─────────────────────────────────────────
  const removeFromCart = (id: number, variant?: string) => {
    setItems(prev => {
      // Agar paid item remove ho rahi hai toh FREE item bhi hato
      const isFree = variant?.includes('__FREE__');
      let filtered: CartItem[];

      if (isFree) {
        // Sirf free item hato
        filtered = prev.filter(i => !(i.id === id && i.variant === variant));
      } else {
        // Paid item + uski free item dono hato
        filtered = prev.filter(
          i => !(i.id === id && (i.variant === variant || i.variant?.includes('__FREE__')))
        );
      }

      return recalculateBxgy(filtered);
    });
  };

  // ── updateQty ─────────────────────────────────────────────
  const updateQty = (id: number, variant: string | undefined, qty: number) => {
    // Free item ki quantity manually nahi badlegi
    if (variant?.includes('__FREE__')) return;

    if (qty < 1) {
      removeFromCart(id, variant);
      return;
    }

    setItems(prev => {
      const updated = prev.map(i =>
        i.id === id && i.variant === variant ? { ...i, quantity: qty } : i
      );
      // BXGY recalculate — free items automatically adjust hongi
      return recalculateBxgy(updated);
    });
  };

  // ── clearCart ─────────────────────────────────────────────
  const clearCart = () => setItems([]);

  // ── Totals ────────────────────────────────────────────────
  const totalItems = items.reduce((a, i) => a + i.quantity, 0);

  // Free items price mein count nahi hongi
  const totalPrice = items.reduce((a, i) => {
    if (i.variant?.includes('__FREE__')) return a;
    const effectivePrice = i.discountedPrice ?? i.price;
    return a + effectivePrice * i.quantity;
  }, 0);

  // Savings: free items ka poora price + paid items ka discount
  const totalSavings = items.reduce((a, i) => {
    if (i.variant?.includes('__FREE__')) {
      return a + i.price * i.quantity; // FREE item = poori value saved
    }
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
