import api from './api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export const productService = {
  // सभी products fetch करो
  getAll: async (page = 1, limit = 12) => {
    const response = await api.get('/products', {
      params: { page, limit }
    });
    return response.data;
  },

  // एक product fetch करो
  getById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Products search करो
  search: async (query: string) => {
    const response = await api.get('/products/search', {
      params: { q: query }
    });
    return response.data;
  },

  // Category से products fetch करो
  getByCategory: async (category: string) => {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },
};