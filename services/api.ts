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
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  // TODO: HARDWARE INTEGRATION - Get token from secure storage
  // const token = await AsyncStorage.getItem('auth_token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
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
  login: async (phone: string, password: string) => {
    // TODO: Replace with: return api.post('/auth/login', { phone, password });
    return { data: { token: 'mock-jwt-token', user: {} } };
  },
  register: async (data: any) => {
    // TODO: Replace with: return api.post('/auth/register', data);
    return { data: { success: true } };
  },
};

export const animalsAPI = {
  getAll: async () => {
    // TODO: Replace with: return api.get('/animals');
    return { data: [] };
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
    // TODO: Replace with: return api.get(`/animals/${id}/readings?range=${range}`);
    return { data: [] };
  },
};

export const alertsAPI = {
  getAll: async () => {
    // TODO: Replace with: return api.get('/alerts');
    return { data: [] };
  },
  markAsRead: async (id: string) => {
    // TODO: Replace with: return api.put(`/alerts/${id}/read`);
    return { data: { success: true } };
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

export default api;
