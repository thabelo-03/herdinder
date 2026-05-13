const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagId: { type: String, required: true, unique: true },
  category: { type: String, enum: ['cattle', 'motorbike', 'vehicle'], default: 'cattle' },
  herdName: { type: String },
  plateNumber: { type: String },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Asset', AssetSchema);
