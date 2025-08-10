
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function PostComposer() {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {'image/*': ['.png', '.jpg', '.jpeg'], 'video/*': ['.mp4']},
    onDrop: acceptedFiles => setFiles(acceptedFiles)
  });

  return (
    <div className="composer">
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
      />
      
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag media here or click to select</p>
      </div>

      {files.map(file => (
        <MediaPreview key={file.name} file={file} />
      ))}
    </div>
  );
}