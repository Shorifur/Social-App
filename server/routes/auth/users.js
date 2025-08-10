const express = require('express');
const router = express.Router();
const path = require('path');

// Absolute path to the User model
const User = require(path.join(__dirname, '..', '..', 'models', 'User'));

// GET user by ID (excluding password)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
