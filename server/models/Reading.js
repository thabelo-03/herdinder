const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
  tagId: {
    type: String,
    required: true,
    index: true,
  },
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    index: true,
  },
  animalId: String,
  animalName: String,
  temperature: Number,
  battery: Number,
  latitude: Number,
  longitude: Number,
  status: String,
  rssi: Number,
  snr: Number,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for geo-queries if needed
ReadingSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Reading', ReadingSchema);
