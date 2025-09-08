// In server/routes/settings.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserSettings = require('../models/UserSettings');
const User = require('../models/User');

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user.id });
    
    if (!settings) {
      // Create default settings if none exist
      settings = new UserSettings({ userId: req.user.id });
      await settings.save();
    }
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user settings
router.put('/', auth, async (req, res) => {
  try {
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, bio, website, location, birthDate } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'profile.firstName': firstName,
          'profile.lastName': lastName,
          'profile.bio': bio,
          'profile.website': website,
          'profile.location': location,
          'profile.birthDate': birthDate
        }
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile picture
router.put('/profile-picture', auth, async (req, res) => {
  try {
    const { profilePicture } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { 'profile.profilePicture': profilePicture } },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update cover photo
router.put('/cover-photo', auth, async (req, res) => {
  try {
    const { coverPhoto } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { 'profile.coverPhoto': coverPhoto } },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Cover photo updated successfully',
      user
    });
  } catch (error) {
    console.error('Update cover photo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Deactivate account
router.post('/deactivate', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isActive: false, deactivatedAt: new Date() },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;