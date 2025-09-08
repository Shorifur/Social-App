// In server/routes/social/follow.js
const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const NotificationService = require('../../services/notificationService');

// Follow a user
router.post('/:userId', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const userToFollow = await User.findById(req.params.userId);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (currentUser.id === req.params.userId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    
    if (currentUser.isFollowing(req.params.userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    
    // Add to current user's following list
    await currentUser.follow(req.params.userId);
    
    // Add to target user's followers list
    await userToFollow.addFollower(req.user.id);
    
    // Create notification for the followed user
    await NotificationService.createNotification(
      req.params.userId, 
      'follow', 
      req.user.id,
      null,
      `${currentUser.username} started following you`
    );
    
    res.json({ 
      success: true, 
      message: 'Successfully followed user',
      followingCount: currentUser.followingCount,
      followerCount: userToFollow.followerCount
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unfollow a user
router.delete('/:userId', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const userToUnfollow = await User.findById(req.params.userId);
    
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!currentUser.isFollowing(req.params.userId)) {
      return res.status(400).json({ message: 'Not following this user' });
    }
    
    // Remove from current user's following list
    await currentUser.unfollow(req.params.userId);
    
    // Remove from target user's followers list
    await userToUnfollow.removeFollower(req.user.id);
    
    res.json({ 
      success: true, 
      message: 'Successfully unfollowed user',
      followingCount: currentUser.followingCount,
      followerCount: userToUnfollow.followerCount
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if following a user
router.get('/:userId/is-following', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const isFollowing = currentUser.isFollowing(req.params.userId);
    
    res.json({ isFollowing });
  } catch (error) {
    console.error('Is following error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's followers
router.get('/:userId/followers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'username profilePicture firstName lastName');
    
    res.json({ followers: user.followers, count: user.followerCount });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get users that a user is following
router.get('/:userId/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'username profilePicture firstName lastName');
    
    res.json({ following: user.following, count: user.followingCount });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;