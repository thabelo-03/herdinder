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
  isLockdownMode: boolean;
  showHeatmap: boolean;
  
  // Actions
  setAnimals: (animals: Animal[]) => void;
  addAnimal: (animal: Animal) => void;
  selectAnimal: (animal: Animal | null) => void;
  updateAnimal: (id: string, updates: Partial<Animal>) => void;
  setGateway: (gateway: Gateway) => void;
  updateSafeZone: (safeZone: SafeZone) => void;
  loadMockData: () => void;
  toggleLockdown: () => void;
  toggleHeatmap: () => void;
  triggerBuzzer: (animalId: string) => void;
  
  // HARDWARE INTEGRATION
  connectMQTT: () => void;
  disconnectMQTT: () => void;
}

export const useAnimalStore = create<AnimalState>((set, get) => ({
  animals: mockAnimals,
  selectedAnimal: null,
  gateway: mockGateway,
  safeZone: mockSafeZone,
  isLoading: false,
  isLockdownMode: false,
  showHeatmap: false,
  
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

  toggleLockdown: () => set((state) => ({ isLockdownMode: !state.isLockdownMode })),
  
  toggleHeatmap: () => set((state) => ({ showHeatmap: !state.showHeatmap })),

  triggerBuzzer: (animalId) => {
    const animal = get().animals.find(a => a.id === animalId);
    if (!animal) return;
    
    const newStatus = !animal.buzzerEnabled;
    
    // Update local state
    set((state) => ({
      animals: state.animals.map(a => 
        a.id === animalId ? { ...a, buzzerEnabled: newStatus } : a
      )
    }));

    // Send hardware command
    const { sendBuzzerDownlink } = require('../services/mqtt');
    sendBuzzerDownlink(animal.tagId, newStatus);
  },
  
  loadMockData: () => set({
    animals: mockAnimals,
    gateway: mockGateway,
    safeZone: mockSafeZone,
  }),

  connectMQTT: () => {
    // We import the service here to avoid circular dependencies if any
    const { connectMQTT } = require('../services/mqtt');
    connectMQTT();
  },

  disconnectMQTT: () => {
    const { disconnectMQTT } = require('../services/mqtt');
    disconnectMQTT();
  },
}));
