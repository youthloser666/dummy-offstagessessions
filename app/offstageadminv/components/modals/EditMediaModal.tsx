'use client';

import React from 'react';
import type { MediaEditDraft } from '../../types';
import shellStyles from '../../styles/adminShell.module.css';
import { AdminImageUploader } from '../shared/AdminImageUploader';

interface EditMediaModalProps {
  editingMedia: MediaEditDraft | null;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (updatedMedia: MediaEditDraft) => void;
  onUploadThumbnail: (file: File) => void;
  isUploadingThumbnail: boolean;
  thumbnailPreviewUrl: string | null;
}

export function EditMediaModal({
  editingMedia,
  onClose,
  onSubmit,
  onChange,
  onUploadThumbnail,
  isUploadingThumbnail,
  thumbnailPreviewUrl,
}: EditMediaModalProps) {
  if (!editingMedia) {
    return null;
  }

  return (
    <div
      className={shellStyles.modalBackdrop}
      data-lenis-prevent="true"
      onClick={onClose}
    >
      <div
        className={shellStyles.modalContent}
        data-lenis-prevent="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={shellStyles.modalHeader}>
          <h3 className={shellStyles.modalTitle}>Edit Media Archive</h3>
          <button
            type="button"
            className={shellStyles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className={shellStyles.formGrid2}>
            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Gallery / Recap Name *</label>
              <input
                type="text"
                required
                className={shellStyles.formInput}
                value={editingMedia.name}
                onChange={(event) => onChange({ ...editingMedia, name: event.target.value })}
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Event Date *</label>
              <input
                type="text"
                required
                className={shellStyles.formInput}
                value={editingMedia.date}
                onChange={(event) => onChange({ ...editingMedia, date: event.target.value })}
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Category</label>
              <select
                className={shellStyles.formSelect}
                value={editingMedia.category}
                onChange={(event) => onChange({ ...editingMedia, category: event.target.value })}
              >
                <option value="photo">Photo Album</option>
                <option value="video">Video Recap</option>
              </select>
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Display Order</label>
              <input
                type="number"
                className={shellStyles.formInput}
                value={editingMedia.display_order ?? 0}
                onChange={(event) =>
                  onChange({
                    ...editingMedia,
                    display_order: Number.parseInt(event.target.value, 10) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Facebook / Gallery Link URL *</label>
            <input
              type="url"
              required
              className={shellStyles.formInput}
              value={editingMedia.facebook_url}
              onChange={(event) => onChange({ ...editingMedia, facebook_url: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Thumbnail Image</label>
            <AdminImageUploader
              previewUrl={thumbnailPreviewUrl || editingMedia.thumbnail_url || null}
              isUploading={isUploadingThumbnail}
              onFileSelect={onUploadThumbnail}
              emptyTitle="Click to replace thumbnail"
              emptySubtitle="PNG, JPG, WEBP auto-converted"
              uploadedStatusText="Thumbnail ready"
              previewAlt="Thumbnail preview"
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Or Thumbnail Image URL</label>
            <input
              type="text"
              className={shellStyles.formInput}
              placeholder="https://..."
              value={editingMedia.thumbnail_url}
              onChange={(event) =>
                onChange({ ...editingMedia, thumbnail_url: event.target.value })
              }
            />
          </div>

          <div className={shellStyles.modalFooter}>
            <button type="button" className={shellStyles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={shellStyles.btnPrimary}
              disabled={isUploadingThumbnail}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
