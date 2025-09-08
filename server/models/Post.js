// server/models/Post.js
const mongoose = require('mongoose');

// ===============================
// Reaction Schema
// ===============================
const ReactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry', 'dislike'],
    required: true
  },
  reactedAt: {
    type: Date,
    default: Date.now
  }
});

// ===============================
// Post Schema
// ===============================
const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: [{
    url: { type: String, required: true },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'gif'],
      required: true
    }
  }],
  // Reactions
  reactions: [ReactionSchema],
  reactionCounts: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    haha: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 }
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  shares: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    name: String
  },
  privacy: {
    type: String,
    enum: ['public', 'friends', 'only_me'],
    default: 'public'
  },
  feeling: String,
  activity: String,
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===============================
// Indexes
// ===============================
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ 'reactions.userId': 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ location: '2dsphere' });

// ===============================
// Virtuals
// ===============================
PostSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});
PostSchema.virtual('shareCount').get(function () {
  return this.shares.length;
});
PostSchema.virtual('likeCount').get(function () {
  // All positive reactions (exclude dislike)
  return this.reactions.filter(r => r.type !== 'dislike').length;
});

// ===============================
// Pre-save hook - update reaction counts
// ===============================
PostSchema.pre('save', function (next) {
  this.reactionCounts = {
    like: this.reactions.filter(r => r.type === 'like').length,
    love: this.reactions.filter(r => r.type === 'love').length,
    haha: this.reactions.filter(r => r.type === 'haha').length,
    wow: this.reactions.filter(r => r.type === 'wow').length,
    sad: this.reactions.filter(r => r.type === 'sad').length,
    angry: this.reactions.filter(r => r.type === 'angry').length,
    dislike: this.reactions.filter(r => r.type === 'dislike').length
  };
  next();
});

// ===============================
// Static Methods
// ===============================
PostSchema.statics.getFeedPosts = async function (userId, page = 1, limit = 10) {
  try {
    const user = await mongoose.model('User').findById(userId).select('following');
    const followingIds = user.following || [];
    followingIds.push(userId);

    const skip = (page - 1) * limit;

    const posts = await this.find({
      author: { $in: followingIds },
      privacy: { $in: ['public', 'friends'] }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username profilePicture firstName lastName')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username profilePicture' },
        options: { limit: 2 }
      });

    return posts;
  } catch (error) {
    throw error;
  }
};

PostSchema.statics.getUserPosts = async function (userId, currentUserId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    let privacyFilter = ['public'];

    if (userId.toString() === currentUserId.toString()) {
      privacyFilter = ['public', 'friends', 'only_me'];
    } else {
      const currentUser = await mongoose.model('User').findById(currentUserId);
      if (currentUser.following.includes(userId)) {
        privacyFilter = ['public', 'friends'];
      }
    }

    const posts = await this.find({
      author: userId,
      privacy: { $in: privacyFilter }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username profilePicture firstName lastName')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username profilePicture' },
        options: { limit: 2 }
      });

    return posts;
  } catch (error) {
    throw error;
  }
};

// ===============================
// Instance Methods
// ===============================
PostSchema.methods.addReaction = function (userId, reactionType) {
  const existingReactionIndex = this.reactions.findIndex(
    r => r.userId.toString() === userId.toString()
  );

  if (existingReactionIndex !== -1) {
    this.reactions[existingReactionIndex].type = reactionType;
    this.reactions[existingReactionIndex].reactedAt = new Date();
  } else {
    this.reactions.push({ userId, type: reactionType });
  }
  return this.save();
};

PostSchema.methods.removeReaction = function (userId) {
  this.reactions = this.reactions.filter(
    r => r.userId.toString() !== userId.toString()
  );
  return this.save();
};

PostSchema.methods.getUserReaction = function (userId) {
  const reaction = this.reactions.find(
    r => r.userId.toString() === userId.toString()
  );
  return reaction ? reaction.type : null;
};

module.exports = mongoose.model('Post', PostSchema);
