/**
 * HerdFinder Auth Store (Zustand)
 * TODO: HARDWARE INTEGRATION - Connect to backend API for real auth
 */

import { create } from 'zustand';
import { User, Subscription } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login(email, password);
      const { token, ...user } = response.data;
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  
  setUser: (user, token) => set({ user, token, isAuthenticated: true }),
}));
