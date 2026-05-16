const express = require('express');
const Asset = require('../models/Asset');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// @route   GET /api/search
// @desc    Global Search using MongoDB Atlas Search (with $regex fallback)
router.get('/', protect, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ assets: [], alerts: [], zones: [] });
    }

    let assets = [];
    
    try {
      // 1. Try MongoDB Atlas Search (Requires "default" Search Index)
      const searchStage = {
        $search: {
          index: "default",
          text: {
            query: q,
            path: { wildcard: "*" },
            fuzzy: { maxEdits: 2 }
          }
        }
      };

      const pipeline = [searchStage];

      // Filter by owner if not admin
      if (req.user.role !== 'admin') {
        pipeline.push({ $match: { owner: req.user._id } });
      }

      pipeline.push({ $limit: 5 });
      assets = await Asset.aggregate(pipeline);
    } catch (searchError) {
      // 2. Fallback: If Atlas Search Index is not created yet, use standard $regex
      console.log('Atlas Search failed (index may not exist), falling back to $regex');
      const baseQuery = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { tagId: { $regex: q, $options: 'i' } },
          { herdName: { $regex: q, $options: 'i' } },
          { plateNumber: { $regex: q, $options: 'i' } }
        ]
      };

      const finalQuery = req.user.role === 'admin' 
        ? baseQuery 
        : { ...baseQuery, owner: req.user._id };

      assets = await Asset.find(finalQuery).limit(5);
    }

    // Return categorized results
    res.json({
      assets,
      alerts: [], // Placeholders for future collections
      zones: []
    });

  } catch (error) {
    console.error('Search Engine Error:', error);
    res.status(500).json({ message: 'Error performing search' });
  }
});

module.exports = router;
