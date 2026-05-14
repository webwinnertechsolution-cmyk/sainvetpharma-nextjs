import api from './api';

export const cartService = {
  addToCart: async (productId: number, quantity: number) => {
    const response = await api.post('/cart', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  removeFromCart: async (cartItemId: number) => {
    const response = await api.delete(`/cart/${cartItemId}`);
    return response.data;
  },

  updateQuantity: async (cartItemId: number, quantity: number) => {
    const response = await api.put(`/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },
};