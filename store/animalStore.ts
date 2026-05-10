/**
 * HerdFinder Animal Store (Zustand)
 * Manages cattle data, selected animal, and readings
 * TODO: HARDWARE INTEGRATION - Connect to MQTT for real-time updates
 */

import { create } from 'zustand';
import { Animal, Gateway, SafeZone } from '../types';
import { mockAnimals, mockGateway, mockSafeZone } from '../data/mockData';

interface AnimalState {
  animals: Animal[];
  selectedAnimal: Animal | null;
  gateway: Gateway;
  safeZone: SafeZone;
  isLoading: boolean;
  
  // Actions
  setAnimals: (animals: Animal[]) => void;
  addAnimal: (animal: Animal) => void;
  selectAnimal: (animal: Animal | null) => void;
  updateAnimal: (id: string, updates: Partial<Animal>) => void;
  setGateway: (gateway: Gateway) => void;
  updateSafeZone: (safeZone: SafeZone) => void;
  loadMockData: () => void;
  
  // TODO: HARDWARE INTEGRATION
  // connectMQTT: () => void;
  // handleUplink: (payload: TTNUplink) => void;
  // disconnectMQTT: () => void;
}

export const useAnimalStore = create<AnimalState>((set) => ({
  animals: mockAnimals,
  selectedAnimal: null,
  gateway: mockGateway,
  safeZone: mockSafeZone,
  isLoading: false,
  
  setAnimals: (animals) => set({ animals }),
  
  addAnimal: (animal) => set((state) => ({ animals: [...state.animals, animal] })),
  
  selectAnimal: (animal) => set({ selectedAnimal: animal }),
  
  updateAnimal: (id, updates) => set((state) => ({
    animals: state.animals.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    ),
  })),
  
  setGateway: (gateway) => set({ gateway }),
  
  updateSafeZone: (safeZone) => set({ safeZone }),
  
  loadMockData: () => set({
    animals: mockAnimals,
    gateway: mockGateway,
    safeZone: mockSafeZone,
  }),
}));
