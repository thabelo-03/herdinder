/**
 * HerdFinder Type Definitions
 */

export interface Animal {
  id: string;
  name: string;
  herdName: string;
  location: string;        // e.g., "Mat South"
  tagId: string;            // DevEUI from LoRaWAN ear tag
  temperature: number;
  battery: number;          // percentage 0-100
  status: 'Moving' | 'Stationary' | 'Offline';
  lastSeen: Date;
  distanceFromHome: number; // km
  latitude: number;
  longitude: number;
  temperatureHistory: TempReading[];
  // TODO: HARDWARE INTEGRATION - Add tagDevEUI, tagAppEUI, tagAppKey for LoRaWAN registration
}

export interface TempReading {
  timestamp: Date;
  temperature: number;
}

export interface Alert {
  id: string;
  animalId: string;
  animalName: string;
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
  | 'OFFLINE';

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

export interface SafeZone {
  id: string;
  name: string;
  coordinates: { latitude: number; longitude: number }[];
}

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
    };
    rx_metadata: Array<{
      gateway_ids: { gateway_id: string };
      rssi: number;
      snr: number;
    }>;
    received_at: string;
  };
}
