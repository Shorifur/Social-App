// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    maxlength: [20, 'Username cannot be more than 20 characters']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  phone: { type: String, trim: true, default: '' },
  gender: { type: String, trim: true, default: '' },
  bio: { type: String, maxlength: 150, default: '' },
  profilePicture: { type: String, default: '' },
  coverPhoto: { type: String, default: '' },

  // Followers / Following
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },

  // Password reset & verification
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isVerified: { type: Boolean, default: false },
  verificationToken: String,

  // Privacy settings
  privacySettings: {
    profile: { type: String, enum: ['public', 'private'], default: 'public' },
    messages: { type: String, enum: ['everyone', 'followers', 'none'], default: 'followers' }
  }
}, { timestamps: true });

/* ------------------- Password Encryption ------------------- */
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ------------------- JWT Methods ------------------- */
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* ------------------- Password Reset ------------------- */
UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto.createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

/* ------------------- Follower / Following Methods ------------------- */
// Check if following another user
UserSchema.methods.isFollowing = function(userId) {
  return this.following.includes(userId);
};

// Follow a user
UserSchema.methods.follow = function(userId) {
  if (!this.following.includes(userId)) {
    this.following.push(userId);
    this.followingCount = this.following.length;
  }
  return this.save();
};

// Unfollow a user
UserSchema.methods.unfollow = function(userId) {
  if (this.following.includes(userId)) {
    this.following = this.following.filter(id => id.toString() !== userId.toString());
    this.followingCount = this.following.length;
  }
  return this.save();
};

// Add follower
UserSchema.methods.addFollower = function(userId) {
  if (!this.followers.includes(userId)) {
    this.followers.push(userId);
    this.followerCount = this.followers.length;
  }
  return this.save();
};

// Remove follower
UserSchema.methods.removeFollower = function(userId) {
  if (this.followers.includes(userId)) {
    this.followers = this.followers.filter(id => id.toString() !== userId.toString());
    this.followerCount = this.followers.length;
  }
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
