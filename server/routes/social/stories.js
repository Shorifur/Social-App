const express = require('express');
const router = express.Router();
const Story = require('../../models/Story');
const authMiddleware = require('../../middleware/auth');

// Upload a story (24-hour expiry)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { image, caption } = req.body;
    const story = new Story({
      image,
      caption,
      user: req.user._id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    await story.save();
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active stories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate('user', 'username profilePic');
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;