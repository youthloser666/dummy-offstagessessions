'use client';

import React from 'react';
import type { MediaFormDraft } from '../../../types';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';
import { AdminImageUploader } from '../../shared/AdminImageUploader';

interface MediaCreateDrawerProps {
  draft: MediaFormDraft;
  isUploadingThumbnail: boolean;
  thumbnailPreviewUrl: string | null;
  onChange: (updatedDraft: MediaFormDraft) => void;
  onUploadThumbnail: (file: File) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}

export function MediaCreateDrawer({
  draft,
  isUploadingThumbnail,
  thumbnailPreviewUrl,
  onChange,
  onUploadThumbnail,
  onSubmit,
  onCancel,
}: MediaCreateDrawerProps) {
  return (
    <div className={`${shellStyles.card} ${overviewStyles.drawerCardSpaced}`}>
      <div className={shellStyles.cardHeader}>
        <div>
          <h3 className={shellStyles.cardTitle}>Publish New Media Gallery</h3>
          <p className={shellStyles.cardSubtitle}>
            Archive photography albums or video recap links cleanly
          </p>
        </div>

        <button type="button" className={shellStyles.btnSecondary} onClick={onCancel}>
          Close
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
              placeholder="e.g. Warehouse Recap — July 2026"
              value={draft.name}
              onChange={(event) => onChange({ ...draft, name: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Event Date *</label>
            <input
              type="text"
              required
              className={shellStyles.formInput}
              placeholder="e.g. July 18, 2026"
              value={draft.date}
              onChange={(event) => onChange({ ...draft, date: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Media Type</label>
            <select
              className={shellStyles.formSelect}
              value={draft.category}
              onChange={(event) => onChange({ ...draft, category: event.target.value })}
            >
              <option value="photo">Photo Album</option>
              <option value="video">Video Recap</option>
            </select>
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Facebook / External Gallery Link *</label>
            <input
              type="url"
              required
              className={shellStyles.formInput}
              placeholder="https://www.facebook.com/..."
              value={draft.facebook_url}
              onChange={(event) => onChange({ ...draft, facebook_url: event.target.value })}
            />
          </div>
        </div>

        <div className={shellStyles.formGroup}>
          <label className={shellStyles.formLabel}>Gallery Cover Thumbnail *</label>
          <AdminImageUploader
            previewUrl={thumbnailPreviewUrl || draft.thumbnail_url || null}
            isUploading={isUploadingThumbnail}
            onFileSelect={onUploadThumbnail}
            emptyTitle="Click or drag cover thumbnail here"
            emptySubtitle="PNG, JPG, WEBP auto-optimized for Media Grid"
            uploadedStatusText="Thumbnail uploaded & ready"
            previewAlt="Media thumbnail preview"
          />
        </div>

        <div className={shellStyles.formGroup}>
          <label className={shellStyles.formLabel}>Or Paste Thumbnail URL</label>
          <input
            type="text"
            className={shellStyles.formInput}
            placeholder="https://..."
            value={draft.thumbnail_url}
            onChange={(event) => onChange({ ...draft, thumbnail_url: event.target.value })}
          />
        </div>

        <div className={shellStyles.modalFooter}>
          <button type="button" className={shellStyles.btnSecondary} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className={shellStyles.btnPrimary} disabled={isUploadingThumbnail}>
            {isUploadingThumbnail ? 'Uploading Thumbnail...' : 'Publish Media Item'}
          </button>
        </div>
      </form>
    </div>
  );
}

