import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        require('./animalStore').useAnimalStore.getState().clearStore();
        require('./alertStore').useAlertStore.getState().clearStore();
      },
      
      setUser: (user, token) => set({ user, token, isAuthenticated: true }),
    }),
    {
      name: 'herdfinder-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
