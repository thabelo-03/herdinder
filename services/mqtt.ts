/**
 * HerdFinder MQTT Service
 * 
 * TODO: HARDWARE INTEGRATION - This is the main integration point
 * 
 * When hardware is ready, this service will:
 * 1. Connect to TTN MQTT broker (mqtts://eu1.cloud.thethings.network:8883)
 * 2. Subscribe to uplink messages from LoRaWAN ear tags
 * 3. Parse temperature + battery data from raw payloads
 * 4. Update the animal store in real-time
 * 5. Trigger alerts based on rules
 * 
 * TTN MQTT Topic format:
 *   v3/{application-id}@ttn/devices/{device-id}/up
 * 
 * Connection credentials:
 *   Username: {application-id}@ttn
 *   Password: TTN API Key (NNSXS.xxxx)
 * 
 * Payload decoder (matches the yellow ear tag):
 *   temperature = (bytes[0] << 8 | bytes[1]) / 100  // e.g., 38.5°C
 *   battery = bytes[2] / 10                          // e.g., 4.2V
 */

import { useAnimalStore } from '../store/animalStore';
import { useAlertStore } from '../store/alertStore';
import { TTNUplink, Alert } from '../types';
import mqtt, { MqttClient } from 'mqtt';
import { Buffer } from 'buffer';

// Polyfill Buffer for MQTT library
if (typeof global.Buffer === 'undefined') {
  (global as any).Buffer = Buffer;
}

let client: MqttClient | null = null;

// Configuration - THE THINGS NETWORK (Production)
const TTN_APP_ID = 'herdfinder01';
const TTN_MQTT_URL = 'wss://eu1.cloud.thethings.network:443/mqtt';
const TTN_USERNAME = 'herdfinder01@ttn';
const TTN_PASSWORD = 'NNSXS.73OSXCIFN7BFGRQ7SSA2Q4YKIJI2UNPFIBN3RWI.2H5MAZDOR3SRIPUJUYQRSD4QPTVPGXZEX73FPLQXSB2IE7KQBPFQ';

const MQTT_CONFIG = {
  brokerUrl: TTN_MQTT_URL,
  appId: TTN_APP_ID,
  apiKey: TTN_PASSWORD,
  // Topic pattern for subscribing to all devices in the production app
  topic: `v3/${TTN_APP_ID}@ttn/devices/+/up`,
};

// Alert thresholds
const ALERT_THRESHOLDS = {
  HIGH_TEMP: 39.5,     // °C - Push notification
  MILD_FEVER: 38.5,    // °C - In-app alert
  LOW_BATTERY: 3.2,    // V (or 20%)
  OFFLINE_HOURS: 12,   // Hours with no reading
  STATIONARY_HOURS: 2, // Hours with no movement
  THEFT_DISTANCE: 3,   // km from home
};

/**
 * Decode raw LoRaWAN payload bytes from the yellow ear tag
 */
export function decodeEarTagPayload(bytes: number[]): {
  temperature: number;
  battery: number;
} {
  return {
    temperature: ((bytes[0] << 8) | bytes[1]) / 100,
    battery: bytes[2] / 10,
  };
}

/**
 * Process an uplink message from TTN
 * This is called when a new MQTT message arrives
 */
export function processUplink(payload: TTNUplink): void {
  const deviceId = payload.end_device_ids.device_id;
  const decoded = payload.uplink_message.decoded_payload;
  const rssi = payload.uplink_message.rx_metadata?.[0]?.rssi;
  
  // Update animal in store
  const store = useAnimalStore.getState();
  const animal = store.animals.find((a) => a.tagId === deviceId);
  
  if (animal) {
    const isMoving = decoded.motion !== undefined ? decoded.motion : true;
    const status = isMoving ? 'Moving' : 'Stationary';
    const lastMovedAt = isMoving ? new Date() : (animal.lastMovedAt || animal.lastSeen);
    const newLat = decoded.latitude || animal.latitude;
    const newLng = decoded.longitude || animal.longitude;

    // Calculate new distance from home (gateway)
    const gateway = store.gateway;
    const newDist = calculateDistance(
      newLat, newLng, 
      gateway.location.latitude, gateway.location.longitude
    );

    store.updateAnimal(animal.id, {
      temperature: decoded.temperature,
      battery: decoded.battery * 10,
      lastSeen: new Date(),
      lastMovedAt,
      status,
      prevLatitude: animal.latitude,
      prevLongitude: animal.longitude,
      latitude: newLat,
      longitude: newLng,
      prevDistanceFromHome: animal.distanceFromHome,
      distanceFromHome: newDist,
    });
    
    // Check alert rules
    checkAlertRules(animal.id, animal.name, decoded.temperature, decoded.battery, status, lastMovedAt, animal, newDist);

    // AI Health Early Warning Check
    if (animal.category === 'cattle') {
      checkHealthDeviations(animal, decoded.temperature);
      checkSocialIsolation(animal, store.animals);
    }
  }
}

/**
 * Social Isolation Detection
 * Checks if a cow is too far from its peers
 */
function checkSocialIsolation(animal: any, allAnimals: any[]) {
  const alertStore = useAlertStore.getState();
  
  // Find other cattle in the same herd
  const peers = allAnimals.filter(a => 
    a.id !== animal.id && 
    a.category === 'cattle' && 
    a.herdName === animal.herdName
  );
  
  if (peers.length === 0) return;
  
  // Find distance to the NEAREST peer
  let minDistance = Infinity;
  peers.forEach(peer => {
    const dist = calculateDistance(animal.latitude, animal.longitude, peer.latitude, peer.longitude);
    if (dist < minDistance) minDistance = dist;
  });
  
  // If nearest peer is > 200m (0.2km) away
  if (minDistance > 0.2) {
    alertStore.addAlert({
      id: `alert-iso-${animal.id}-${Date.now()}`,
      animalId: animal.id,
      animalName: animal.name,
      type: 'ISOLATION_ALERT',
      message: `ISOLATION ALERT: ${animal.name} is ${Math.round(minDistance * 1000)}m away from the herd. Possible injury or distress.`,
      severity: 'warning',
      read: false,
      createdAt: new Date(),
    });
  }
}

/**
 * AI Health Early Warning Logic
 * Tracks deviations from 7-day averages
 */
function checkHealthDeviations(animal: any, currentTemp: number) {
  const alertStore = useAlertStore.getState();
  
  // 1. Calculate Average Temperature (from 24h history)
  if (!animal.temperatureHistory || animal.temperatureHistory.length < 5) return;
  
  const avgTemp = animal.temperatureHistory.reduce((sum: number, r: any) => sum + r.temperature, 0) / animal.temperatureHistory.length;
  
  // 2. Calculate Movement Intensity (total distance traveled in history)
  if (!animal.positionHistory || animal.positionHistory.length < 10) return;
  
  let totalDistance = 0;
  for (let i = 1; i < animal.positionHistory.length; i++) {
    const p1 = animal.positionHistory[i-1];
    const p2 = animal.positionHistory[i];
    totalDistance += calculateDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
  }
  
  // We assume the average movement intensity for a healthy cow is ~2km/day in our mock data
  // In a real system, we would calculate this over 7 days.
  const baselineMovement = 2.0; 
  const movementDrop = totalDistance < (baselineMovement * 0.6); // 40% less than baseline
  const tempSpike = currentTemp > (avgTemp + 1.0); // 1°C above average
  
  if (tempSpike && movementDrop) {
    alertStore.addAlert({
      id: `alert-health-${animal.id}-${Date.now()}`,
      animalId: animal.id,
      animalName: animal.name,
      type: 'HEALTH_WARNING',
      message: `HEALTH WARNING: ${animal.name} shows early signs of illness. Temp is +1°C above average and movement is down 40%.`,
      severity: 'warning',
      read: false,
      createdAt: new Date(),
    });
  }
}

/**
 * Helper to calculate distance between two coordinates in km
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Check alert rules and create alerts if thresholds exceeded
 */
function checkAlertRules(
  animalId: string,
  animalName: string,
  temperature: number,
  battery: number,
  status: string,
  lastMovedAt: Date,
  animal: any,
  currentDist: number
): void {
  const alertStore = useAlertStore.getState();
  
  if (temperature > ALERT_THRESHOLDS.HIGH_TEMP) {
    alertStore.addAlert({
      id: `alert-${Date.now()}`,
      animalId,
      animalName,
      type: 'HIGH_TEMPERATURE',
      message: `${animalName} has high temperature (${temperature}°C)`,
      severity: 'critical',
      read: false,
      createdAt: new Date(),
    });
    // TODO: HARDWARE INTEGRATION - Send push notification via Expo
    // TODO: HARDWARE INTEGRATION - Send SMS via backend API
  }
  
  if (battery < ALERT_THRESHOLDS.LOW_BATTERY) {
    alertStore.addAlert({
      id: `alert-bat-${animalId}-${Date.now()}`,
      animalId,
      animalName,
      type: 'LOW_BATTERY',
      message: `${animalName} tag battery is critically low`,
      severity: 'warning',
      read: false,
      createdAt: new Date(),
    });
  }

  // Stationary Alert
  if (status === 'Stationary') {
    const hoursStationary = (Date.now() - lastMovedAt.getTime()) / (1000 * 60 * 60);
    if (hoursStationary >= ALERT_THRESHOLDS.STATIONARY_HOURS) {
      alertStore.addAlert({
        id: `alert-move-${animalId}-${Date.now()}`,
        animalId,
        animalName,
        type: 'MOVEMENT_ALERT',
        message: `${animalName} hasn't moved for over ${ALERT_THRESHOLDS.STATIONARY_HOURS} hours. Check for illness or injury.`,
        severity: 'critical',
        read: false,
        createdAt: new Date(),
      });
    }
  }

  // Theft Detection (Cattle moving fast away from home > 3km)
  if (animal.category === 'cattle' && currentDist > ALERT_THRESHOLDS.THEFT_DISTANCE) {
    const isMovingAway = animal.prevDistanceFromHome ? currentDist > animal.prevDistanceFromHome : false;
    
    // If moving away rapidly (e.g., speed > 5km/h for cattle is suspicious, usually they graze slowly)
    // Or just moving away while already 3km+ out
    if (isMovingAway && status === 'Moving') {
       alertStore.addAlert({
         id: `alert-theft-${animalId}-${Date.now()}`,
         animalId,
         animalName,
         type: 'THEFT_ALERT',
         message: `POTENTIAL THEFT: ${animalName} is ${currentDist.toFixed(1)}km from home and moving further away rapidly.`,
         severity: 'critical',
         read: false,
         createdAt: new Date(),
       });
    }
  }

  // Lockdown Mode Breach
  const isLockdownMode = useAnimalStore.getState().isLockdownMode;
  if (isLockdownMode && status === 'Moving') {
    alertStore.addAlert({
      id: `alert-lockdown-${animalId}-${Date.now()}`,
      animalId,
      animalName,
      type: 'THEFT_ALERT',
      message: `LOCKDOWN BREACH: ${animalName} is moving while Kraal Lockdown is ACTIVE!`,
      severity: 'critical',
      read: false,
      createdAt: new Date(),
    });
  }
}

/**
 * Connect to the TTN MQTT broker
 */
export function connectMQTT(): void {
  if (client) {
    console.log('MQTT client already exists, skipping connect');
    return;
  }

  console.log('Connecting to TTN MQTT broker...', MQTT_CONFIG.brokerUrl);

  try {
    client = mqtt.connect(MQTT_CONFIG.brokerUrl, {
      username: `${MQTT_CONFIG.appId}@ttn`,
      password: MQTT_CONFIG.apiKey,
      clientId: `herdfinder-mobile-${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      connectTimeout: 5000,
      reconnectPeriod: 1000,
    });

    client.on('connect', () => {
      console.log('Successfully connected to TTN MQTT');
      client?.subscribe(MQTT_CONFIG.topic, (err) => {
        if (err) {
          console.error('MQTT Subscription error:', err);
        } else {
          console.log('Subscribed to topic:', MQTT_CONFIG.topic);
        }
      });
      
      // Update gateway status in store
      useAnimalStore.getState().setGateway({
        ...useAnimalStore.getState().gateway,
        status: 'online',
        lastSeen: new Date(),
      });
    });

    client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString()) as TTNUplink;
        processUplink(payload);
      } catch (e) {
        console.error('Failed to parse MQTT message:', e);
      }
    });

    client.on('error', (err) => {
      console.error('MQTT Connection error:', err);
    });

    client.on('offline', () => {
      console.log('MQTT client went offline');
      useAnimalStore.getState().setGateway({
        ...useAnimalStore.getState().gateway,
        status: 'offline',
      });
    });

    client.on('close', () => {
      console.log('MQTT connection closed');
    });

  } catch (e) {
    console.error('Failed to initialize MQTT client:', e);
  }
}

/**
 * Disconnect from the MQTT broker
 */
export function disconnectMQTT(): void {
  if (client) {
    client.end();
    client = null;
  }
}

export const sendBuzzerDownlink = (deviceId: string, enabled: boolean) => {
  if (!client || !client.connected) {
    console.warn('[MQTT] Cannot send downlink: client not connected');
    return;
  }

  const topic = `v3/${MQTT_CONFIG.appId}@ttn/devices/${deviceId}/down/push`;
  
  const payload = {
    downlinks: [{
      f_port: 2,
      frm_payload: enabled ? 'AQ==' : 'AA==',
      priority: 'NORMAL',
    }]
  };

  client.publish(topic, JSON.stringify(payload));
  console.log(`[MQTT] Sent buzzer downlink (${enabled ? 'ON' : 'OFF'}) to ${deviceId}`);
};

export default {
  MQTT_CONFIG,
  ALERT_THRESHOLDS,
  decodeEarTagPayload,
  processUplink,
  connectMQTT,
  disconnectMQTT,
};
