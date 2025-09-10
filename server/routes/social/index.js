// server/routes/social/index.js
const express = require('express');
const router = express.Router();

// Import all social sub-routes
const postsRouter = require('./posts');
const reactionsRouter = require('./reactions');
const commentsRouter = require('./comments');
const sharesRouter = require('./shares');
const storiesRouter = require('./stories');
const followRouter = require('./follow');

// Use all social sub-routes
router.use('/posts', postsRouter);
router.use('/reactions', reactionsRouter);
router.use('/comments', commentsRouter);
router.use('/shares', sharesRouter);
router.use('/stories', storiesRouter);
router.use('/follow', followRouter);

// Social root endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Social API endpoints' });
});

module.exports = router;