/**
 * Web stub for the MQTT service.
 * The real mqtt.ts uses the 'mqtt' npm package which pulls in Node.js streams
 * and Buffer polyfills that cause Metro's web bundler to hang/crash.
 * This file is automatically picked by Metro on the web platform instead.
 *
 * On web, real-time updates are not available via MQTT.
 * The app will display its cached/mock data.
 */

export function decodeEarTagPayload(_bytes: number[]) {
  return { temperature: 0, battery: 0 };
}

export function processUplink(_payload: any): void {}

export function connectMQTT(): void {
  console.log('[MQTT Web Stub] MQTT is not available on web. Using cached data.');
}

export function disconnectMQTT(): void {}

export const sendBuzzerDownlink = (_deviceId: string, _enabled: boolean): void => {
  console.log('[MQTT Web Stub] Buzzer downlink not available on web.');
};

export default {
  MQTT_CONFIG: {},
  ALERT_THRESHOLDS: {},
  decodeEarTagPayload,
  processUplink,
  connectMQTT,
  disconnectMQTT,
};
