// server/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// === Storage Configurations ===

// Stories
const storyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const storyDir = path.join(uploadDir, 'stories');
    if (!fs.existsSync(storyDir)) {
      fs.mkdirSync(storyDir, { recursive: true });
    }
    cb(null, storyDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `story-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Posts
const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const postDir = path.join(uploadDir, 'posts');
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    cb(null, postDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `post-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Profiles
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const profileDir = path.join(uploadDir, 'profiles');
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }
    cb(null, profileDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// === File Filters ===
const imageOrVideoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image or video files are allowed'), false);
  }
};

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// === Multer Instances ===
const uploadStory = multer({
  storage: storyStorage,
  fileFilter: imageOrVideoFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const uploadPost = multer({
  storage: postStorage,
  fileFilter: imageOrVideoFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// === Export Middlewares ===
module.exports = {
  uploadSingleStory: uploadStory.single('media'),
  uploadSinglePost: uploadPost.single('media'),
  uploadMultiplePosts: uploadPost.array('media', 10),
  uploadProfilePicture: uploadProfile.single('profilePicture'),

  handleUploadError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Check the limits.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ success: false, message: 'Too many files uploaded.' });
      }
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  },
};
