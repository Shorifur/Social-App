const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');

// Search users and posts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({ username: { $regex: q, $options: 'i' } }).select('username profilePic');
    const posts = await Post.find({ content: { $regex: q, $options: 'i' } }).populate('user', 'username');
    
    res.json({ users, posts });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;