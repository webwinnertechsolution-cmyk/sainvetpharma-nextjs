import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const authService = {
  login: async (credentials: LoginPayload) => {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { token, user };
  },

  register: async (data: RegisterPayload) => {
    const response = await api.post('/auth/register', data);
    const { token, user } = response.data;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { token, user };
  },

  logout: async () => {
    await api.post('/auth/logout');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};