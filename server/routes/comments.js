const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Add comment to a post
router.post('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({
      user: req.user._id,   // use _id, matching mongoose document id
      text: req.body.text,
    });

    await post.save();

    // Populate the newly added comment's user field before returning
    const populatedPost = await Post.findById(req.params.postId)
      .populate('comments.user', 'username profilePic');

    res.status(201).json(populatedPost.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('comments.user', 'username profilePic');

    if (!post) return res.status(404).json({ error: 'Post not found' });

    res.json(post.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
