const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }

    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded payload may have different structure,
    // adapt according to your token payload: e.g. decoded.user.id or decoded.id
    const userId = decoded.user?.id || decoded.id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed: User not found' });
    }

    req.user = user; // Attach user object to request
    next();
  } catch (err) {
    console.error('❌ Auth Middleware Error:', err);
    res.status(401).json({ message: 'Authentication failed: Invalid token' });
  }
};

module.exports = auth;
