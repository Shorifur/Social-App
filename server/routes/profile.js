const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Story = require('../models/Story'); // Added Story model
const auth = require('../middleware/auth');

// Get user profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate({
        path: 'posts',
        populate: { path: 'user', select: 'username avatar' }
      });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user stats by user ID
router.get('/:id/stats', async (req, res) => {
  try {
    const [stories, reactions] = await Promise.all([
      Story.countDocuments({ userId: req.params.id }),
      Story.aggregate([
        { $match: { userId: req.params.id } },
        { $project: { count: { $size: "$reactions" } } },
        { $group: { _id: null, total: { $sum: "$count" } } }
      ])
    ]);

    res.json({
      storyCount: stories,
      reactionCount: reactions[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
