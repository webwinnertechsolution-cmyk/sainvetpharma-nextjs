import api from './api';

export const orderService = {
  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrderById: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  processPayment: async (orderId: number, paymentData: any) => {
    const response = await api.post(`/orders/${orderId}/payment`, paymentData);
    return response.data;
  },
};