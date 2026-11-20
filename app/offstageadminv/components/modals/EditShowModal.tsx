'use client';

import React from 'react';
import type { ShowEditDraft } from '../../types';
import overviewStyles from '../../styles/adminOverview.module.css';
import shellStyles from '../../styles/adminShell.module.css';
import { AdminImageUploader } from '../shared/AdminImageUploader';

interface EditShowModalProps {
  editingShow: ShowEditDraft | null;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (updatedShow: ShowEditDraft) => void;
  onUploadPoster: (file: File) => void;
  isUploadingPoster: boolean;
  posterPreviewUrl: string | null;
}

export function EditShowModal({
  editingShow,
  onClose,
  onSubmit,
  onChange,
  onUploadPoster,
  isUploadingPoster,
  posterPreviewUrl,
}: EditShowModalProps) {
  if (!editingShow) {
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
          <h3 className={shellStyles.modalTitle}>Edit Event / Session</h3>
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
              <label className={shellStyles.formLabel}>Event Name *</label>
              <input
                type="text"
                required
                className={shellStyles.formInput}
                value={editingShow.name}
                onChange={(event) => onChange({ ...editingShow, name: event.target.value })}
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Lineup / Subtitle</label>
              <input
                type="text"
                className={shellStyles.formInput}
                value={editingShow.subtitle}
                onChange={(event) => onChange({ ...editingShow, subtitle: event.target.value })}
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Date Code</label>
              <input
                type="text"
                className={shellStyles.formInput}
                value={editingShow.date_code}
                onChange={(event) => onChange({ ...editingShow, date_code: event.target.value })}
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Date Formatted</label>
              <input
                type="text"
                className={shellStyles.formInput}
                value={editingShow.date_formatted}
                onChange={(event) =>
                  onChange({ ...editingShow, date_formatted: event.target.value })
                }
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Event Calendar Date</label>
              <input
                type="date"
                className={shellStyles.formInput}
                value={editingShow.event_date}
                onChange={(event) => onChange({ ...editingShow, event_date: event.target.value })}
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Month Group</label>
              <input
                type="text"
                className={shellStyles.formInput}
                value={editingShow.month}
                onChange={(event) => onChange({ ...editingShow, month: event.target.value })}
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Venue *</label>
              <input
                type="text"
                required
                className={shellStyles.formInput}
                value={editingShow.venue}
                onChange={(event) => onChange({ ...editingShow, venue: event.target.value })}
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Time</label>
              <input
                type="text"
                className={shellStyles.formInput}
                value={editingShow.time}
                onChange={(event) => onChange({ ...editingShow, time: event.target.value })}
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Posh Ticket URL</label>
              <input
                type="url"
                className={shellStyles.formInput}
                value={editingShow.posh_url}
                onChange={(event) => onChange({ ...editingShow, posh_url: event.target.value })}
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Tags (comma separated)</label>
              <input
                type="text"
                className={shellStyles.formInput}
                value={editingShow.tags}
                onChange={(event) => onChange({ ...editingShow, tags: event.target.value })}
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Status</label>
              <select
                className={shellStyles.formSelect}
                value={editingShow.status}
                onChange={(event) => onChange({ ...editingShow, status: event.target.value })}
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>

            <div className={`${shellStyles.formGroup} ${overviewStyles.rowGapMd}`}>
              <label className={shellStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={editingShow.featured}
                  onChange={(event) =>
                    onChange({ ...editingShow, featured: event.target.checked })
                  }
                />
                <span>Featured Show</span>
              </label>
            </div>
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Event Poster Image</label>
            <AdminImageUploader
              previewUrl={posterPreviewUrl || editingShow.poster_url || null}
              isUploading={isUploadingPoster}
              onFileSelect={onUploadPoster}
              emptyTitle="Click to replace poster"
              emptySubtitle="WebP auto-optimization enabled"
              uploadedStatusText="Poster ready"
              previewAlt="Poster preview"
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Or Poster Image URL</label>
            <input
              type="text"
              className={shellStyles.formInput}
              placeholder="https://..."
              value={editingShow.poster_url}
              onChange={(event) => onChange({ ...editingShow, poster_url: event.target.value })}
            />
          </div>

          <div className={shellStyles.modalFooter}>
            <button type="button" className={shellStyles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={shellStyles.btnPrimary} disabled={isUploadingPoster}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
