'use client';

import React from 'react';
import styles from '../../admin.module.css';

interface EditMediaModalProps {
  editingMedia: any;
  setEditingMedia: (media: any) => void;
  editMediaUploading: boolean;
  editMediaPreview: string | null;
  editMediaFileInputRef: React.RefObject<HTMLInputElement>;
  handleEditFileUpload: (file: File, target: 'show' | 'media') => void;
  handleUpdateMedia: (e: React.FormEvent) => void;
}

export default function EditMediaModal({
  editingMedia,
  setEditingMedia,
  editMediaUploading,
  editMediaPreview,
  editMediaFileInputRef,
  handleEditFileUpload,
  handleUpdateMedia,
}: EditMediaModalProps) {
  if (!editingMedia) return null;

  return (
    <div className={styles.modalBackdrop} onClick={() => setEditingMedia(null)} data-lenis-prevent="true">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Edit Media Archive</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#86868b' }}>
              Updating gallery: <strong style={{ color: '#ffffff' }}>{editingMedia.name}</strong>
            </p>
          </div>
          <button
            className={styles.modalCloseBtn}
            onClick={() => setEditingMedia(null)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleUpdateMedia}>
          {/* Direct Thumbnail Upload */}
          <div className={styles.formGroup} style={{ marginBottom: 20 }}>
            <label className={styles.formLabel}>Gallery Thumbnail (Click to Replace via Cloudinary)</label>
            <div
              className={styles.dropzoneContainer}
              onClick={() => editMediaFileInputRef.current?.click()}
            >
              <input
                ref={editMediaFileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenFileInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleEditFileUpload(file, 'media');
                }}
              />

              {editMediaUploading ? (
                <div className={styles.dropzonePrompt}>Uploading new thumbnail to Cloudinary...</div>
              ) : editMediaPreview || editingMedia.thumbnail_url ? (
                <div className={styles.dropzonePreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editMediaPreview || editingMedia.thumbnail_url}
                    alt="Thumbnail preview"
                    className={styles.dropzoneImg}
                  />
                  <div className={styles.dropzoneInfo}>
                    <div className={styles.dropzoneFileName}>Thumbnail Ready</div>
                    <div className={styles.dropzoneStatus}>Click to replace image file</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                    Click to upload gallery thumbnail
                  </div>
                  <div className={styles.dropzonePrompt}>
                    Instant upload to Cloudinary media storage
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Show / Artist Title *</label>
              <input
                type="text"
                className={styles.formInput}
                value={editingMedia.name}
                onChange={(e) => setEditingMedia({ ...editingMedia, name: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Date & Venue String *</label>
              <input
                type="text"
                className={styles.formInput}
                value={editingMedia.date}
                onChange={(e) => setEditingMedia({ ...editingMedia, date: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label className={styles.formLabel}>Facebook Album URL *</label>
              <input
                type="url"
                className={styles.formInput}
                value={editingMedia.facebook_url}
                onChange={(e) => setEditingMedia({ ...editingMedia, facebook_url: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 16 }}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setEditingMedia(null)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
