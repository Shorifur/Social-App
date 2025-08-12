import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../../models/User';

const router = express.Router();

router.post(
  '/',
  [
    body('firstName').notEmpty().withMessage('First name is required').trim(),
    body('lastName').notEmpty().withMessage('Last name is required').trim(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('username').notEmpty().withMessage('Username is required').trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, username } = req.body;

    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create and save the new user
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        username
      });

      await user.save();

      res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (err) {
      console.error('❌ Registration error:', err);
      res.status(500).json({ message: 'Registration failed' });
    }
  }
);

export default router;
