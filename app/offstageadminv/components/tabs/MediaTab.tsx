'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from '../../admin.module.css';
import { MediaItem } from '../../types';
import AdminImageUploader from '../AdminImageUploader';
import EditMediaModal from '../modals/EditMediaModal';

interface MediaTabProps {
  passkey?: string;
  notify: (type: 'success' | 'error', message: string) => void;
  onMediaCountChange?: (count: number) => void;
}

export default function MediaTab({
  passkey = 'offstage-session-admin-2026',
  notify,
  onMediaCountChange,
}: MediaTabProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  // New Media Form State
  const [newMedia, setNewMedia] = useState({
    name: '',
    date: '',
    thumbnail_url: '',
    facebook_url: 'https://www.facebook.com/offstagesessions',
    category: 'photo',
  });
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaUploadPreview, setMediaUploadPreview] = useState<string | null>(null);

  // Edit Media Modal State
  const [editingMedia, setEditingMedia] = useState<any | null>(null);
  const [editMediaUploading, setEditMediaUploading] = useState(false);
  const [editMediaPreview, setEditMediaPreview] = useState<string | null>(null);

  // Keep callback ref to avoid recreating loadMedia when parent re-renders
  const countCallbackRef = React.useRef(onMediaCountChange);
  countCallbackRef.current = onMediaCountChange;

  const loadMedia = useCallback(async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch('/api/media');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMediaList(json.data);
        countCallbackRef.current?.(json.data.length);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
      notify('error', 'Failed to load media archives');
    } finally {
      setLoadingMedia(false);
    }
  }, [notify]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Upload handler for adding new media
  const handleFileUpload = async (file: File) => {
    setMediaUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'media');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-passkey': passkey },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setNewMedia((prev) => ({ ...prev, thumbnail_url: data.url }));
      setMediaUploadPreview(data.url);
      notify('success', 'Thumbnail uploaded successfully');
    } catch (err: any) {
      notify('error', err.message || 'Failed to upload image');
    } finally {
      setMediaUploading(false);
    }
  };

  // Upload handler for editing media
  const handleEditFileUpload = async (file: File) => {
    setEditMediaUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'media');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-passkey': passkey },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setEditingMedia((prev: any) => ({ ...prev, thumbnail_url: data.url }));
      setEditMediaPreview(data.url);
      notify('success', 'New thumbnail uploaded');
    } catch (err: any) {
      notify('error', err.message || 'Failed to upload image');
    } finally {
      setEditMediaUploading(false);
    }
  };

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedia.thumbnail_url) {
      notify('error', 'Please upload a thumbnail image first.');
      return;
    }

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(newMedia),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add media');
      }

      notify('success', 'Media archive item added');
      setNewMedia({
        name: '',
        date: '',
        thumbnail_url: '',
        facebook_url: 'https://www.facebook.com/offstagesessions',
        category: 'photo',
      });
      setMediaUploadPreview(null);
      setShowCreateDrawer(false);
      loadMedia();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const openEditMedia = (media: MediaItem) => {
    setEditingMedia({
      id: media.id,
      name: media.name || '',
      date: media.date || '',
      thumbnail_url: media.thumbnail_url || media.thumbnail || media.image_url || media.image || '',
      facebook_url: media.facebook_url || media.facebookUrl || '',
      category: media.category || 'photo',
      display_order: media.display_order !== undefined ? media.display_order : 0,
    });
    setEditMediaPreview(media.thumbnail_url || media.thumbnail || media.image_url || null);
  };

  const handleUpdateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    try {
      const res = await fetch('/api/media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(editingMedia),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update media archive');
      }

      notify('success', `Media item "${editingMedia.name}" updated`);
      setEditingMedia(null);
      setEditMediaPreview(null);
      loadMedia();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleDeleteMedia = async (id: string | number, name: string) => {
    if (!window.confirm(`Delete "${name}" from media archives?`)) return;
    try {
      const res = await fetch(`/api/media?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': passkey },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete media');
      }
      notify('success', `Media item "${name}" deleted`);
      loadMedia();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Media Archives</h1>
          <p className={styles.pageDesc}>
            Manage photo and video galleries linked to social coverage and recap posts.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={loadMedia}
            disabled={loadingMedia}
            className={styles.btnSecondary}
            title="Reload archives"
          >
            {loadingMedia ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowCreateDrawer(!showCreateDrawer)}
            className={styles.btnPrimary}
          >
            {showCreateDrawer ? 'Cancel' : '+ Add Gallery'}
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
            <AdminImageUploader
              label="Gallery Thumbnail (Direct Upload)"
              value={mediaUploadPreview || newMedia.thumbnail_url}
              uploading={mediaUploading}
              readyText="Thumbnail Ready"
              uploadPrompt="Instant preview & upload to media storage"
              onFileSelect={handleFileUpload}
            />

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
              {loadingMedia ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className={styles.tableRow}>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 48, height: 48, borderRadius: 4 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 160, height: 16 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 90, height: 14 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 120, height: 24, borderRadius: 12 }} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="skeletonShimmer" style={{ width: 90, height: 28, margin: '0 auto', borderRadius: 4 }} />
                    </td>
                  </tr>
                ))
              ) : mediaList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#86868b' }}>
                    No media archives saved yet. Click &ldquo;+ Add Gallery&rdquo; above to upload one.
                  </td>
                </tr>
              ) : (
                mediaList.map((item, idx) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Media Modal */}
      <EditMediaModal
        editingMedia={editingMedia}
        setEditingMedia={setEditingMedia}
        editMediaUploading={editMediaUploading}
        editMediaPreview={editMediaPreview}
        handleEditFileUpload={handleEditFileUpload}
        handleUpdateMedia={handleUpdateMedia}
      />
    </div>
  );
}
