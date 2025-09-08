// server/models/Story.js
const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true,
    maxlength: 2200
  },
  media: {
    type: String, // URL to image/video
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  duration: {
    type: Number, // in seconds for videos
    default: 5
  },
  viewers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewerCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // auto-expire after 24h
  },
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  hashtags: [String],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// TTL Index for automatic expiration
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Helpful indexes
StorySchema.index({ author: 1, createdAt: -1 });
StorySchema.index({ isActive: 1 });

// Method to check if user has viewed
StorySchema.methods.hasViewed = function(userId) {
  return this.viewers.some(v => v.userId.toString() === userId.toString());
};

// Method to add viewer
StorySchema.methods.addViewer = async function(userId) {
  if (!this.hasViewed(userId)) {
    this.viewers.push({ userId });
    this.viewerCount = this.viewers.length;
    await this.save();
  }
  return this;
};

module.exports = mongoose.model('Story', StorySchema);
