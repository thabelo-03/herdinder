const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['health', 'movement', 'activity', 'system'],
    default: 'health',
  },
  status: {
    type: String,
    enum: ['completed', 'generating', 'failed'],
    default: 'completed',
  },
  fileUrl: String,
  parameters: {
    startDate: Date,
    endDate: Date,
    assetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Report', ReportSchema);
