import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/users/', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/token/login/', credentials);
    if (response.data.auth_token) {
      localStorage.setItem('auth_token', response.data.auth_token);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/token/logout/');
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  getMe: async () => {
    const response = await api.get('/auth/users/me/');
    return response.data;
  },
  
  syncData: async (guestData) => {
    const response = await api.post('/sync/', guestData);
    return response.data;
  }
};