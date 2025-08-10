import React, { useState } from 'react';
import { useStories } from '../features/stories/useStories';
import { uploadMedia, validateFile } from '../utils/uploadUtils';
import { Button, CircularProgress, Snackbar } from '@mui/material';

export default function StoryForm() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { createStory, loading, error } = useStories();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    try {
      validateFile(selectedFile);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const mediaUrl = await uploadMedia(file);
      await createStory({
        mediaUrl,
        userId: JSON.parse(localStorage.getItem('user'))._id
      });
      // Reset after successful submission
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error('Story creation failed:', err);
    }
  };

  return (
    <div className="story-form">
      <input
        type="file"
        id="story-upload"
        onChange={handleFileChange}
        accept="image/jpeg,image/png,video/mp4"
        hidden
      />
      <label htmlFor="story-upload">
        <Button variant="contained" component="span">
          Select Media
        </Button>
      </label>
      
      {preview && (
        <div className="preview-container">
          {file.type.startsWith('image/') ? (
            <img src={preview} alt="Preview" className="media-preview" />
          ) : (
            <video controls className="media-preview">
              <source src={preview} type={file.type} />
            </video>
          )}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Post Story
          </Button>
          {uploadProgress > 0 && (
            <progress value={uploadProgress} max="100" />
          )}
        </div>
      )}
    </div>
  );
}