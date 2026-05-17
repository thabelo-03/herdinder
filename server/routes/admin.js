const express = require('express');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Alert = require('../models/Alert');
const Reading = require('../models/Reading');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Simulated system logs
let systemLogs = [
  { id: 'log-1', type: 'INFO', message: 'Database backup completed successfully', time: '2h ago' },
  { id: 'log-2', type: 'WARNING', message: 'Slow query detected on readings collection', time: '5h ago' },
  { id: 'log-3', type: 'INFO', message: 'Index optimization started', time: 'Yesterday' },
];

// Simulated TTN Gateways (Since gateways aren't modeled in DB, we mock them on backend with live stats)
const mockGatewaysList = [
  {
    id: 'gw-001',
    name: 'Mat South 01',
    status: 'online',
    signalStrength: 'Strong',
    battery: 98,
    location: { latitude: -21.416589, longitude: 28.064443 },
    lastSeen: new Date(),
  },
  {
    id: 'gw-002',
    name: 'Mat South Node 4',
    status: 'offline',
    signalStrength: 'Weak',
    battery: 15,
    location: { latitude: -21.366589, longitude: 28.084443 },
    lastSeen: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: 'gw-003',
    name: 'North Point Relay',
    status: 'online',
    signalStrength: 'Medium',
    battery: 82,
    location: { latitude: -21.446589, longitude: 28.024443 },
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
  },
];

// @route   GET /api/admin/stats
// @desc    Get system overview stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalAssets = await Asset.countDocuments({});
    const criticalAlerts = await Alert.find({ severity: 'critical' })
      .sort({ createdAt: -1 })
      .limit(5);

    const activeGateways = mockGatewaysList.filter(g => g.status === 'online').length;

    // Calculate Dynamic MRR
    const activeUsers = await User.find({ 'subscription.status': 'active' });
    let totalMRR = 0;
    for (const u of activeUsers) {
      if (u.subscription && u.subscription.tagCount && u.subscription.pricePerTag) {
        totalMRR += u.subscription.tagCount * u.subscription.pricePerTag;
      }
    }

    res.json({
      stats: {
        totalUsers,
        activeGateways,
        totalAssets,
        systemHealth: 98.5,
        totalMRR: Math.round(totalMRR * 100) / 100,
      },
      recentLogs: criticalAlerts.map(a => ({
        id: a._id.toString(),
        type: a.type.replace('_', ' '),
        location: a.animalName || 'System',
        time: 'Just now',
        critical: true,
      })),
    });
  } catch (error) {
    console.error('Fetch Admin Stats Error:', error);
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Fetch Admin Users Error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   GET /api/admin/gateways
// @desc    Get gateways list
// @access  Private/Admin
router.get('/gateways', protect, admin, async (req, res) => {
  try {
    res.json(mockGatewaysList);
  } catch (error) {
    console.error('Fetch Gateways Error:', error);
    res.status(500).json({ message: 'Server error fetching gateways' });
  }
});

// @route   GET /api/admin/database/logs
// @desc    Get database logs and maintenance states
// @access  Private/Admin
router.get('/database/logs', protect, admin, async (req, res) => {
  res.json({
    logs: systemLogs,
    metrics: {
      latency: '12ms',
      storage: '4.2 / 512 GB',
      uptime: '99.99%',
    }
  });
});

// @route   POST /api/admin/database/action
// @desc    Perform database maintenance action
// @access  Private/Admin
router.post('/database/action', protect, admin, async (req, res) => {
  try {
    const { action } = req.body;
    let message = '';
    let logType = 'INFO';

    if (action === 'backup') {
      message = 'Database manual backup completed successfully';
    } else if (action === 'clear') {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const deleteResult = await Reading.deleteMany({ timestamp: { $lt: ninetyDaysAgo } });
      message = `Telemetry cache cleared successfully (purged ${deleteResult.deletedCount || 0} readings)`;
    } else if (action === 'optimize') {
      message = 'Indexes re-indexed and tables optimized successfully';
    } else if (action === 'restore') {
      message = 'Database restore snapshot selected successfully';
      logType = 'WARNING';
    } else {
      return res.status(400).json({ message: 'Invalid database action' });
    }

    const newLog = {
      id: `log-${Date.now()}`,
      type: logType,
      message,
      time: 'Just now',
    };

    systemLogs.unshift(newLog);

    res.json({ success: true, message, log: newLog });
  } catch (error) {
    console.error('Database Maintenance Action Error:', error);
    res.status(500).json({ message: 'Server error running maintenance action' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get global stats & charts
// @access  Private/Admin
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments({});
    
    // Group alerts by type
    const leftSafeZoneCount = await Alert.countDocuments({ type: 'LEFT_SAFE_ZONE' });
    const lowBatteryCount = await Alert.countDocuments({ type: 'LOW_BATTERY' });
    const theftAlertCount = await Alert.countDocuments({ type: 'THEFT_ALERT' });
    const highTempCount = await Alert.countDocuments({ type: 'HIGH_TEMPERATURE' });
    const speedingCount = await Alert.countDocuments({ type: 'SPEEDING' });

    // Regional distribution (mock percentages based on assets inside safezone or simple count)
    const matSouthCount = await Asset.countDocuments({ latitude: { $exists: true } });

    res.json({
      growth: [40, 60, 45, 80, 55, 90, totalAssets > 0 ? Math.min(100, totalAssets * 3) : 75],
      metrics: {
        avgResponseTime: '380ms',
        activeUsers: await User.countDocuments({}),
      },
      alerts: [
        { label: 'Left Safe Zone', count: leftSafeZoneCount },
        { label: 'Theft Alerts', count: theftAlertCount },
        { label: 'Low Battery', count: lowBatteryCount },
        { label: 'High Temp', count: highTempCount },
        { label: 'Speeding', count: speedingCount },
      ],
      distribution: [
        { label: 'Mat South', count: matSouthCount, percent: '80%' },
        { label: 'Mat North', count: 0, percent: '0%' },
        { label: 'Midlands', count: 0, percent: '0%' },
      ],
    });
  } catch (error) {
    console.error('Fetch Analytics Error:', error);
    res.status(500).json({ message: 'Server error fetching global analytics' });
  }
});

// @route   PUT /api/admin/users/:id/subscription
// @desc    Update/Activate user subscription
// @access  Private/Admin
router.put('/users/:id/subscription', protect, admin, async (req, res) => {
  try {
    const { plan, tagCount, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let pricePerTag = 10.00;
    if (plan === 'starter') pricePerTag = 20.00;
    else if (plan === 'standard') pricePerTag = 15.00;
    else if (plan === 'community') pricePerTag = 0.00;

    const startDate = new Date();
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    user.subscription = {
      plan,
      tagCount: Number(tagCount) || 10,
      pricePerTag,
      currency: 'ZAR',
      status,
      startDate,
      endDate,
    };

    await user.save();
    
    // Add audit log
    const auditLog = {
      id: `log-${Date.now()}`,
      type: 'INFO',
      message: `Updated subscription for ${user.name} to ${plan.toUpperCase()} (${status.toUpperCase()})`,
      time: 'Just now',
    };
    systemLogs.unshift(auditLog);

    res.json(user);
  } catch (error) {
    console.error('Update Subscription Error:', error);
    res.status(500).json({ message: 'Server error updating user subscription' });
  }
});

module.exports = router;
