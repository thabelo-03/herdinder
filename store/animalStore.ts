/**
 * HerdFinder Animal Store (Zustand)
 * Manages cattle data, selected animal, and readings
 * Persists safe zone and animal data locally.
 * TODO: HARDWARE INTEGRATION - Connect to MQTT for real-time updates
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand'; // Import create from zustand
import { createJSONStorage, persist } from 'zustand/middleware'; // Import persist and createJSONStorage
import { mockAnimals, mockGateway, mockSafeZone } from '../data/mockData';
import { Animal, Gateway, SafeZone } from '../types';

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

// Custom reviver function to parse date strings back into Date objects
const dateReviver = (key: string, value: any) => {
  // Check if the value is a string and matches the ISO 8601 date format
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date; // Return valid Date objects
  }
  return value;
};

export const useAnimalStore = create<AnimalState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'herdfinder-animal-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: dateReviver,
      }),
      partialize: (state) => ({ animals: state.animals, safeZone: state.safeZone }), // only persist these parts of the state
    }
  )
);
