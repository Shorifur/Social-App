import axios from 'axios';
//import api from '../utils/api';
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button, TextField, Container } from '@mui/material';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/posts', { content, userId: user._id });
      setContent('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <TextField
          multiline
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
        />
        <Button type="submit">Post</Button>
      </form>
    </Container>
  );
}