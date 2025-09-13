// client/src/components/CreatePost.js
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from '../api/axios';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Handle new image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter((file) => file.type.startsWith('image/'));
    if (validImages.length === 0) return;
    setImages((prev) => [...prev, ...validImages]);
  };

  // Remove a specific image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content);
      images.forEach((img) => formData.append('images', img));

      const response = await axios.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        // Reset state
        setContent('');
        setImages([]);
        if (onPostCreated) {
          onPostCreated(response.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-card">
      <div className="post-header">
        <img
          src={user?.profilePicture || '/default-avatar.jpg'}
          alt={user?.firstName}
          className="user-avatar"
        />
        <div className="user-info">
          <h4>{user?.firstName} {user?.lastName}</h4>
          <p>What’s on your mind?</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="post-form">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something with your community..."
          maxLength={1000}
          rows={3}
          disabled={loading}
        />

        {/* Image previews */}
        {images.length > 0 && (
          <div className="image-preview-container">
            {images.map((img, index) => (
              <div key={index} className="image-preview">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`Preview ${index}`}
                  className="preview-image"
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => removeImage(index)}
                  disabled={loading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="post-actions">
          <div className="action-buttons">
            <label htmlFor="image-upload" className="file-input-label">
              📷 Add Photos
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="file-input"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || (!content.trim() && images.length === 0)}
            className="post-button"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
