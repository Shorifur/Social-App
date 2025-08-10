import React, { useContext } from 'react';
import { useFormik } from 'formik';
import { 
  Box, 
  TextField, 
  Button, 
  Avatar,
  Paper
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { postSchema } from '../utils/validationSchemas'; // ✅ validation
import { toast } from 'react-toastify'; // ✅ import toast

export default function PostForm({ onPostCreated }) {
  const { user } = useContext(AuthContext);

  const formik = useFormik({
    initialValues: { content: '' },
    validationSchema: postSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const { data } = await api.post('/posts', { content: values.content });
        onPostCreated(data);
        resetForm();

        // ✅ styled success toast
        toast.success('Post created!', {
          style: { background: '#4caf50', color: 'white' }
        });

      } catch (err) {
        console.error('Failed to create post', err);

        // ❌ styled error toast
        toast.error('Failed to create post', {
          style: { background: '#f44336', color: 'white' }
        });
      }
    }
  });

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </Avatar>
          <TextField
            fullWidth
            multiline
            rows={3}
            name="content"
            variant="outlined"
            placeholder="What's on your mind?"
            value={formik.values.content}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.content && Boolean(formik.errors.content)}
            helperText={formik.touched.content && formik.errors.content}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button 
            type="submit" 
            variant="contained"
            disabled={!formik.values.content.trim()}
          >
            Post
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
