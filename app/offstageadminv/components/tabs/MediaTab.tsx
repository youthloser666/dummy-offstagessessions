'use client';

import React from 'react';
import styles from '../../admin.module.css';
import { MediaItem } from '../../types';

interface MediaTabProps {
  mediaList: MediaItem[];
  loadingMedia: boolean;
  loadMedia: () => void;
  showCreateDrawer: boolean;
  setShowCreateDrawer: (open: boolean) => void;
  newMedia: any;
  setNewMedia: React.Dispatch<React.SetStateAction<any>>;
  mediaUploading: boolean;
  mediaUploadPreview: string | null;
  mediaFileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (file: File, target: 'show' | 'media') => void;
  handleCreateMedia: (e: React.FormEvent) => void;
  openEditMedia: (media: MediaItem) => void;
  handleDeleteMedia: (id: string | number, name: string) => void;
}

export default function MediaTab({
  mediaList,
  loadingMedia,
  loadMedia,
  showCreateDrawer,
  setShowCreateDrawer,
  newMedia,
  setNewMedia,
  mediaUploading,
  mediaUploadPreview,
  mediaFileInputRef,
  handleFileUpload,
  handleCreateMedia,
  openEditMedia,
  handleDeleteMedia,
}: MediaTabProps) {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Media Archives</h1>
          <p className={styles.pageDesc}>
            Manage photo galleries and Facebook album destinations.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={() => loadMedia()}
            disabled={loadingMedia}
            className={styles.btnSecondary}
          >
            {loadingMedia ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowCreateDrawer(!showCreateDrawer)}
            className={styles.btnPrimary}
          >
            {showCreateDrawer ? 'Cancel' : '+ New Gallery'}
          </button>
        </div>
      </div>

      {/* Collapsible New Media Form */}
      {showCreateDrawer && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Add Gallery Archive</h3>
          </div>

          <form onSubmit={handleCreateMedia}>
            {/* Direct Thumbnail Upload */}
            <div className={styles.formGroup} style={{ marginBottom: 20 }}>
              <label className={styles.formLabel}>Gallery Thumbnail (Direct Upload)</label>
              <div
                className={styles.dropzoneContainer}
                onClick={() => mediaFileInputRef.current?.click()}
              >
                <input
                  ref={mediaFileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenFileInput}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'media');
                  }}
                />

                {mediaUploading ? (
                  <div className={styles.dropzonePrompt}>Uploading thumbnail...</div>
                ) : mediaUploadPreview || newMedia.thumbnail_url ? (
                  <div className={styles.dropzonePreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUploadPreview || newMedia.thumbnail_url}
                      alt="Thumbnail preview"
                      className={styles.dropzoneImg}
                    />
                    <div className={styles.dropzoneInfo}>
                      <div className={styles.dropzoneFileName}>Thumbnail Ready</div>
                      <div className={styles.dropzoneStatus}>Click to replace image</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                      Click to upload gallery thumbnail
                    </div>
                    <div className={styles.dropzonePrompt}>
                      Instant preview &amp; upload to media storage
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
                  placeholder="e.g. JACKIE HOLLANDER 6.13"
                  value={newMedia.name}
                  onChange={(e) => setNewMedia({ ...newMedia, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date &amp; Venue String *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. JUNE 13, 2026 · SOUNDSTAGE"
                  value={newMedia.date}
                  onChange={(e) => setNewMedia({ ...newMedia, date: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label className={styles.formLabel}>Facebook Album URL *</label>
                <input
                  type="url"
                  className={styles.formInput}
                  placeholder="https://www.facebook.com/offstagesessions/..."
                  value={newMedia.facebook_url}
                  onChange={(e) => setNewMedia({ ...newMedia, facebook_url: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
              <button type="submit" className={styles.btnPrimary}>
                Save to Archives
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Media Archives Table */}
      <div className={styles.card} style={{ padding: 0 }}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 64 }}>Thumbnail</th>
                <th>Event Title</th>
                <th>Date / Venue</th>
                <th>Destination</th>
                <th style={{ width: 140, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mediaList.map((item, idx) => (
                <tr key={item.id || idx} className={styles.tableRow}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail || item.image || item.thumbnail_url || '/image/jackie_web.webp'}
                      alt={item.name}
                      className={styles.tableThumb}
                    />
                  </td>
                  <td>
                    <div className={styles.tableTitle}>{item.name}</div>
                  </td>
                  <td>
                    <div style={{ color: '#86868b' }}>{item.date}</div>
                  </td>
                  <td>
                    <a
                      href={item.facebookUrl || item.facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.linkPill}
                    >
                      Facebook Album ↗
                    </a>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className={styles.btnGroup}>
                      <button
                        type="button"
                        className={styles.btnEdit}
                        onClick={() => openEditMedia(item)}
                        title={`Edit ${item.name}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.btnDanger}
                        onClick={() => handleDeleteMedia(item.id, item.name)}
                        title={`Delete ${item.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
