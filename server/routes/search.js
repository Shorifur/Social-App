// server/routes/search.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SearchService = require('../services/searchService');
const User = require('../models/User');
const Post = require('../models/Post');

// ===============================
// Global search
// ===============================
router.get('/', auth, async (req, res) => {
  try {
    const { q: query, page = 1, limit = 20, type = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let result;
    if (type === 'all') {
      result = await SearchService.globalSearch(query, parseInt(page), parseInt(limit));
    } else {
      result = await SearchService.advancedSearch(
        { query, type, ...req.query },
        parseInt(page),
        parseInt(limit)
      );
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===============================
// Advanced search
// ===============================
router.get('/advanced', auth, async (req, res) => {
  try {
    const {
      q: query,
      type = 'all',
      sortBy = 'relevance',
      timeRange,
      author,
      tags,
      minLikes,
      maxLikes,
      page = 1,
      limit = 20
    } = req.query;

    const result = await SearchService.advancedSearch(
      {
        query,
        type,
        sortBy,
        timeRange,
        author,
        tags: tags ? tags.split(',') : [],
        minLikes: minLikes ? parseInt(minLikes) : undefined,
        maxLikes: maxLikes ? parseInt(maxLikes) : undefined
      },
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===============================
// Search suggestions
// ===============================
router.get('/suggestions', auth, async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    // User suggestions
    const userSuggestions = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { 'profile.firstName': { $regex: query, $options: 'i' } },
        { 'profile.lastName': { $regex: query, $options: 'i' } }
      ],
      isActive: true
    })
      .select('username profilePicture profile.firstName profile.lastName')
      .limit(5);

    // Tag suggestions
    const tagSuggestions = await Post.distinct('tags', {
      tags: { $regex: query, $options: 'i' }
    });

    res.json({
      success: true,
      suggestions: {
        users: userSuggestions,
        tags: tagSuggestions.slice(0, 5) // ensure only 5 max
      }
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
