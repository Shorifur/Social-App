// server/routes/reactions.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reaction = require('../models/Reaction');
const Post = require('../models/Post');

// Add reaction to post
router.post('/posts/:postId/reactions', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already reacted to this post
    const existingReaction = await Reaction.findOne({
      post: postId,
      user: userId
    });

    if (existingReaction) {
      // Update existing reaction
      existingReaction.type = type;
      await existingReaction.save();
      return res.json(existingReaction);
    }

    // Create new reaction
    const reaction = new Reaction({
      type,
      post: postId,
      user: userId
    });

    await reaction.save();
    
    // Populate user info for response
    await reaction.populate('user', 'name username profilePicture');
    
    res.status(201).json(reaction);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove reaction from post
router.delete('/posts/:postId/reactions', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const reaction = await Reaction.findOneAndDelete({
      post: postId,
      user: userId
    });

    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reactions for a post
router.get('/posts/:postId/reactions', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const reactions = await Reaction.find({ post: postId })
      .populate('user', 'name username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reaction.countDocuments({ post: postId });

    res.json({
      reactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error getting reactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's reaction to a post
router.get('/posts/:postId/reactions/me', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const reaction = await Reaction.findOne({
      post: postId,
      user: userId
    });

    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    res.json(reaction);
  } catch (error) {
    console.error('Error getting user reaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reactions
router.get('/users/:userId/reactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const reactions = await Reaction.find({ user: userId })
      .populate('post', 'content')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reaction.countDocuments({ user: userId });

    res.json({
      reactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error getting user reactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
