// server/routes/social/stories.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const StoryService = require('../../services/storyService');
const { uploadSingleStory, handleUploadError } = require('../../middleware/upload');

/**
 * Create a new story (image/video with optional text, location, hashtags, mentions)
 */
router.post('/', auth, uploadSingleStory, handleUploadError, async (req, res) => {
  try {
    const { content, mediaType, duration, location, hashtags, mentions } = req.body;

    const story = await StoryService.createStory(
      req.user.id,
      req.file?.path, // media file uploaded
      mediaType,
      content,
      duration,
      location ? JSON.parse(location) : null,
      hashtags ? JSON.parse(hashtags) : [],
      mentions ? JSON.parse(mentions) : []
    );

    res.status(201).json({
      success: true,
      story
    });
  } catch (error) {
    console.error('❌ Create story error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get active stories (feed for logged-in user)
 */
router.get('/feed', auth, async (req, res) => {
  try {
    const stories = await StoryService.getActiveStories(req.user.id);
    res.json({
      success: true,
      stories
    });
  } catch (error) {
    console.error('❌ Get feed error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Mark a story as viewed
 */
router.post('/:storyId/view', auth, async (req, res) => {
  try {
    const story = await StoryService.viewStory(req.params.storyId, req.user.id);
    res.json({
      success: true,
      story
    });
  } catch (error) {
    console.error('❌ View story error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get all stories of a specific user
 */
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const stories = await StoryService.getUserStories(req.params.userId);
    res.json({
      success: true,
      stories
    });
  } catch (error) {
    console.error('❌ Get user stories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Delete a story
 */
router.delete('/:storyId', auth, async (req, res) => {
  try {
    await StoryService.deleteStory(req.params.storyId, req.user.id);
    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete story error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get viewers of a story
 */
router.get('/:storyId/viewers', auth, async (req, res) => {
  try {
    const viewers = await StoryService.getStoryViewers(req.params.storyId, req.user.id);
    res.json({
      success: true,
      viewers
    });
  } catch (error) {
    console.error('❌ Get viewers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
