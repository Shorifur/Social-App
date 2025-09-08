const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1) Basic validation
    if (!firstName || !lastName || !email || !password) {
      return next(new AppError('Please provide first name, last name, email and password', 400));
    }

    // 2) Check if user exists (case-insensitive)
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // 3) Create new user (password hashing handled by mongoose pre 'save')
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    // 4) Generate JWT token
    const token = signToken(newUser._id);

    // 5) Remove password before sending response
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // 2) Find user + password
    const user = await User.findOne({ email }).select('+password');

    // 3) Check user and password correctness
    if (!user || !(await user.correctPassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 4) Generate JWT token
    const token = signToken(user._id);

    // 5) Remove password before sending response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};
