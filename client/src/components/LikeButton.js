import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { likePost } from '../utils/api';

const LikeButton = ({ postId, initialLikes }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    try {
      await likePost(postId);
      setLikes(isLiked ? likes - 1 : likes + 1);
      setIsLiked(!isLiked);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.span
      onClick={handleLike}
      whileTap={{ scale: 1.5 }}
      animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
      style={{ cursor: 'pointer', display: 'inline-block' }}
    >
      <FavoriteIcon color={isLiked ? 'error' : 'inherit'} />
      <span style={{ marginLeft: '8px' }}>{likes}</span>
    </motion.span>
  );
};

export default LikeButton;
