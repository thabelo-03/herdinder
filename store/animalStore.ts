import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mockAnimals, mockGateway, mockSafeZone, mockWaterSources } from '../data/mockData';
import { Animal, Gateway, SafeZone, WaterSource } from '../types';
import { animalsAPI } from '../services/api';

interface AnimalState {
  animals: Animal[];
  selectedAnimal: Animal | null;
  gateway: Gateway;
  safeZone: SafeZone;
  waterSources: WaterSource[];
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
  fetchAnimals: () => Promise<void>;
  clearStore: () => void;
  toggleLockdown: () => void;
  toggleHeatmap: () => void;
  triggerBuzzer: (animalId: string) => void;

  // HARDWARE INTEGRATION
  connectMQTT: () => void;
  disconnectMQTT: () => void;
}

const dateReviver = (key: string, value: any) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
  }
  return value;
};

export const useAnimalStore = create<AnimalState>()(
  persist(
    (set, get) => ({
      animals: [], // Start empty
      selectedAnimal: null,
      gateway: mockGateway,
      safeZone: mockSafeZone,
      waterSources: mockWaterSources,
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
        set((state) => ({
          animals: state.animals.map(a =>
            a.id === animalId ? { ...a, buzzerEnabled: newStatus } : a
          )
        }));
        const { sendBuzzerDownlink } = require('../services/mqtt');
        sendBuzzerDownlink(animal.tagId, newStatus);
      },

      loadMockData: () => set({
        animals: mockAnimals,
        gateway: mockGateway,
        safeZone: mockSafeZone,
        waterSources: mockWaterSources,
      }),

      fetchAnimals: async () => {
        set({ isLoading: true });
        try {
          const response = await animalsAPI.getAll();
          set({ animals: response.data, isLoading: false });
        } catch (error) {
          console.error('Fetch animals error:', error);
          set({ isLoading: false });
        }
      },

      connectMQTT: () => {
        const { connectMQTT } = require('../services/mqtt');
        connectMQTT();
      },

      disconnectMQTT: () => {
        const { disconnectMQTT } = require('../services/mqtt');
        disconnectMQTT();
      },
    }),
    {
      name: 'herdfinder-animal-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: dateReviver,
      }),
      partialize: (state) => ({ safeZone: state.safeZone }), // Don't persist animals, fetch them fresh
    }
  )
);
