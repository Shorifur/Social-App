// server/routes/social/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const auth = require('../../middleware/auth');
const NotificationService = require('../../services/notificationService');
const { checkPost } = require('../../utils/contentModerator');

// ===============================
// Get news feed posts
// ===============================
router.get('/feed', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.getFeedPosts(req.user.id, page, limit);

    res.json({
      success: true,
      posts,
      page,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    console.error('❌ Get feed error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===============================
// Get posts for a specific user
// ===============================
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.getUserPosts(req.params.userId, req.user.id, page, limit);

    res.json({
      success: true,
      posts,
      page,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    console.error('❌ Get user posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===============================
// Create a new post with content moderation
// ===============================
router.post('/', auth, async (req, res) => {
  try {
    const { content, media, privacy, feeling, activity, tags, location } = req.body;

    // Run content moderation check
    const { isSafe } = await checkPost(content);
    if (!isSafe) {
      return res.status(400).json({
        success: false,
        message: '❌ Content violates community guidelines.',
      });
    }

    const post = new Post({
      content,
      author: req.user.id,
      media: media || [],
      privacy: privacy || 'public',
      feeling,
      activity,
      tags: tags || [],
      location,
    });

    await post.save();
    await post.populate('author', 'username profilePicture firstName lastName');

    res.status(201).json({
      success: true,
      message: '✅ Post created successfully',
      post,
    });
  } catch (error) {
    console.error('❌ Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===============================
// Like a post
// ===============================
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.likePost(req.user.id);

    // Send notification if liking someone else's post
    if (post.author.toString() !== req.user.id) {
      await NotificationService.createNotification(
        post.author,
        'like',
        req.user.id,
        post._id,
        `${req.user.username} liked your post`
      );
    }

    res.json({
      success: true,
      message: 'Post liked',
      likeCount: post.likeCount,
    });
  } catch (error) {
    console.error('❌ Like post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===============================
// Unlike a post
// ===============================
router.post('/:postId/unlike', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.unlikePost(req.user.id);

    res.json({
      success: true,
      message: 'Post unliked',
      likeCount: post.likeCount,
    });
  } catch (error) {
    console.error('❌ Unlike post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===============================
// Add a comment to a post
// ===============================
router.post('/:postId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Push comment (stored as ref to Comment model if you have it)
    post.comments.push({
      author: req.user._id,
      content,
    });

    await post.save();
    await post.populate({
      path: 'comments',
      populate: { path: 'author', select: 'firstName lastName username profilePicture' },
    });

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: '✅ Comment added successfully',
      comment: newComment,
    });
  } catch (error) {
    console.error('❌ Failed to add comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===============================
// Delete a post
// ===============================
router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.postId);

    res.json({
      success: true,
      message: '✅ Post deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
