const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

module.exports = async (req, res, next) => {
  try {
    let token;

    // 1) Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2) If no token found
    if (!token) {
      return next(new AppError('Please log in to access this resource', 401));
    }

    // 3) Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new AppError('Invalid or expired token', 401));
    }

    // 4) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    // 5) Attach user to request
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};
