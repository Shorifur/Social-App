// client/src/components/CommentSection.js
import React, { useState, useEffect } from 'react';
import { addComment, getComments } from '../utils/api';
import { TextField, Button, List, ListItem, Avatar, Typography, CircularProgress, Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  // Load comments when postId changes
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const data = await getComments(postId);
        setComments(data);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoading(false);
      }
    };
    if (postId) {
      loadComments();
    }
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const newComment = await addComment(postId, text);
      setComments((prev) => [...prev, newComment]);
      setText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Comment List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List>
          {comments.map((comment) => (
            <ListItem key={comment._id} alignItems="flex-start">
              <Avatar src={comment.user?.profilePicture || '/default-avatar.jpg'}>
                {comment.user?.username?.[0] || 'U'}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {comment.user?.username || 'Unknown'}
                </Typography>
                <Typography variant="body2">{comment.text}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(comment.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          size="small"
          disabled={submitting}
        />
        <Button
          type="submit"
          variant="contained"
          size="small"
          sx={{ mt: 1 }}
          disabled={submitting || !text.trim()}
        >
          {submitting ? 'Posting...' : 'Post'}
        </Button>
      </form>
    </Box>
  );
}
