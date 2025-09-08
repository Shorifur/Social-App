// In server/routes/social/comments.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const CommentService = require('../../services/commentService');

// Create comment
router.post('/:postId', auth, async (req, res) => {
  try {
    const { content, parentCommentId, mentions } = req.body;
    
    const comment = await CommentService.createComment(
      req.params.postId,
      req.user.id,
      content,
      parentCommentId,
      mentions
    );

    res.json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get post comments
router.get('/post/:postId', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await CommentService.getPostComments(
      req.params.postId,
      page,
      limit
    );

    res.json({
      success: true,
      comments: result.comments,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like comment
router.post('/:commentId/like', auth, async (req, res) => {
  try {
    const comment = await CommentService.likeComment(
      req.params.commentId,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Comment liked successfully',
      likeCount: comment.likeCount
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unlike comment
router.post('/:commentId/unlike', auth, async (req, res) => {
  try {
    const comment = await CommentService.unlikeComment(
      req.params.commentId,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Comment unliked successfully',
      likeCount: comment.likeCount
    });
  } catch (error) {
    console.error('Unlike comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add reply
router.post('/:commentId/reply', auth, async (req, res) => {
  try {
    const { content, mentions } = req.body;
    
    const reply = await CommentService.addReply(
      req.params.commentId,
      req.user.id,
      content,
      mentions
    );

    res.json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    await CommentService.deleteComment(
      req.params.commentId,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;