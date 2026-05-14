'use client';

import { CartProvider } from '@/app/components/CartContext';
import CartDrawer from '@/app/components/CartDrawer';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />   {/* ← Yahan hai — har page pe available */}
    </CartProvider>
  );
}