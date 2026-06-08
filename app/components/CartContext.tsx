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

// ── BXGY recalculate helper ──────────────────────────────────
function recalculateBxgy(items: CartItem[]): CartItem[] {
  const productIds = [...new Set(items.map(i => i.id))];
  let newItems: CartItem[] = [];

  for (const productId of productIds) {
    const productItems = items.filter(i => i.id === productId);
    const paidItems = productItems.filter(i => !i.variant?.includes('__FREE__'));
    const freeItems = productItems.filter(i => i.variant?.includes('__FREE__'));

    newItems.push(...paidItems);

    if (freeItems.length > 0) {
      const freeItem = freeItems[0];
      const paidQty = paidItems.reduce((a, i) => a + i.quantity, 0);
      const match = freeItem.variant?.match(/__FREE__(\d+)__/);
      const buyQty = match ? parseInt(match[1]) : 2;
      const sets = Math.floor(paidQty / buyQty);
      const newFreeQty = sets * 1;

      if (newFreeQty > 0) {
        newItems.push({ ...freeItem, quantity: newFreeQty });
      }
      // newFreeQty === 0 toh free item add nahi hoti ✅
    }
    // ✅ Free item nahi hai — koi action nahi (product page se add hogi)
  }

  return newItems;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems]           = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem('cart', JSON.stringify(items));
  }, [items, mounted]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.variant === item.variant);
      if (existing) {
        return prev.map(i =>
          i.id === item.id && i.variant === item.variant
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setDrawerOpen(true);
  };

  const removeFromCart = (id: number, variant?: string) => {
    setItems(prev => {
      const filtered = prev.filter(i => !(i.id === id && i.variant === variant));
      return recalculateBxgy(filtered);
    });
  };

  // ── updateQty: BXGY free items automatically recalculate ──
  const updateQty = (id: number, variant: string | undefined, qty: number) => {
    // Free item ki quantity manually change nahi hogi
    if (variant?.includes('__FREE__')) return;

    if (qty < 1) {
      removeFromCart(id, variant);
      return;
    }

    setItems(prev => {
      // Pehle paid item ki quantity update karo
      const updated = prev.map(i =>
        i.id === id && i.variant === variant ? { ...i, quantity: qty } : i
      );
      // Phir BXGY recalculate karo
      return recalculateBxgy(updated);
    });
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((a, i) => a + i.quantity, 0);

  const totalPrice = items.reduce((a, i) => {
  if (i.variant?.includes('__FREE__')) return a; // FREE items skip karo
  const effectivePrice = i.discountedPrice ?? i.price;
  return a + effectivePrice * i.quantity;
}, 0);

const totalSavings = items.reduce((a, i) => {
  if (i.variant?.includes('__FREE__')) {
    return a + i.price * i.quantity; // FREE item = poora price saved
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
