/**
 * HerdFinder Auth Store (Zustand)
 * TODO: HARDWARE INTEGRATION - Connect to backend API for real auth
 */

import { create } from 'zustand';
import { User, Subscription } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

// Mock user for development
const mockUser: User = {
  id: 'u-001',
  name: 'Farmer Moyo',
  phone: '077 792 6123',
  email: 'moyo@herdfinder.co.zw',
  subscription: {
    id: 'sub-001',
    plan: 'standard',
    tagCount: 5,
    pricePerTag: 100,
    currency: 'ZAR',
    status: 'active',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-10-01'),
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: mockUser, // Auto-logged in for dev
  isAuthenticated: true,
  isLoading: false,
  
  login: async (phone, password) => {
    set({ isLoading: true });
    // TODO: HARDWARE INTEGRATION - Replace with real API call
    // const response = await api.post('/auth/login', { phone, password });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({ user: mockUser, isAuthenticated: true, isLoading: false });
  },
  
  logout: () => set({ user: null, isAuthenticated: false }),
  
  setUser: (user) => set({ user, isAuthenticated: true }),
}));
