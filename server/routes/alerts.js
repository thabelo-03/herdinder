const express = require('express');
const Alert = require('../models/Alert');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get all alerts for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('Fetch Alerts Error:', error);
    res.status(500).json({ message: 'Server error fetching alerts' });
  }
});

// @route   PUT /api/alerts/:id/read
// @desc    Mark alert as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, owner: req.user._id });
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    alert.read = true;
    await alert.save();
    res.json(alert);
  } catch (error) {
    console.error('Update Alert Error:', error);
    res.status(500).json({ message: 'Server error updating alert' });
  }
});

module.exports = router;
