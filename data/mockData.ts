/**
 * HerdFinder Mock Data
 * Simulates real data from LoRaWAN ear tags + MikroTik gateway
 * TODO: HARDWARE INTEGRATION - Replace with real MQTT data from TTN
 */

import { Animal, Alert, Gateway, SafeZone, TempReading } from '../types';

// Generate 24h temperature history
function generateTempHistory(baseTemp: number): TempReading[] {
  const history: TempReading[] = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const variation = (Math.random() - 0.5) * 1.5;
    history.push({
      timestamp,
      temperature: Math.round((baseTemp + variation) * 10) / 10,
    });
  }
  return history;
}

// Base coordinates for Mat South area
const BASE_LAT = -20.85;
const BASE_LNG = 29.05;

export const mockAnimals: Animal[] = [
  {
    id: '1',
    name: 'Cow 007',
    herdName: 'Herd A',
    location: 'Mat South',
    tagId: 'HF-000007',
    temperature: 37.8,
    battery: 85,
    status: 'Moving',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    distanceFromHome: 1.3,
    latitude: BASE_LAT + 0.008,
    longitude: BASE_LNG + 0.005,
    temperatureHistory: generateTempHistory(37.8),
  },
  {
    id: '2',
    name: 'Cow 015',
    herdName: 'Herd A',
    location: 'Mat South',
    tagId: 'HF-000015',
    temperature: 36.7,
    battery: 92,
    status: 'Stationary',
    lastSeen: new Date(Date.now() - 1 * 60 * 1000),
    distanceFromHome: 0.8,
    latitude: BASE_LAT + 0.015,
    longitude: BASE_LNG - 0.005,
    temperatureHistory: generateTempHistory(36.7),
  },
  {
    id: '3',
    name: 'Cow 003',
    herdName: 'Herd B',
    location: 'Mat South',
    tagId: 'HF-000003',
    temperature: 36.5,
    battery: 78,
    status: 'Moving',
    lastSeen: new Date(Date.now() - 3 * 60 * 1000),
    distanceFromHome: 2.1,
    latitude: BASE_LAT + 0.012,
    longitude: BASE_LNG + 0.015,
    temperatureHistory: generateTempHistory(36.5),
  },
  {
    id: '4',
    name: 'Cow 012',
    herdName: 'Herd A',
    location: 'Mat South',
    tagId: 'HF-000012',
    temperature: 36.6,
    battery: 90,
    status: 'Stationary',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    distanceFromHome: 1.0,
    latitude: BASE_LAT - 0.002,
    longitude: BASE_LNG + 0.012,
    temperatureHistory: generateTempHistory(36.6),
  },
  {
    id: '5',
    name: 'Cow 009',
    herdName: 'Herd B',
    location: 'Mat South',
    tagId: 'HF-000009',
    temperature: 37.2,
    battery: 65,
    status: 'Moving',
    lastSeen: new Date(Date.now() - 1 * 60 * 1000),
    distanceFromHome: 3.5,
    latitude: BASE_LAT - 0.008,
    longitude: BASE_LNG - 0.003,
    temperatureHistory: generateTempHistory(37.2),
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    animalId: '1',
    animalName: 'Cow 007',
    type: 'HIGH_TEMPERATURE',
    message: 'Cow 007 has high temperature (37.8°C)',
    severity: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 19 * 60 * 1000),
  },
  {
    id: 'a2',
    animalId: '5',
    animalName: 'Cow 009',
    type: 'LEFT_SAFE_ZONE',
    message: 'Cow 009 left the safe zone',
    severity: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    id: 'a3',
    animalId: '3',
    animalName: 'Cow 003',
    type: 'MOVEMENT_ALERT',
    message: 'Cow 003 moving faster than normal',
    severity: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 22 * 60 * 1000),
  },
  {
    id: 'a4',
    animalId: '4',
    animalName: 'Cow 012',
    type: 'LOW_BATTERY',
    message: 'Cow 012 tag battery is low (15%)',
    severity: 'info',
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

export const mockGateway: Gateway = {
  id: 'gw-001',
  name: 'Mat South 01',
  status: 'online',
  signalStrength: 'Strong',
  location: {
    latitude: BASE_LAT,
    longitude: BASE_LNG,
  },
  lastSeen: new Date(),
};

export const mockSafeZone: SafeZone = {
  id: 'sz-001',
  name: 'SAFE ZONE',
  coordinates: [
    { latitude: BASE_LAT + 0.020, longitude: BASE_LNG - 0.015 },
    { latitude: BASE_LAT + 0.020, longitude: BASE_LNG + 0.020 },
    { latitude: BASE_LAT - 0.012, longitude: BASE_LNG + 0.020 },
    { latitude: BASE_LAT - 0.012, longitude: BASE_LNG - 0.015 },
  ],
};
