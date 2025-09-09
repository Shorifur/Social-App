// server/routes/auth/index.js
const express = require('express');
const router = express.Router();

// Import auth sub-routes
const loginRouter = require('./login');
const registerRouter = require('./register');
const passwordResetRouter = require('./passwordReset');
const usersRouter = require('./users');

// Use auth sub-routes
router.use('/login', loginRouter);
router.use('/register', registerRouter);
router.use('/password-reset', passwordResetRouter);
router.use('/users', usersRouter);

// Auth root endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Auth API endpoints' });
});

module.exports = router;