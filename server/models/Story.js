const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  mediaUrl: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: { expires: '24h' } // Auto-delete after 24 hours
  },
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Add TTL index for automatic expiration
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Story', storySchema);