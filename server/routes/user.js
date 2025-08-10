const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// Get user profile by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -__v')
      .populate('friends', 'firstName lastName profilePicture');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Update logged-in user's profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    // Use req.userId (set by auth middleware) to identify user
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: req.body },
      { new: true }
    ).select('-password -__v');

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Follow a user
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow) return res.status(404).json({ error: 'User not found' });

    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Update both users
    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.userId);

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: 'Followed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Unfollow a user
router.post('/:id/unfollow', authMiddleware, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToUnfollow) return res.status(404).json({ error: 'User not found' });

    // Remove from following & followers
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.id
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.userId.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
