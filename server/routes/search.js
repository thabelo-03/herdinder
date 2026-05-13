const express = require('express');
const Asset = require('../models/Asset');
const router = express.Router();

// @route   GET /api/search
// @desc    Global Search using MongoDB Atlas Search (with $regex fallback)
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ assets: [], alerts: [], zones: [] });
    }

    let assets = [];
    
    try {
      // 1. Try MongoDB Atlas Search (Requires "default" Search Index)
      assets = await Asset.aggregate([
        {
          $search: {
            index: "default",
            text: {
              query: q,
              path: { wildcard: "*" },
              fuzzy: { maxEdits: 2 } // Allows for typos
            }
          }
        },
        { $limit: 5 }
      ]);
    } catch (searchError) {
      // 2. Fallback: If Atlas Search Index is not created yet, use standard $regex
      console.log('Atlas Search failed (index may not exist), falling back to $regex');
      assets = await Asset.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { tagId: { $regex: q, $options: 'i' } },
          { herdName: { $regex: q, $options: 'i' } },
          { plateNumber: { $regex: q, $options: 'i' } }
        ]
      }).limit(5);
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
