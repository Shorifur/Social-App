// In server/routes/social/index.js
const express = require('express');
const router = express.Router();
const followRoutes = require('./follow');
const postRoutes = require('./posts'); // If you have this
const storyRoutes = require('./stories'); // If you have this

// Use follow routes
router.use('/follow', followRoutes);
router.use('/posts', postRoutes);
router.use('/stories', storyRoutes);

module.exports = router;

