'use client';

import React from 'react';
import styles from '../../admin.module.css';
import AdminImageUploader from '../AdminImageUploader';

interface EditShowModalProps {
  editingShow: any;
  setEditingShow: (show: any) => void;
  editShowUploading: boolean;
  editShowPreview: string | null;
  editShowFileInputRef?: React.RefObject<HTMLInputElement>;
  handleEditFileUpload: (file: File, target: 'show' | 'media') => void;
  handleUpdateShow: (e: React.FormEvent) => void;
}

export default function EditShowModal({
  editingShow,
  setEditingShow,
  editShowUploading,
  editShowPreview,
  handleEditFileUpload,
  handleUpdateShow,
}: EditShowModalProps) {
  if (!editingShow) return null;

  return (
    <div className={styles.modalBackdrop} onClick={() => setEditingShow(null)} data-lenis-prevent="true">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Edit Show Details</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#86868b' }}>
              Updating event: <strong style={{ color: '#ffffff' }}>{editingShow.name}</strong>
            </p>
          </div>
          <button
            className={styles.modalCloseBtn}
            onClick={() => setEditingShow(null)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleUpdateShow}>
          <AdminImageUploader
            label="Event Poster (Click to Replace via Cloudinary)"
            value={editShowPreview || editingShow.poster_url}
            uploading={editShowUploading}
            readyText="Poster Ready"
            uploadPrompt="Supports WebP, PNG, JPG (automatically uploaded to Cloudinary)"
            onFileSelect={(file) => handleEditFileUpload(file, 'show')}
          />

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Artist / Event Title *</label>
              <input
                type="text"
                className={styles.formInput}
                value={editingShow.name}
                onChange={(e) => setEditingShow({ ...editingShow, name: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Subtitle / Tagline</label>
              <input
                type="text"
                className={styles.formInput}
                value={editingShow.subtitle}
                onChange={(e) => setEditingShow({ ...editingShow, subtitle: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Venue *</label>
              <input
                type="text"
                className={styles.formInput}
                value={editingShow.venue}
                onChange={(e) => setEditingShow({ ...editingShow, venue: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Time</label>
              <input
                type="text"
                className={styles.formInput}
                value={editingShow.time}
                onChange={(e) => setEditingShow({ ...editingShow, time: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Date Code (e.g. 07.25)</label>
              <input
                type="text"
                className={styles.formInput}
                value={editingShow.date_code}
                onChange={(e) => setEditingShow({ ...editingShow, date_code: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Date Formatted (e.g. Fri Aug 25)</label>
              <input
                type="text"
                className={styles.formInput}
                value={editingShow.date_formatted}
                onChange={(e) => setEditingShow({ ...editingShow, date_formatted: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ticket / Event URL</label>
              <input
                type="url"
                className={styles.formInput}
                placeholder="https://... (e.g. Eventbrite, Posh, RA, etc.)"
                value={editingShow.posh_url}
                onChange={(e) => setEditingShow({ ...editingShow, posh_url: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Music Tags (comma-separated)</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="House, Techno, Bass"
                value={editingShow.tags}
                onChange={(e) => setEditingShow({ ...editingShow, tags: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Event Status</label>
              <select
                className={styles.formSelect}
                value={editingShow.status}
                onChange={(e) => setEditingShow({ ...editingShow, status: e.target.value })}
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#a1a1a6', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editingShow.featured}
                onChange={(e) => setEditingShow({ ...editingShow, featured: e.target.checked })}
              />
              Mark as Featured Event
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setEditingShow(null)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
