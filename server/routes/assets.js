const express = require('express');
const Asset = require('../models/Asset');
const Reading = require('../models/Reading');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/assets
// @desc    Get all assets for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const assets = await Asset.find(query);
    res.json(assets);
  } catch (error) {
    console.error('Fetch Assets Error:', error);
    res.status(500).json({ message: 'Server error fetching assets' });
  }
});

// @route   GET /api/assets/:id/readings
// @desc    Get readings for a specific asset
// @access  Private
router.get('/:id/readings', protect, async (req, res) => {
  try {
    // Verify asset ownership (skip for admin)
    const query = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, owner: req.user._id };
    const asset = await Asset.findOne(query);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found or not authorized' });
    }

    const readings = await Reading.find({ assetId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(50); // Get last 50 readings

    res.json(readings);
  } catch (error) {
    console.error('Fetch Readings Error:', error);
    res.status(500).json({ message: 'Server error fetching readings' });
  }
});

module.exports = router;
