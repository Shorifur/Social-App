import React, { useState, useContext, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Avatar,
  Box,
  Divider,
  TextField,
  Button
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatDistanceToNow } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import socket from '../utils/socket';

function Post({ post }) {
  const { user } = useContext(AuthContext);
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLike = () => {
    setLikes(isLiked ? likes - 1 : likes + 1);
    setIsLiked(!isLiked);

    // Emit the like event to the server
    socket.emit('like-post', { postId: post._id, userId: user._id });
  };

  const handleComment = () => {
    if (!commentText.trim()) return;

    // 🔔 Emit a notification to the post author
    socket.emit('send-notification', {
      userId: post.user._id, // author of the post
      message: `${user.username} commented on your post`
    });

    // TODO: Call backend API to save comment
    setCommentText('');
  };

  useEffect(() => {
    socket.on('post-liked', ({ postId, likesCount }) => {
      if (postId === post._id) {
        setLikes(likesCount);
      }
    });

    return () => {
      socket.off('post-liked');
    };
  }, [post._id]);

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardHeader
        avatar={<Avatar src={post.user.avatar || '/default-avatar.png'} />}
        title={post.user.username}
        subheader={formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        action={<IconButton><MoreVertIcon /></IconButton>}
        sx={{ pb: 0 }}
      />

      <CardMedia
        component="img"
        height="500"
        image={post.image || '/placeholder.jpg'}
        sx={{
          borderRadius: '15px',
          m: 2,
          boxShadow: '4px 4px 8px #ccc, -4px -4px 8px #fff',
        }}
      />

      <CardContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {post.content}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <motion.span
            onClick={handleLike}
            whileTap={{ scale: 1.5 }}
            animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
            style={{ display: 'inline-block', cursor: 'pointer' }}
          >
            <FavoriteIcon color={isLiked ? 'error' : 'disabled'} />
          </motion.span>
          <Typography>{likes}</Typography>
          <IconButton>
            <CommentIcon />
          </IconButton>
          <Typography>{post.comments?.length || 0}</Typography>
        </Box>

        {/* Comment Input Box */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button variant="contained" onClick={handleComment}>Send</Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Post;
