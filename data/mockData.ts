/**
 * HerdFinder Mock Data
 * Simulates real data from LoRaWAN ear tags (cattle) + Dragino TrackerD (motorbikes/vehicles)
 * TODO: HARDWARE INTEGRATION - Replace with real MQTT data from TTN
 */

import { Alert, Animal, Gateway, SafeZone, TempReading } from '../types';

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

// Base coordinates for Mat South area (updated)
const BASE_LAT = -21.416589;
const BASE_LNG = 28.064443;

export const mockAnimals: Animal[] = [
  // ==================== CATTLE (Yellow Ear Tags) ====================
  {
    id: '1',
    name: 'Cow 007',
    category: 'cattle',
    deviceType: 'ear_tag',
    herdName: 'Herd A',
    location: 'Mat South',
    tagId: 'HF-000007',
    temperature: 37.8,
    battery: 85,
    status: 'Moving',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    lastMovedAt: new Date(Date.now() - 2 * 60 * 1000),
    distanceFromHome: 1.3,
    latitude: BASE_LAT + 0.008,
    longitude: BASE_LNG + 0.005,
    temperatureHistory: generateTempHistory(37.8),
  },
  {
    id: '2',
    name: 'Cow 015',
    category: 'cattle',
    deviceType: 'ear_tag',
    herdName: 'Herd A',
    location: 'Mat South',
    tagId: 'HF-000015',
    temperature: 32.7,
    battery: 92,
    status: 'Stationary',
    lastSeen: new Date(Date.now() - 1 * 60 * 1000),
    lastMovedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    distanceFromHome: 0.8,
    latitude: BASE_LAT + 0.015,
    longitude: BASE_LNG - 0.005,
    temperatureHistory: generateTempHistory(36.7),
  },
  {
    id: '3',
    name: 'Cow 003',
    category: 'cattle',
    deviceType: 'ear_tag',
    herdName: 'Herd B',
    location: 'Mat South',
    tagId: 'HF-000003',
    temperature: 36.5,
    battery: 78,
    status: 'Moving',
    lastSeen: new Date(Date.now() - 3 * 60 * 1000),
    lastMovedAt: new Date(Date.now() - 3 * 60 * 1000),
    distanceFromHome: 2.1,
    latitude: BASE_LAT + 0.012,
    longitude: BASE_LNG + 0.015,
    temperatureHistory: generateTempHistory(36.5),
  },
  {
    id: '4',
    name: 'Cow 012',
    category: 'cattle',
    deviceType: 'ear_tag',
    herdName: 'Herd A',
    location: 'Mat South',
    tagId: 'HF-000012',
    temperature: 36.6,
    battery: 10,
    status: 'Stationary',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    lastMovedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago
    distanceFromHome: 1.0,
    latitude: BASE_LAT - 0.002,
    longitude: BASE_LNG + 0.012,
    temperatureHistory: generateTempHistory(36.6),
  },
  {
    id: '5',
    name: 'Cow 009',
    category: 'cattle',
    deviceType: 'ear_tag',
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

  // ==================== MOTORBIKES (Dragino TrackerD) ====================
  {
    id: '6',
    name: 'Bike 01',
    category: 'motorbike',
    deviceType: 'dragino_tracker',
    herdName: 'Fleet 1',
    location: 'Mat South',
    tagId: 'DT-000001',
    temperature: 28.3,
    humidity: 45,
    battery: 88,
    status: 'Parked',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    distanceFromHome: 0.2,
    latitude: BASE_LAT + 0.003,
    longitude: BASE_LNG + 0.018,
    speed: 0,
    make: 'Honda',
    model: 'CG125',
    plateNumber: 'ABZ 1234',
    buzzerEnabled: true,
    tamperDetected: false,
    motionDetected: false,
    temperatureHistory: generateTempHistory(28.3),
  },
  {
    id: '7',
    name: 'Bike 02',
    category: 'motorbike',
    deviceType: 'dragino_tracker',
    herdName: 'Fleet 1',
    location: 'Mat South',
    tagId: 'DT-000002',
    temperature: 35.1,
    humidity: 38,
    battery: 72,
    status: 'Moving',
    lastSeen: new Date(Date.now() - 30 * 1000),
    distanceFromHome: 4.8,
    latitude: BASE_LAT - 0.015,
    longitude: BASE_LNG + 0.008,
    speed: 45,
    make: 'Yamaha',
    model: 'DT125',
    plateNumber: 'ABZ 5678',
    buzzerEnabled: false,
    tamperDetected: false,
    motionDetected: true,
    temperatureHistory: generateTempHistory(35.1),
  },

  // ==================== VEHICLES (Dragino TrackerD) ====================
  {
    id: '8',
    name: 'Truck 01',
    category: 'vehicle',
    deviceType: 'dragino_tracker',
    herdName: 'Fleet 1',
    location: 'Mat South',
    tagId: 'DT-000003',
    temperature: 31.2,
    humidity: 42,
    battery: 95,
    status: 'Parked',
    lastSeen: new Date(Date.now() - 15 * 60 * 1000),
    distanceFromHome: 0.1,
    latitude: BASE_LAT + 0.001,
    longitude: BASE_LNG - 0.010,
    speed: 0,
    make: 'Toyota',
    model: 'Hilux',
    plateNumber: 'ABZ 9012',
    buzzerEnabled: true,
    tamperDetected: false,
    motionDetected: false,
    temperatureHistory: generateTempHistory(31.2),
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    animalId: '1',
    animalName: 'Cow 007',
    assetCategory: 'cattle',
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
    assetCategory: 'cattle',
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
    assetCategory: 'cattle',
    type: 'MOVEMENT_ALERT',
    message: 'Cow 003 moving faster than normal',
    severity: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 22 * 60 * 1000),
  },
  {
    id: 'a4',
    animalId: '7',
    animalName: 'Bike 02',
    assetCategory: 'motorbike',
    type: 'THEFT_ALERT',
    message: 'Bike 02 motion detected while parked — possible theft!',
    severity: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: 'a5',
    animalId: '7',
    animalName: 'Bike 02',
    assetCategory: 'motorbike',
    type: 'SPEEDING',
    message: 'Bike 02 exceeded 60 km/h speed limit (67 km/h)',
    severity: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: 'a6',
    animalId: '4',
    animalName: 'Cow 012',
    assetCategory: 'cattle',
    type: 'LOW_BATTERY',
    message: 'Cow 012 tag battery is low (15%)',
    severity: 'info',
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'a7',
    animalId: '6',
    animalName: 'Bike 01',
    assetCategory: 'motorbike',
    type: 'TAG_TAMPER',
    message: 'Bike 01 tracker tamper detected — device may have been removed',
    severity: 'critical',
    read: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'a8',
    animalId: '2',
    animalName: 'Cow 015',
    assetCategory: 'cattle',
    type: 'MOVEMENT_ALERT',
    message: 'Cow 015 hasn\'t moved for over 2 hours. Check for illness or injury.',
    severity: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'a9',
    animalId: '4',
    animalName: 'Cow 012',
    assetCategory: 'cattle',
    type: 'MOVEMENT_ALERT',
    message: 'Cow 012 hasn\'t moved for over 2 hours. Check for illness or injury.',
    severity: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'a10',
    animalId: '3',
    animalName: 'Cow 003',
    assetCategory: 'cattle',
    type: 'THEFT_ALERT',
    message: 'POTENTIAL THEFT: Cow 003 is 4.2km from home and moving further away rapidly.',
    severity: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
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

const generateCirclePolygon = (centerLat: number, centerLng: number, radiusKm: number, points: number = 32) => {
  const coords = [];
  const latRatio = 111.32; // km per degree latitude
  const lngRatio = 111.32 * Math.cos(centerLat * Math.PI / 180); // km per degree longitude

  for (let i = 0; i < points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    coords.push({
      latitude: centerLat + (radiusKm / latRatio) * Math.sin(angle),
      longitude: centerLng + (radiusKm / lngRatio) * Math.cos(angle)
    });
  }
  return coords;
};

export const mockSafeZone: SafeZone = {
  id: 'sz-001',
  name: 'SAFE ZONE',
  coordinates: generateCirclePolygon(BASE_LAT, BASE_LNG, 10, 32),
};

const getRandomLocationInRadius = (centerLat: number, centerLng: number, radiusKm: number) => {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radiusKm;
  const latRatio = 111.32;
  const lngRatio = 111.32 * Math.cos(centerLat * Math.PI / 180);
  return {
    latitude: centerLat + (r / latRatio) * Math.sin(angle),
    longitude: centerLng + (r / lngRatio) * Math.cos(angle)
  };
};

// Scatter trackers randomly within the 10km radius
mockAnimals.forEach(animal => {
  const loc = getRandomLocationInRadius(BASE_LAT, BASE_LNG, 9.5); // 9.5km to ensure they stay strictly within the 10km boundary
  animal.latitude = loc.latitude;
  animal.longitude = loc.longitude;
});
