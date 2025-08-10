const express = require('express');
const Post = require('../../models/Post.js');
const auth = require('../../middleware/auth.js');
const { checkPost } = require('../../utils/contentModerator.js');

const router = express.Router();

// Create a new post with content moderation
router.post('/', auth, async (req, res) => {
  try {
    const { content, image } = req.body;

    // Content moderation check
    const { isSafe } = await checkPost(content);
    if (!isSafe) {
      return res.status(400).json({ error: 'Content violates community guidelines.' });
    }

    const post = new Post({
      content,
      image,              // Optional image attached to post
      author: req.user._id,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error('Failed to create post:', err);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Fetch all posts, newest first, with author info
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'firstName lastName username profilePic')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error('Failed to fetch posts:', err);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Like / Unlike a post toggle
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some(id => id.toString() === userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error('Failed to toggle like:', err);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
});

// Add a comment to a post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({
      text: req.body.text,
      author: req.user._id,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error('Failed to add comment:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// Get comments for a post, with author details
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'comments.author',
      'firstName lastName username profilePic'
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });

    res.json(post.comments);
  } catch (err) {
    console.error('Failed to fetch comments:', err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

module.exports = router;
