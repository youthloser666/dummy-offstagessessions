'use client';

import React, { useRef, useState } from 'react';
import shellStyles from '../../styles/adminShell.module.css';

interface AdminImageUploaderProps {
  previewUrl: string | null;
  isUploading: boolean;
  onFileSelect: (file: File) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  uploadedStatusText?: string;
  previewAlt?: string;
}

export function AdminImageUploader({
  previewUrl,
  isUploading,
  onFileSelect,
  emptyTitle = 'Click or drag image to upload',
  emptySubtitle = 'PNG, JPG, WEBP — automatically converted & optimized',
  uploadedStatusText = 'Image uploaded & ready',
  previewAlt = 'Uploaded preview',
}: AdminImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleOpenPicker = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenPicker();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
      event.target.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    if (isUploading) {
      return;
    }
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${shellStyles.dropzoneContainer} ${
        isDragActive ? shellStyles.dropzoneActive : ''
      }`}
      onClick={handleOpenPicker}
      onKeyDown={handleKeyDown}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={shellStyles.hiddenFileInput}
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {isUploading ? (
        <div className={shellStyles.dropzonePrompt}>
          <strong>Uploading &amp; Converting to WebP...</strong>
          <span>Please wait cleanly</span>
        </div>
      ) : previewUrl ? (
        <div className={shellStyles.dropzonePreview}>
          <img src={previewUrl} alt={previewAlt} className={shellStyles.dropzoneImg} />
          <div className={shellStyles.dropzoneInfo}>
            <span className={shellStyles.dropzoneFileName}>{uploadedStatusText}</span>
            <span className={shellStyles.dropzoneStatus}>Click anywhere to replace</span>
          </div>
        </div>
      ) : (
        <div className={shellStyles.dropzonePrompt}>
          <strong className={shellStyles.dropzoneEmptyTitle}>{emptyTitle}</strong>
          <span>{emptySubtitle}</span>
        </div>
      )}
    </div>
  );
}

