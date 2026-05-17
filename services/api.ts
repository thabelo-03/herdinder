/**
 * HerdFinder API Service
 * 
 * TODO: HARDWARE INTEGRATION - Connect to real backend API
 * 
 * Backend endpoints (to be implemented in Node.js + Express):
 * 
 *   AUTH:
 *   POST /api/auth/register    - Register new farmer
 *   POST /api/auth/login       - Login (phone + OTP or email)
 *   POST /api/auth/verify-otp  - Verify OTP code
 * 
 *   ANIMALS:
 *   GET    /api/animals         - List all animals for user
 *   POST   /api/animals         - Register new animal + tag
 *   GET    /api/animals/:id     - Get animal detail + latest reading
 *   PUT    /api/animals/:id     - Update animal info
 *   DELETE /api/animals/:id     - Remove animal
 *   GET    /api/animals/:id/readings - Get temperature/location history
 * 
 *   ALERTS:
 *   GET /api/alerts             - List alerts (filterable)
 *   PUT /api/alerts/:id/read    - Mark alert as read
 * 
 *   GATEWAYS:
 *   GET  /api/gateways          - List user's gateways
 *   POST /api/gateways          - Register gateway
 *   GET  /api/gateways/:id/status - Get gateway health
 * 
 *   SUBSCRIPTION:
 *   GET  /api/subscription      - Get current plan
 *   POST /api/subscription/pay  - Process payment (Paynow/EcoCash)
 * 
 *   REPORTS:
 *   GET /api/reports/temperature - Temp report (date range)
 *   GET /api/reports/movement    - Movement report
 *   GET /api/reports/export      - Export PDF/CSV
 */

import axios from 'axios';

// TODO: HARDWARE INTEGRATION - Set to your real backend URL
const API_BASE_URL = 'http://192.168.3.64:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(async (config) => {
  const { useAuthStore } = require('../store/authStore');
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: HARDWARE INTEGRATION - Handle token expiry, redirect to login
      console.log('Auth token expired');
    }
    return Promise.reject(error);
  }
);

// ========== API Methods (currently return mock data) ==========

export const authAPI = {
  login: async (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },
  register: async (data: any) => {
    return api.post('/auth/register', data);
  },
};

export const animalsAPI = {
  getAll: async () => {
    return api.get('/assets');
  },
  getById: async (id: string) => {
    // TODO: Replace with: return api.get(`/animals/${id}`);
    return { data: null };
  },
  create: async (data: any) => {
    // TODO: Replace with: return api.post('/animals', data);
    return { data: { success: true } };
  },
  getReadings: async (id: string, range: string) => {
    return api.get(`/assets/${id}/readings?range=${range}`);
  },
};

export const alertsAPI = {
  getAll: async () => {
    return api.get('/alerts');
  },
  markAsRead: async (id: string) => {
    return api.put(`/alerts/${id}/read`);
  },
};

export const subscriptionAPI = {
  getCurrent: async () => {
    // TODO: Replace with: return api.get('/subscription');
    return { data: null };
  },
  pay: async (data: any) => {
    // TODO: Replace with: return api.post('/subscription/pay', data);
    return { data: { success: true } };
  },
};

export const adminAPI = {
  getStats: async () => {
    return api.get('/admin/stats');
  },
  getUsers: async () => {
    return api.get('/admin/users');
  },
  getGateways: async () => {
    return api.get('/admin/gateways');
  },
  getDatabaseLogs: async () => {
    return api.get('/admin/database/logs');
  },
  runDatabaseAction: async (action: string) => {
    return api.post('/admin/database/action', { action });
  },
  getAnalytics: async () => {
    return api.get('/admin/analytics');
  },
};

export default api;
