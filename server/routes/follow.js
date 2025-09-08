// In server/routes/social/follow.js
const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const auth = require('../../middleware/auth');

// Follow a user
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already following
    if (currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    
    // Add to following list
    currentUser.following.push(req.params.userId);
    // Add to follower list of the target user
    userToFollow.followers.push(req.user.id);
    
    await currentUser.save();
    await userToFollow.save();
    
    // TODO: Create notification for the followed user
    
    res.json({ 
      success: true, 
      message: 'Successfully followed user',
      followingCount: currentUser.following.length,
      followerCount: userToFollow.followers.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unfollow a user
router.post('/unfollow/:userId', auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);
    
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove from following list
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== req.params.userId
    );
    
    // Remove from follower list of the target user
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user.id
    );
    
    await currentUser.save();
    await userToUnfollow.save();
    
    res.json({ 
      success: true, 
      message: 'Successfully unfollowed user',
      followingCount: currentUser.following.length,
      followerCount: userToUnfollow.followers.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;