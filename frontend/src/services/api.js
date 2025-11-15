import axios from 'axios';

const API_URL = 'http://localhost:7000/api'; // backend base

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword }),
};

export const transactionsAPI = {
  getAll: () => api.get('/transactions'),
  create: (data) => api.post('/transactions', data),
};

// add to frontend/src/services/api.js (with the existing 'api' axios instance)
export const budgetsAPI = {
  // create budget
  create: (payload) => api.post('/budgets', payload),

  // list budgets
  list: () => api.get('/budgets'),

  // delete budget (optional)
  delete: (id) => api.delete(`/budgets/${id}`),
};



export default api;
