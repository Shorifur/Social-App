import React from 'react';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoodIcon from '@mui/icons-material/Mood';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';

export default function StoryReactions({ storyId }) {
  const handleReaction = async (type) => {
    await axios.post(`/api/stories/${storyId}/reaction`, { type });
  };

  return (
    <div className="reaction-bar">
      <IconButton onClick={() => handleReaction('like')}>
        <FavoriteIcon color="error" />
      </IconButton>
      <IconButton onClick={() => handleReaction('love')}>
        <MoodIcon color="warning" />
      </IconButton>
      <IconButton onClick={() => handleReaction('laugh')}>
        <SentimentSatisfiedIcon color="primary" />
      </IconButton>
    </div>
  );
}