/**
 * HerdFinder Type Definitions
 * Supports: Cattle (Yellow Ear Tags) + Motorbikes & Vehicles (Dragino TrackerD)
 */

// ==================== ASSET TYPES ====================

export type AssetCategory = 'cattle' | 'motorbike' | 'vehicle';

export type DeviceType =
  | 'ear_tag'           // Yellow LoRaWAN Ear Tag (EU868) — for cattle
  | 'dragino_tracker';  // Dragino TrackerD (ESP32, GPS, WiFi, BLE) — for motorbikes & vehicles

export interface Animal {
  id: string;
  name: string;
  category: AssetCategory;
  deviceType: DeviceType;
  herdName: string;              // "Herd A" for cattle, "Fleet 1" for vehicles
  location: string;              // e.g., "Mat South"
  tagId: string;                 // DevEUI from LoRaWAN device
  temperature: number;
  humidity?: number;             // Dragino TrackerD supports humidity
  battery: number;               // percentage 0-100
  status: 'Moving' | 'Stationary' | 'Parked' | 'Offline';
  lastSeen: Date;
  lastMovedAt?: Date; // Timestamp of the last detected movement
  distanceFromHome: number;      // km
  latitude: number;
  longitude: number;
  prevLatitude?: number;
  prevLongitude?: number;
  prevDistanceFromHome?: number;
  speed?: number;                // km/h — GPS trackers only
  temperatureHistory: TempReading[];
  // Vehicle-specific
  plateNumber?: string;
  make?: string;                 // e.g., "Honda", "Yamaha"
  model?: string;                // e.g., "CG125", "DT125"
  buzzerEnabled?: boolean;       // Dragino TrackerD buzzer alarm
  tamperDetected?: boolean;      // Tamper detection flag
  motionDetected?: boolean;      // Motion detection flag
  // TODO: HARDWARE INTEGRATION - Add tagDevEUI, tagAppEUI, tagAppKey for LoRaWAN registration
}

export interface TempReading {
  timestamp: Date;
  temperature: number;
}

// ==================== ALERTS ====================

export interface Alert {
  id: string;
  animalId: string;
  animalName: string;
  assetCategory?: AssetCategory;
  type: AlertType;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  read: boolean;
  createdAt: Date;
}

export type AlertType =
  | 'HIGH_TEMPERATURE'
  | 'LEFT_SAFE_ZONE'
  | 'MOVEMENT_ALERT'
  | 'LOW_BATTERY'
  | 'TAG_TAMPER'
  | 'THEFT_ALERT'        // Motion detected on parked vehicle
  | 'SPEEDING'           // Vehicle exceeding speed limit
  | 'BUZZER_TRIGGERED'   // Dragino buzzer alarm activated
  | 'OFFLINE';

// ==================== GATEWAY ====================

export interface Gateway {
  id: string;
  name: string;
  status: 'online' | 'offline';
  signalStrength: 'Strong' | 'Medium' | 'Weak';
  location: {
    latitude: number;
    longitude: number;
  };
  lastSeen: Date;
  // TODO: HARDWARE INTEGRATION - Add MikroTik gateway ID, TTN gateway EUI
}

// ==================== ZONES ====================

export interface SafeZone {
  id: string;
  name: string;
  coordinates: { latitude: number; longitude: number }[];
}

// ==================== SUBSCRIPTION ====================

export interface Subscription {
  id: string;
  plan: 'starter' | 'standard' | 'community' | 'enterprise';
  tagCount: number;
  pricePerTag: number;
  currency: 'USD' | 'ZWG';
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  trialEndsAt?: Date;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subscription: Subscription | null;
}

// ==================== HARDWARE / MQTT ====================

// TODO: HARDWARE INTEGRATION - MQTT message types from TTN
export interface TTNUplink {
  end_device_ids: {
    device_id: string;
    dev_eui: string;
    application_ids: { application_id: string };
  };
  uplink_message: {
    decoded_payload: {
      temperature: number;
      battery: number;
      humidity?: number;
      latitude?: number;
      longitude?: number;
      speed?: number;
      motion?: boolean;
      tamper?: boolean;
    };
    rx_metadata: Array<{
      gateway_ids: { gateway_id: string };
      rssi: number;
      snr: number;
    }>;
    received_at: string;
  };
}
