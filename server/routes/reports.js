const express = require('express');
const Report = require('../models/Report');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/reports
// @desc    Get all reports for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const reports = await Report.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Fetch Reports Error:', error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

// @route   POST /api/reports
// @desc    Request a new report
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, type, parameters } = req.body;
    const report = await Report.create({
      owner: req.user._id,
      title,
      type,
      parameters,
      status: 'generating'
    });
    
    // In a real app, you'd trigger an async job here
    setTimeout(async () => {
      report.status = 'completed';
      await report.save();
    }, 5000);

    res.status(201).json(report);
  } catch (error) {
    console.error('Create Report Error:', error);
    res.status(500).json({ message: 'Server error creating report' });
  }
});

module.exports = router;
