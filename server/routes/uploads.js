const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth'); // assumes CommonJS export
const User = require('../models/User');

// Configure multer storage with dynamic destination folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // If upload is for story, store in 'uploads/stories', else 'uploads/'
    const isStoryUpload = req.originalUrl.includes('/story');
    const uploadDir = path.join(__dirname, '../uploads', isStoryUpload ? 'stories' : '');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Use authenticated user's ID for filename prefix
    const userId = req.user?._id || 'user';
    const filename = `${userId}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// File filter to allow only images (jpeg, jpg, png, gif)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer upload instance with limits (default 5MB or from env)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.FILE_UPLOAD_SIZE_LIMIT || '5', 10) * 1024 * 1024, // 5MB default
  }
});

// Upload profile picture
router.post('/profile', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user._id);
    if (user.profilePicture) {
      const oldPath = path.join(__dirname, '../', user.profilePicture);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const relativePath = path.join('uploads', req.file.filename).replace(/\\/g, '/');
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: `/${relativePath}` },
      { new: true }
    ).select('-password');

    res.json({ url: `/${relativePath}`, user: updatedUser });
  } catch (err) {
    console.error('Upload profile picture error:', err);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
});

// Upload cover photo
router.post('/cover', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user._id);
    if (user.coverPhoto) {
      const oldPath = path.join(__dirname, '../', user.coverPhoto);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const relativePath = path.join('uploads', req.file.filename).replace(/\\/g, '/');
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { coverPhoto: `/${relativePath}` },
      { new: true }
    ).select('-password');

    res.json({ url: `/${relativePath}`, user: updatedUser });
  } catch (err) {
    console.error('Upload cover photo error:', err);
    res.status(500).json({ message: 'Failed to upload cover photo' });
  }
});

// Upload story media (image/video)
router.post('/story', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const folder = req.originalUrl.includes('/story') ? 'stories' : '';
    const relativePath = path.join('uploads', folder, req.file.filename).replace(/\\/g, '/');
    res.json({
      url: `/${relativePath}`,
      type: req.file.mimetype,
      size: req.file.size
    });
  } catch (err) {
    console.error('Upload story media error:', err);
    res.status(500).json({ message: 'Failed to upload story media' });
  }
});

// Delete profile or cover photo
router.delete('/:type', authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['profile', 'cover'];
    if (!validTypes.includes(type)) return res.status(400).json({ message: 'Invalid image type' });

    const user = await User.findById(req.user._id);
    const field = type === 'profile' ? 'profilePicture' : 'coverPhoto';
    const currentImage = user[field];
    if (!currentImage) return res.status(400).json({ message: 'No image to delete' });

    const filePath = path.join(__dirname, '../', currentImage);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { [field]: '' },
      { new: true }
    ).select('-password');

    res.json({ message: 'Image deleted successfully', user: updatedUser });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

module.exports = router;
