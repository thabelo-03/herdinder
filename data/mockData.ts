/**
 * HerdFinder Mock Data
 * Simulates real data from LoRaWAN ear tags (cattle) + Dragino TrackerD (motorbikes/vehicles)
 * TODO: HARDWARE INTEGRATION - Replace with real MQTT data from TTN
 */

import { Alert, Animal, Gateway, SafeZone, TempReading, User, WaterSource } from '../types';

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

// Generate 24h position history for grazing heatmaps
function generatePositionHistory(centerLat: number, centerLng: number, radiusKm: number): { latitude: number; longitude: number; timestamp: Date }[] {
  const history: { latitude: number; longitude: number; timestamp: Date }[] = [];
  const now = new Date();
  for (let i = 48; i >= 0; i--) { // 48 points (every 30 mins)
    const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000);
    // Bias positions slightly so they form "clumps" (grazing hotspots)
    const hotspotFactor = Math.sin(i / 5); 
    const r = Math.sqrt(Math.random()) * radiusKm * (0.5 + 0.5 * hotspotFactor);
    const angle = Math.random() * Math.PI * 2;
    history.push({
      latitude: centerLat + (r / 111.32) * Math.sin(angle),
      longitude: centerLng + (r / (111.32 * Math.cos(centerLat * Math.PI / 180))) * Math.cos(angle),
      timestamp,
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
    tagId: '2026013033030880', // Using DevEUI as the main tagId reference
    devEUI: '2026013033030880',
    appEUI: '2025030933020001',
    appKey: '20250309202503092025030933030001',
    temperature: 37.8,
    battery: 85,
    status: 'Moving',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    lastMovedAt: new Date(Date.now() - 2 * 60 * 1000),
    distanceFromHome: 1.3,
    latitude: BASE_LAT + 0.008,
    longitude: BASE_LNG + 0.005,
    temperatureHistory: generateTempHistory(37.8),
    positionHistory: generatePositionHistory(BASE_LAT + 0.008, BASE_LNG + 0.005, 0.5),
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
    positionHistory: generatePositionHistory(BASE_LAT + 0.015, BASE_LNG - 0.005, 0.3),
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
    positionHistory: generatePositionHistory(BASE_LAT + 0.012, BASE_LNG + 0.015, 0.4),
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
    positionHistory: generatePositionHistory(BASE_LAT - 0.002, BASE_LNG + 0.012, 0.2),
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
    positionHistory: generatePositionHistory(BASE_LAT - 0.008, BASE_LNG - 0.003, 0.4),
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
    positionHistory: generatePositionHistory(BASE_LAT + 0.003, BASE_LNG + 0.018, 0.1),
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
    positionHistory: generatePositionHistory(BASE_LAT - 0.015, BASE_LNG + 0.008, 0.6),
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
    positionHistory: generatePositionHistory(BASE_LAT + 0.001, BASE_LNG - 0.010, 0.05),
  },
  {
    id: '10',
    name: 'Cow 101 (Isolated)',
    category: 'cattle',
    deviceType: 'ear_tag',
    herdName: 'Herd B',
    location: 'Mat South',
    tagId: 'HF-000101',
    temperature: 36.9,
    battery: 90,
    status: 'Stationary',
    lastSeen: new Date(Date.now() - 10 * 60 * 1000),
    distanceFromHome: 5.2,
    latitude: BASE_LAT + 0.050, // Far away
    longitude: BASE_LNG + 0.050,
    temperatureHistory: generateTempHistory(36.9),
    positionHistory: generatePositionHistory(BASE_LAT + 0.050, BASE_LNG + 0.050, 0.1),
  },
  {
    id: '11',
    name: 'Cow 042 (Health Risk)',
    category: 'cattle',
    deviceType: 'ear_tag',
    herdName: 'Herd A',
    location: 'Mat South',
    tagId: 'HF-000042',
    temperature: 40.2, // Fever
    battery: 82,
    status: 'Stationary', // Lethargic
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    distanceFromHome: 1.1,
    latitude: BASE_LAT + 0.002,
    longitude: BASE_LNG - 0.003,
    temperatureHistory: generateTempHistory(40.2),
    positionHistory: generatePositionHistory(BASE_LAT + 0.002, BASE_LNG - 0.003, 0.05),
  },
  {
    id: '12',
    name: 'Bike 04 (Theft Suspect)',
    category: 'motorbike',
    deviceType: 'dragino_tracker',
    herdName: 'Fleet 1',
    location: 'Mat South',
    tagId: 'DT-000004',
    temperature: 25.5,
    battery: 98,
    status: 'Moving',
    lastSeen: new Date(Date.now() - 10 * 1000),
    distanceFromHome: 12.5, // Outside zone
    latitude: BASE_LAT - 0.120,
    longitude: BASE_LNG + 0.080,
    speed: 75,
    make: 'KTM',
    model: 'EXC 300',
    plateNumber: 'ABZ 7777',
    buzzerEnabled: false,
    tamperDetected: true,
    motionDetected: true,
    temperatureHistory: generateTempHistory(25.5),
    positionHistory: generatePositionHistory(BASE_LAT - 0.120, BASE_LNG + 0.080, 2.0),
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
  {
    id: 'a11',
    animalId: '10',
    animalName: 'Cow 101',
    assetCategory: 'cattle',
    type: 'ISOLATION_ALERT',
    message: 'Cow 101 is >300m away from the rest of the herd. Possible injury.',
    severity: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'a12',
    animalId: '11',
    animalName: 'Cow 042',
    assetCategory: 'cattle',
    type: 'HEALTH_WARNING',
    message: 'POTENTIAL ILLNESS: Cow 042 temperature is 40.2°C (baseline 37.5°C) and movement is down 80%.',
    severity: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: 'a13',
    animalId: '12',
    animalName: 'Bike 04',
    assetCategory: 'motorbike',
    type: 'THEFT_ALERT',
    message: 'LOCKDOWN BREACH: Bike 04 is moving at 75km/h while system is Locked.',
    severity: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 1000),
  },
];

export const mockGateway: Gateway = {
  id: 'gw-001',
  name: 'Mat South 01',
  status: 'online',
  signalStrength: 'Strong',
  battery: 98,
  location: {
    latitude: BASE_LAT,
    longitude: BASE_LNG,
  },
  lastSeen: new Date(),
};

export const mockGateways: Gateway[] = [
  mockGateway,
  {
    id: 'gw-002',
    name: 'Mat South Node 4',
    status: 'offline',
    signalStrength: 'Weak',
    battery: 15,
    location: {
      latitude: BASE_LAT + 0.05,
      longitude: BASE_LNG + 0.02,
    },
    lastSeen: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: 'gw-003',
    name: 'North Point Relay',
    status: 'online',
    signalStrength: 'Medium',
    battery: 82,
    location: {
      latitude: BASE_LAT - 0.03,
      longitude: BASE_LNG - 0.04,
    },
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
  },
];

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Tendai Moyo',
    phone: '+263 77 123 4567',
    email: 'tendai@farm.co.zw',
    subscription: {
      id: 'sub1',
      plan: 'enterprise',
      tagCount: 450,
      pricePerTag: 0.50,
      currency: 'USD',
      status: 'active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01'),
    }
  },
  {
    id: 'u2',
    name: 'John Smith',
    phone: '+263 71 987 6543',
    email: 'jsmith@cattle.zw',
    subscription: {
      id: 'sub2',
      plan: 'standard',
      tagCount: 50,
      pricePerTag: 0.75,
      currency: 'USD',
      status: 'active',
      startDate: new Date('2025-03-15'),
      endDate: new Date('2026-03-15'),
    }
  },
  {
    id: 'u3',
    name: 'Mary Gumbo',
    phone: '+263 78 555 0199',
    email: 'mary@gumbofarm.com',
    subscription: {
      id: 'sub3',
      plan: 'community',
      tagCount: 15,
      pricePerTag: 0,
      currency: 'USD',
      status: 'trial',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-06-01'),
      trialEndsAt: new Date('2026-06-01'),
    }
  },
  {
    id: 'u4',
    name: 'David Ndlovu',
    phone: '+263 73 333 4444',
    email: 'david@veld.io',
    subscription: {
      id: 'sub4',
      plan: 'starter',
      tagCount: 10,
      pricePerTag: 1.00,
      currency: 'USD',
      status: 'expired',
      startDate: new Date('2024-05-10'),
      endDate: new Date('2025-05-10'),
    }
  }
];

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

export const mockWaterSources: WaterSource[] = [
  {
    id: 'ws-001',
    name: 'River Bend',
    latitude: BASE_LAT + 0.015,
    longitude: BASE_LNG - 0.01,
    radiusMeters: 50,
  },
  {
    id: 'ws-002',
    name: 'Northern Trough',
    latitude: BASE_LAT - 0.02,
    longitude: BASE_LNG + 0.015,
    radiusMeters: 30,
  },
  {
    id: 'ws-003',
    name: 'Western Pan',
    latitude: BASE_LAT + 0.005,
    longitude: BASE_LNG - 0.025,
    radiusMeters: 40,
  }
];

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
