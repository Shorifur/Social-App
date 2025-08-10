import React, { useState, useEffect } from 'react';
import { addComment, getComments } from '../utils/api';
import { TextField, Button, List, ListItem, Avatar, Typography } from '@mui/material';

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const loadComments = async () => {
      const data = await getComments(postId);
      setComments(data);
    };
    loadComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    const newComment = await addComment(postId, text);
    setComments([...comments, newComment]);
    setText('');
  };

  return (
    <div>
      <List>
        {comments.map((comment) => (
          <ListItem key={comment._id}>
            <Avatar>{comment.user.username[0]}</Avatar>
            <div>
              <Typography fontWeight="bold">{comment.user.username}</Typography>
              <Typography>{comment.text}</Typography>
            </div>
          </ListItem>
        ))}
      </List>
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
        />
        <Button type="submit" variant="contained" sx={{ mt: 1 }}>
          Post
        </Button>
      </form>
    </div>
  );
}