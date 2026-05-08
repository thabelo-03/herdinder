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

// Configuration - TODO: Move to .env when hardware is connected
const MQTT_CONFIG = {
  brokerUrl: 'wss://eu1.cloud.thethings.network:443',
  appId: 'herdfinder-matsouth',
  apiKey: 'NNSXS.YOUR_API_KEY_HERE',
  // Topic pattern for subscribing to all devices
  topic: 'v3/herdfinder-matsouth@ttn/devices/+/up',
};

// Alert thresholds
const ALERT_THRESHOLDS = {
  HIGH_TEMP: 39.5,     // °C - Push notification
  MILD_FEVER: 38.5,    // °C - In-app alert
  LOW_BATTERY: 3.2,    // V (or 20%)
  OFFLINE_HOURS: 12,   // Hours with no reading
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
    store.updateAnimal(animal.id, {
      temperature: decoded.temperature,
      battery: decoded.battery * 10, // Convert voltage to percentage estimate
      lastSeen: new Date(),
      status: 'Moving', // TODO: Determine from accelerometer data
    });
    
    // Check alert rules
    checkAlertRules(animal.id, animal.name, decoded.temperature, decoded.battery);
  }
}

/**
 * Check alert rules and create alerts if thresholds exceeded
 */
function checkAlertRules(
  animalId: string,
  animalName: string,
  temperature: number,
  battery: number
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
      id: `alert-${Date.now()}`,
      animalId,
      animalName,
      type: 'LOW_BATTERY',
      message: `${animalName} tag battery is critically low`,
      severity: 'warning',
      read: false,
      createdAt: new Date(),
    });
  }
}

/**
 * TODO: HARDWARE INTEGRATION - Implement these functions when MQTT library is connected
 * 
 * export function connectMQTT(): void {
 *   const client = mqtt.connect(MQTT_CONFIG.brokerUrl, {
 *     username: `${MQTT_CONFIG.appId}@ttn`,
 *     password: MQTT_CONFIG.apiKey,
 *   });
 *   
 *   client.on('connect', () => {
 *     client.subscribe(MQTT_CONFIG.topic);
 *     console.log('Connected to TTN MQTT');
 *   });
 *   
 *   client.on('message', (topic, message) => {
 *     const payload = JSON.parse(message.toString()) as TTNUplink;
 *     processUplink(payload);
 *   });
 * }
 * 
 * export function disconnectMQTT(): void {
 *   // client.end();
 * }
 */

export default {
  MQTT_CONFIG,
  ALERT_THRESHOLDS,
  decodeEarTagPayload,
  processUplink,
};
