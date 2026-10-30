'use client';

import React, { useRef } from 'react';
import styles from '../admin.module.css';

interface AdminImageUploaderProps {
  label: string;
  value?: string | null;
  uploading: boolean;
  uploadPrompt?: string;
  readyText?: string;
  onFileSelect: (file: File) => void;
  accept?: string;
}

export default function AdminImageUploader({
  label,
  value,
  uploading,
  uploadPrompt = 'Supports WebP, PNG, JPG (automatically uploaded to Cloudinary)',
  readyText = 'Image Ready',
  onFileSelect,
  accept = 'image/*',
}: AdminImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset input so re-uploading the same file works
      e.target.value = '';
    }
  };

  return (
    <div className={styles.formGroup} style={{ marginBottom: 20 }}>
      <label className={styles.formLabel}>{label}</label>
      <div className={styles.dropzoneContainer} onClick={handleClick}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className={styles.hiddenFileInput}
          onChange={handleChange}
        />

        {uploading ? (
          <div className={styles.dropzonePrompt}>Uploading to media storage...</div>
        ) : value ? (
          <div className={styles.dropzonePreview}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className={styles.dropzoneImg} />
            <div className={styles.dropzoneInfo}>
              <div className={styles.dropzoneFileName}>{readyText}</div>
              <div className={styles.dropzoneStatus}>Click to replace with another image</div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
              Click to upload image
            </div>
            <div className={styles.dropzonePrompt}>{uploadPrompt}</div>
          </div>
        )}
      </div>
    </div>
  );
}

