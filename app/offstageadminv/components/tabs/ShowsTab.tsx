'use client';

import React from 'react';
import styles from '../../admin.module.css';
import { Show } from '../../types';

interface ShowsTabProps {
  showsList: Show[];
  loadingShows: boolean;
  loadShows: () => void;
  showCreateDrawer: boolean;
  setShowCreateDrawer: (open: boolean) => void;
  newShow: any;
  setNewShow: React.Dispatch<React.SetStateAction<any>>;
  showUploading: boolean;
  showUploadPreview: string | null;
  showFileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (file: File, target: 'show' | 'media') => void;
  handleCreateShow: (e: React.FormEvent) => void;
  openEditShow: (show: Show) => void;
  handleDeleteShow: (id: string, name: string) => void;
}

export default function ShowsTab({
  showsList,
  loadingShows,
  loadShows,
  showCreateDrawer,
  setShowCreateDrawer,
  newShow,
  setNewShow,
  showUploading,
  showUploadPreview,
  showFileInputRef,
  handleFileUpload,
  handleCreateShow,
  openEditShow,
  handleDeleteShow,
}: ShowsTabProps) {
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
            onClick={() => loadShows()}
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
            {/* Direct Image Upload Dropzone */}
            <div className={styles.formGroup} style={{ marginBottom: 20 }}>
              <label className={styles.formLabel}>Event Poster (Direct Upload)</label>
              <div
                className={styles.dropzoneContainer}
                onClick={() => showFileInputRef.current?.click()}
              >
                <input
                  ref={showFileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenFileInput}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'show');
                  }}
                />

                {showUploading ? (
                  <div className={styles.dropzonePrompt}>Uploading to media storage...</div>
                ) : showUploadPreview || newShow.poster_url ? (
                  <div className={styles.dropzonePreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={showUploadPreview || newShow.poster_url}
                      alt="Poster preview"
                      className={styles.dropzoneImg}
                    />
                    <div className={styles.dropzoneInfo}>
                      <div className={styles.dropzoneFileName}>Poster Ready</div>
                      <div className={styles.dropzoneStatus}>Click anywhere to replace image</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                      Click to upload poster image
                    </div>
                    <div className={styles.dropzonePrompt}>
                      Supports WebP, PNG, JPG (automatically optimized)
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                          onClick={() => handleDeleteShow(show.id, show.name)}
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
    </div>
  );
}
