require('dotenv').config();
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const Reading = require('./models/Reading');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// TTN MQTT Configuration
const MQTT_CONFIG = {
  url: process.env.TTN_MQTT_URL,
  username: process.env.TTN_USERNAME,
  password: process.env.TTN_PASSWORD,
  topic: `v3/${process.env.TTN_APP_ID}@ttn/devices/+/up`,
};

console.log('🔗 Connecting to TTN MQTT:', MQTT_CONFIG.url);

const client = mqtt.connect(MQTT_CONFIG.url, {
  username: MQTT_CONFIG.username,
  password: MQTT_CONFIG.password,
  clientId: `herdfinder-server-${Math.random().toString(16).slice(2, 10)}`,
});

client.on('connect', () => {
  console.log('📡 Connected to TTN MQTT');
  client.subscribe(MQTT_CONFIG.topic, (err) => {
    if (err) console.error('MQTT Subscription Error:', err);
    else console.log('✅ Subscribed to topic:', MQTT_CONFIG.topic);
  });
});

client.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    const deviceId = payload.end_device_ids.device_id;
    const decoded = payload.uplink_message.decoded_payload;
    const metadata = payload.uplink_message.rx_metadata?.[0];

    console.log(`📥 Received data from ${deviceId}:`, decoded);

    // Save to MongoDB
    const newReading = new Reading({
      tagId: deviceId,
      temperature: decoded.temperature,
      battery: decoded.battery,
      latitude: decoded.latitude,
      longitude: decoded.longitude,
      status: decoded.motion ? 'Moving' : 'Stationary',
      rssi: metadata?.rssi,
      snr: metadata?.snr,
      timestamp: new Date(payload.received_at || Date.now()),
    });

    await newReading.save();
    console.log(`💾 Saved reading for ${deviceId} to MongoDB`);

  } catch (e) {
    console.error('❌ Failed to process MQTT message:', e);
  }
});

client.on('error', (err) => console.error('MQTT Client Error:', err));
client.on('close', () => console.log('MQTT Connection Closed'));
