// In server/models/Share.js
const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true,
    maxlength: 500
  },
  audience: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }
}, {
  timestamps: true
});

// Index for better performance
ShareSchema.index({ post: 1, user: 1 });
ShareSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Share', ShareSchema);