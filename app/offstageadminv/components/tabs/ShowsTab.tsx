'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from '../../admin.module.css';
import { Show } from '../../types';
import AdminImageUploader from '../AdminImageUploader';
import EditShowModal from '../modals/EditShowModal';

interface ShowsTabProps {
  passkey?: string;
  notify: (type: 'success' | 'error', message: string) => void;
  onShowsCountChange?: (count: number) => void;
  showCreateDrawer?: boolean;
  setShowCreateDrawer?: (open: boolean) => void;
}

export default function ShowsTab({
  passkey = 'offstage-session-admin-2026',
  notify,
  onShowsCountChange,
  showCreateDrawer: propShowCreateDrawer,
  setShowCreateDrawer: propSetShowCreateDrawer,
}: ShowsTabProps) {
  const [showsList, setShowsList] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState(true);

  // Fallback internal state if drawer control isn't passed from parent
  const [internalDrawer, setInternalDrawer] = useState(false);
  const showCreateDrawer = propShowCreateDrawer !== undefined ? propShowCreateDrawer : internalDrawer;
  const setShowCreateDrawer = propSetShowCreateDrawer || setInternalDrawer;

  // New Show Form State
  const [newShow, setNewShow] = useState({
    name: '',
    subtitle: '',
    date_code: '',
    date_formatted: '',
    event_date: '',
    venue: '',
    time: '',
    poster_url: '',
    tags: 'House, Techno',
    featured: false,
    month: 'August 2026',
    posh_url: '',
    status: 'upcoming',
  });
  const [showUploading, setShowUploading] = useState(false);
  const [showUploadPreview, setShowUploadPreview] = useState<string | null>(null);

  // Edit Show Modal State
  const [editingShow, setEditingShow] = useState<any | null>(null);
  const [editShowUploading, setEditShowUploading] = useState(false);
  const [editShowPreview, setEditShowPreview] = useState<string | null>(null);

  // Keep callback ref to avoid recreating loadShows when parent re-renders
  const countCallbackRef = React.useRef(onShowsCountChange);
  countCallbackRef.current = onShowsCountChange;

  const loadShows = useCallback(async () => {
    setLoadingShows(true);
    try {
      const res = await fetch('/api/shows');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setShowsList(json.data);
        countCallbackRef.current?.(json.data.length);
      }
    } catch (err) {
      console.error('Failed to load shows:', err);
      notify('error', 'Failed to load shows list');
    } finally {
      setLoadingShows(false);
    }
  }, [notify]);

  useEffect(() => {
    loadShows();
  }, [loadShows]);

  // Upload handler for adding a new show
  const handleFileUpload = async (file: File) => {
    setShowUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'shows');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-passkey': passkey },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setNewShow((prev) => ({ ...prev, poster_url: data.url }));
      setShowUploadPreview(data.url);
      notify('success', 'Poster uploaded successfully');
    } catch (err: any) {
      notify('error', err.message || 'Failed to upload poster image');
    } finally {
      setShowUploading(false);
    }
  };

  // Upload handler for editing a show
  const handleEditFileUpload = async (file: File) => {
    setEditShowUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'shows');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-passkey': passkey },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setEditingShow((prev: any) => ({ ...prev, poster_url: data.url }));
      setEditShowPreview(data.url);
      notify('success', 'New poster uploaded');
    } catch (err: any) {
      notify('error', err.message || 'Failed to replace poster image');
    } finally {
      setEditShowUploading(false);
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShow.poster_url) {
      notify('error', 'Please upload a poster image first.');
      return;
    }

    try {
      const payload = {
        ...newShow,
        tags: newShow.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const res = await fetch('/api/shows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create show');
      }

      notify('success', 'Show created successfully');
      setNewShow({
        name: '',
        subtitle: '',
        date_code: '',
        date_formatted: '',
        event_date: '',
        venue: '',
        time: '',
        poster_url: '',
        tags: 'House, Techno',
        featured: false,
        month: 'September 2026',
        posh_url: '',
        status: 'upcoming',
      });
      setShowUploadPreview(null);
      setShowCreateDrawer(false);
      loadShows();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const openEditShow = (show: Show) => {
    setEditingShow({
      id: show.id,
      name: show.name || '',
      subtitle: show.subtitle || '',
      venue: show.venue || '',
      time: show.time || '',
      date_code: show.date_code || show.dateCode || '',
      date_formatted: show.date_formatted || show.dateFormatted || '',
      event_date: show.event_date || show.eventDate || '',
      poster_url: show.poster_url || show.poster || '',
      tags: Array.isArray(show.tags) ? show.tags.join(', ') : show.tags || '',
      featured: Boolean(show.featured),
      month: show.month || 'August 2026',
      posh_url: show.posh_url || show.poshUrl || show.ticket_url || show.ticketUrl || '',
      status: show.status || 'upcoming',
    });
    setEditShowPreview(show.poster_url || show.poster || null);
  };

  const handleUpdateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShow) return;

    try {
      const payload = {
        ...editingShow,
        tags: typeof editingShow.tags === 'string'
          ? editingShow.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : editingShow.tags,
      };

      const res = await fetch('/api/shows', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update show');
      }

      notify('success', `Show "${editingShow.name}" updated successfully`);
      setEditingShow(null);
      setEditShowPreview(null);
      loadShows();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleDeleteShow = async (id: string, name: string) => {
    if (!window.confirm(`Delete show "${name}"? This action will remove it from database.`)) return;
    try {
      const res = await fetch(`/api/shows?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': passkey },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete show');
      }
      notify('success', `Show "${name}" deleted`);
      loadShows();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Shows &amp; Events</h1>
          <p className={styles.pageDesc}>
            Manage scheduled tour dates, ticketing links, and event flyers.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={loadShows}
            disabled={loadingShows}
            className={styles.btnSecondary}
            title="Reload data"
          >
            {loadingShows ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowCreateDrawer(!showCreateDrawer)}
            className={styles.btnPrimary}
          >
            {showCreateDrawer ? 'Cancel' : '+ New Show'}
          </button>
        </div>
      </div>

      {/* Collapsible New Show Form */}
      {showCreateDrawer && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Add New Show</h3>
          </div>

          <form onSubmit={handleCreateShow}>
            <AdminImageUploader
              label="Event Poster (Direct Upload)"
              value={showUploadPreview || newShow.poster_url}
              uploading={showUploading}
              readyText="Poster Ready"
              uploadPrompt="Supports WebP, PNG, JPG (automatically optimized)"
              onFileSelect={handleFileUpload}
            />

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Artist / Event Title *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. TO BE HONEST"
                  value={newShow.name}
                  onChange={(e) => setNewShow({ ...newShow, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Subtitle / Special Tagline</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. OFFSTAGE 3 YEARS ANNIVERSARY"
                  value={newShow.subtitle}
                  onChange={(e) => setNewShow({ ...newShow, subtitle: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Venue *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Sound Garden / Arepi, Baltimore"
                  value={newShow.venue}
                  onChange={(e) => setNewShow({ ...newShow, venue: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Time</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. 10:00 PM — LATE"
                  value={newShow.time}
                  onChange={(e) => setNewShow({ ...newShow, time: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date Code (e.g. 07.25)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="07.25"
                  value={newShow.date_code}
                  onChange={(e) => setNewShow({ ...newShow, date_code: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date Formatted (e.g. Fri Aug 25)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Fri Aug 25"
                  value={newShow.date_formatted}
                  onChange={(e) => setNewShow({ ...newShow, date_formatted: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Event Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={newShow.event_date}
                  onChange={(e) => setNewShow({ ...newShow, event_date: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ticket Outlet URL / Link</label>
                <input
                  type="url"
                  className={styles.formInput}
                  placeholder="https://... (e.g. Eventbrite, Posh, RA, etc.)"
                  value={newShow.posh_url}
                  onChange={(e) => setNewShow({ ...newShow, posh_url: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Music Genres (comma-separated)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="House, Techno, Bass"
                  value={newShow.tags}
                  onChange={(e) => setNewShow({ ...newShow, tags: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Month Group</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="August 2026"
                  value={newShow.month}
                  onChange={(e) => setNewShow({ ...newShow, month: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formSelect}
                  value={newShow.status}
                  onChange={(e) => setNewShow({ ...newShow, status: e.target.value })}
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
                  checked={newShow.featured}
                  onChange={(e) => setNewShow({ ...newShow, featured: e.target.checked })}
                />
                Mark as Featured Headline Event
              </label>

              <button type="submit" className={styles.btnPrimary}>
                Save Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shows List Table */}
      <div className={styles.card} style={{ padding: 0 }}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 64 }}>Poster</th>
                <th>Event</th>
                <th>Date / Venue</th>
                <th>Genres</th>
                <th>Ticket Links</th>
                <th>Status</th>
                <th style={{ width: 140, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingShows ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className={styles.tableRow}>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 44, height: 58, borderRadius: 4 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 140, height: 16, marginBottom: 6 }} />
                      <div className="skeletonShimmer" style={{ width: 90, height: 12 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 80, height: 14, marginBottom: 4 }} />
                      <div className="skeletonShimmer" style={{ width: 110, height: 12 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 70, height: 20, borderRadius: 12 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 65, height: 20, borderRadius: 12 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 75, height: 20, borderRadius: 12 }} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="skeletonShimmer" style={{ width: 90, height: 28, margin: '0 auto', borderRadius: 4 }} />
                    </td>
                  </tr>
                ))
              ) : showsList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#86868b' }}>
                    No events scheduled yet. Click &ldquo;+ Add Show&rdquo; above to create one.
                  </td>
                </tr>
              ) : (
                showsList.map((show, idx) => (
                  <tr key={show.id || idx} className={styles.tableRow}>
                    <td>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={show.poster || show.poster_url || '/image/tobehonest_web.webp'}
                        alt={show.name}
                        className={styles.tableThumb}
                      />
                    </td>
                    <td>
                      <div className={styles.tableTitle}>{show.name}</div>
                      {show.subtitle && <div className={styles.tableSubtitle}>{show.subtitle}</div>}
                    </td>
                    <td>
                      <div style={{ color: '#ffffff', fontWeight: 500 }}>{show.dateCode || show.date_code}</div>
                      <div style={{ fontSize: 12, color: '#86868b' }}>{show.venue}</div>
                    </td>
                    <td>
                      {(Array.isArray(show.tags) ? show.tags : (show.tags ? [show.tags] : [])).map((t: string) => (
                        <span key={t} className={styles.tagPill}>
                          {t}
                        </span>
                      ))}
                    </td>
                    <td>
                      {(show.poshUrl || show.posh_url || show.ticketUrl || show.ticket_url) ? (
                        <a
                          href={show.poshUrl || show.posh_url || show.ticketUrl || show.ticket_url}
                          target="_blank"
                          rel="noreferrer"
                          className={`${styles.linkPill} ${styles.linkPosh}`}
                        >
                          Tickets ↗
                        </a>
                      ) : (
                        <span style={{ color: '#55555a', fontSize: 11 }}>No link</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          show.status === 'past' ? styles.statusPast : styles.statusUpcoming
                        }`}
                      >
                        {show.status || 'upcoming'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className={styles.btnGroup}>
                        <button
                          type="button"
                          className={styles.btnEdit}
                          onClick={() => openEditShow(show)}
                          title={`Edit ${show.name}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.btnDanger}
                          onClick={() => handleDeleteShow(String(show.id), show.name)}
                          title={`Delete ${show.name}`}
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

      {/* Edit Show Modal */}
      <EditShowModal
        editingShow={editingShow}
        setEditingShow={setEditingShow}
        editShowUploading={editShowUploading}
        editShowPreview={editShowPreview}
        handleEditFileUpload={handleEditFileUpload}
        handleUpdateShow={handleUpdateShow}
      />
    </div>
  );
}
