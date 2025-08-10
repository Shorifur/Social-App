import express from 'express';
import Story from '../../models/Story';
import auth from '../../middleware/auth';
import { body } from 'express-validator';

const router = express.Router();

// [POST] /api/stories/:id/reaction - Add reaction
router.post('/:id/reaction', auth, [
  body('type').isIn(['like', 'love', 'laugh']).withMessage('Invalid reaction type')
], async (req, res) => {
  const story = await Story.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { reactions: { 
      userId: req.user.id, 
      type: req.body.type 
    }}},
    { new: true }
  );
  res.json(story);
});

// [GET] /api/stories/trending - Trending stories
router.get('/trending', async (req, res) => {
  const stories = await Story.aggregate([
    { $addFields: { viewCount: { $size: "$viewers" } } },
    { $sort: { viewCount: -1 } },
    { $limit: 10 }
  ]);
  res.json(stories);
});

export default router;