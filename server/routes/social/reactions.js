// In server/routes/social/reactions.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const NotificationService = require('../../services/notificationService');

// React to post
router.post('/:postId/react', auth, async (req, res) => {
  try {
    const { reactionType } = req.body;
    
    if (!['like', 'love', 'haha', 'wow', 'sad', 'angry', 'dislike'].includes(reactionType)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }
    
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    await post.addReaction(req.user.id, reactionType);
    
    // Send notification for positive reactions (not dislike)
    if (reactionType !== 'dislike' && post.author.toString() !== req.user.id) {
      await NotificationService.createNotification(
        post.author,
        'like',
        req.user.id,
        post._id,
        null,
        `${req.user.username} reacted to your post`
      );
    }
    
    res.json({
      success: true,
      message: 'Reaction added successfully',
      reactionCounts: post.reactionCounts,
      userReaction: reactionType
    });
  } catch (error) {
    console.error('React to post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove reaction
router.delete('/:postId/react', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    await post.removeReaction(req.user.id);
    
    res.json({
      success: true,
      message: 'Reaction removed successfully',
      reactionCounts: post.reactionCounts,
      userReaction: null
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get post reactions
router.get('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('reactions.userId', 'username profilePicture firstName lastName');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({
      success: true,
      reactions: post.reactions,
      reactionCounts: post.reactionCounts
    });
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's reaction to post
router.get('/:postId/user-reaction', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const userReaction = post.getUserReaction(req.user.id);
    
    res.json({
      success: true,
      userReaction
    });
  } catch (error) {
    console.error('Get user reaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;