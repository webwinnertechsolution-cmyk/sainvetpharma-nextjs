import { create } from 'zustand';
import { cartService } from '@/services/cart';

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  total: number;
}

interface CartStore {
  items: CartItem[];
  total: number;
  isLoading: boolean;

  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  total: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const data = await cartService.getCart();
      set({
        items: data.items,
        total: data.total,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId: number, quantity: number) => {
    try {
      await cartService.addToCart(productId, quantity);
      const data = await cartService.getCart();
      set({
        items: data.items,
        total: data.total,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  },

  removeFromCart: async (cartItemId: number) => {
    try {
      await cartService.removeFromCart(cartItemId);
      const data = await cartService.getCart();
      set({
        items: data.items,
        total: data.total,
      });
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  },

  updateQuantity: async (cartItemId: number, quantity: number) => {
    try {
      await cartService.updateQuantity(cartItemId, quantity);
      const data = await cartService.getCart();
      set({
        items: data.items,
        total: data.total,
      });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  },

  clearCart: async () => {
    try {
      await cartService.clearCart();
      set({ items: [], total: 0 });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  },
}));