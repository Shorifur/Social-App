// In server/routes/social/shares.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ShareService = require('../../services/shareService');

// Share post
router.post('/:postId', auth, async (req, res) => {
  try {
    const { content, audience } = req.body;
    
    const result = await ShareService.sharePost(
      req.params.postId,
      req.user.id,
      content,
      audience
    );

    res.json({
      success: true,
      post: result.sharedPost,
      share: result.share
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user shares
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await ShareService.getUserShares(
      req.params.userId,
      page,
      limit
    );

    res.json({
      success: true,
      shares: result.shares,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get user shares error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get post shares
router.get('/post/:postId', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await ShareService.getPostShares(
      req.params.postId,
      page,
      limit
    );

    res.json({
      success: true,
      shares: result.shares,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get post shares error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete share
router.delete('/:shareId', auth, async (req, res) => {
  try {
    await ShareService.deleteShare(
      req.params.shareId,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Share deleted successfully'
    });
  } catch (error) {
    console.error('Delete share error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;