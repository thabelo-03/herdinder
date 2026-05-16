const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagId: { type: String, required: true, unique: true },
  category: { type: String, enum: ['cattle', 'motorbike', 'vehicle'], default: 'cattle' },
  deviceType: { type: String, enum: ['ear_tag', 'dragino_tracker'] },
  herdName: { type: String },
  plateNumber: { type: String },
  make: { type: String },
  model: { type: String },
  status: { type: String, default: 'Moving' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  latitude: { type: Number },
  longitude: { type: Number },
  battery: { type: Number },
  temperature: { type: Number },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Asset', AssetSchema);
