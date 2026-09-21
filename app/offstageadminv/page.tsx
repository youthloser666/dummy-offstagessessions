'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './admin.module.css';

export default function AdminPage() {
  const [passkey, setPasskey] = useState('offstage-session-admin-2026');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shows' | 'media'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  // Shows state
  const [showsList, setShowsList] = useState<any[]>([]);
  const [loadingShows, setLoadingShows] = useState(false);
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

  // Media state
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [newMedia, setNewMedia] = useState({
    name: '',
    date: '',
    thumbnail_url: '',
    facebook_url: 'https://www.facebook.com/offstagesessions',
    category: 'photo',
  });

  // File upload state for Shows
  const [showUploading, setShowUploading] = useState(false);
  const [showUploadPreview, setShowUploadPreview] = useState<string | null>(null);
  const showFileInputRef = useRef<HTMLInputElement>(null);

  // File upload state for Media
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaUploadPreview, setMediaUploadPreview] = useState<string | null>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadShows();
    loadMedia();
  }, []);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadShows = async () => {
    setLoadingShows(true);
    try {
      const res = await fetch('/api/shows');
      const json = await res.json();
      if (json.success) {
        setShowsList(json.data);
      }
    } catch (err) {
      console.error('Failed to load shows:', err);
    } finally {
      setLoadingShows(false);
    }
  };

  const loadMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch('/api/media');
      const json = await res.json();
      if (json.success) {
        setMediaList(json.data);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Direct Image Upload Handler
  const handleFileUpload = async (file: File, target: 'show' | 'media') => {
    if (!file) return;

    if (target === 'show') setShowUploading(true);
    else setMediaUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', target === 'show' ? 'shows' : 'media');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-admin-passkey': passkey,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      if (target === 'show') {
        setNewShow((prev) => ({ ...prev, poster_url: data.url }));
        setShowUploadPreview(data.url);
      } else {
        setNewMedia((prev) => ({ ...prev, thumbnail_url: data.url }));
        setMediaUploadPreview(data.url);
      }

      notify('success', 'Image uploaded successfully');
    } catch (err: any) {
      notify('error', err.message || 'Failed to upload image');
    } finally {
      if (target === 'show') setShowUploading(false);
      else setMediaUploading(false);
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

  // Dashboard calculations
  const upcomingShows = showsList.filter((s) => s.status === 'upcoming');
  const pastShows = showsList.filter((s) => s.status === 'past');
  const nextShow = upcomingShows[0] || showsList[0] || null;
  const ticketLinksCount = showsList.filter((s) => s.ticket_url || s.posh_url).length;

  return (
    <div className={styles.adminLayout}>
      {/* ================================================================== */}
      {/* MOBILE TOP BAR (Phone & Tablet) */}
      {/* ================================================================== */}
      <div className={styles.mobileTopBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Offstage"
            className={styles.mobileBrandLogoImg}
          />
        </div>
        <div style={{ fontSize: 12, color: '#86868b', textTransform: 'capitalize' }}>
          {activeTab}
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ================================================================== */}
      {/* SIDEBAR NAVIGATION */}
      {/* ================================================================== */}
      <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div>
          {/* Brand */}
          <div className={styles.sidebarBrand}>
            <div>
              <div className={styles.brandLogo}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.svg"
                  alt="Offstage"
                  className={styles.brandLogoImg}
                />
              </div>
              <div className={styles.brandSubtitle}>Control Console</div>
            </div>
            <button
              className={styles.sidebarCloseBtn}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Nav Items */}
          <div className={styles.navGroup}>
            <button
              className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}
              onClick={() => {
                setActiveTab('dashboard');
                setShowCreateDrawer(false);
                setMobileMenuOpen(false);
              }}
            >
              <div className={styles.navItemLeft}>
                <span className={styles.navIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </span>
                <span>Dashboard</span>
              </div>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'shows' ? styles.navItemActive : ''}`}
              onClick={() => {
                setActiveTab('shows');
                setShowCreateDrawer(false);
                setMobileMenuOpen(false);
              }}
            >
              <div className={styles.navItemLeft}>
                <span className={styles.navIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                <span>Shows</span>
              </div>
              <span className={styles.navBadge}>{showsList.length}</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'media' ? styles.navItemActive : ''}`}
              onClick={() => {
                setActiveTab('media');
                setShowCreateDrawer(false);
                setMobileMenuOpen(false);
              }}
            >
              <div className={styles.navItemLeft}>
                <span className={styles.navIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </span>
                <span>Media Archives</span>
              </div>
              <span className={styles.navBadge}>{mediaList.length}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.passkeyBadge}>
            <span>Passkey</span>
            <span className={styles.passkeyVal}>active</span>
          </div>

          <a href="/" target="_blank" rel="noreferrer" className={styles.footerActionLink}>
            <span>Live Website</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </aside>

      {/* ================================================================== */}
      {/* MAIN VIEWPORT */}
      {/* ================================================================== */}
      <main className={styles.mainContent}>
        {/* ============================================================== */}
        {/* TAB: DASHBOARD */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Dashboard</h1>
                <p className={styles.pageDesc}>
                  Real-time overview of scheduled sessions, ticket links, and media archives.
                </p>
              </div>

              <div className={styles.headerActions}>
                <button
                  onClick={() => {
                    loadShows();
                    loadMedia();
                    notify('success', 'Dashboard refreshed');
                  }}
                  className={styles.btnSecondary}
                >
                  Refresh Data
                </button>
                <button
                  onClick={() => {
                    setActiveTab('shows');
                    setShowCreateDrawer(true);
                  }}
                  className={styles.btnPrimary}
                >
                  + New Show
                </button>
              </div>
            </div>

            {/* Metrics Overview Grid */}
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Total Sessions</div>
                <div className={styles.metricValue}>{showsList.length}</div>
                <div className={styles.metricSubtitle}>
                  {upcomingShows.length} Upcoming · {pastShows.length} Past
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Next Upcoming</div>
                <div
                  className={styles.metricValue}
                  style={{ fontSize: 20, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {nextShow ? nextShow.date_formatted || nextShow.date_code || 'Scheduled' : 'None'}
                </div>
                <div className={styles.metricSubtitle}>
                  {nextShow ? nextShow.name : 'No scheduled shows'}
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Media Galleries</div>
                <div className={styles.metricValue}>{mediaList.length}</div>
                <div className={styles.metricSubtitle}>
                  Synced with Facebook Albums
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Active Ticketing</div>
                <div className={styles.metricValue}>{ticketLinksCount}</div>
                <div className={styles.metricSubtitle}>
                  Integrated via Posh.vip
                </div>
              </div>
            </div>

            {/* Next Show Spotlight */}
            {nextShow && (
              <div className={styles.spotlightCard}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={nextShow.poster_url || nextShow.posterUrl || '/image/jackie_web.webp'}
                  alt={nextShow.name}
                  className={styles.spotlightPoster}
                />
                <div className={styles.spotlightBody}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span className={styles.spotlightTag}>Headline Spotlight</span>
                    <span
                      className={`${styles.statusBadge} ${
                        nextShow.status === 'upcoming' ? styles.statusUpcoming : styles.statusPast
                      }`}
                    >
                      {nextShow.status === 'upcoming' ? 'Upcoming' : 'Past Event'}
                    </span>
                    {nextShow.featured && (
                      <span className={styles.tagPill} style={{ color: '#e2ff32', borderColor: 'rgba(226, 255, 50, 0.3)' }}>
                        Featured
                      </span>
                    )}
                  </div>

                  <h2 className={styles.spotlightTitle}>{nextShow.name}</h2>
                  <p className={styles.spotlightMeta}>
                    {nextShow.date_formatted || nextShow.date_code} · {nextShow.venue} {nextShow.time ? `· ${nextShow.time}` : ''}
                  </p>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {(nextShow.posh_url || nextShow.poshUrl || nextShow.ticket_url || nextShow.ticketUrl) && (
                      <a
                        href={nextShow.posh_url || nextShow.poshUrl || nextShow.ticket_url || nextShow.ticketUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${styles.linkPill} ${styles.linkPosh}`}
                      >
                        Posh.vip Tickets ↗
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setActiveTab('shows');
                      }}
                      className={styles.btnSecondary}
                      style={{ padding: '4px 10px', fontSize: 12 }}
                    >
                      Manage Show Details →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Split Overviews: Upcoming Shows & Recent Media */}
            <div className={styles.dashboardSplit}>
              {/* Shows Snapshot */}
              <div className={styles.card} style={{ marginBottom: 0 }}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Scheduled Sessions</h3>
                  <button
                    onClick={() => setActiveTab('shows')}
                    className={styles.btnSecondary}
                    style={{ fontSize: 11, padding: '4px 8px' }}
                  >
                    View All ({showsList.length}) →
                  </button>
                </div>

                <div className={styles.miniList}>
                  {showsList.slice(0, 4).map((show, idx) => (
                    <div key={show.id || idx} className={styles.miniItem}>
                      <div className={styles.miniItemLeft}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={show.poster_url || show.posterUrl || '/image/jackie_web.webp'}
                          alt={show.name}
                          className={styles.miniItemThumb}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div className={styles.miniItemTitle}>{show.name}</div>
                          <div className={styles.miniItemMeta}>
                            {show.date_formatted || show.date_code} · {show.venue}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`${styles.statusBadge} ${
                          show.status === 'upcoming' ? styles.statusUpcoming : styles.statusPast
                        }`}
                        style={{ fontSize: 10, padding: '2px 6px' }}
                      >
                        {show.status === 'upcoming' ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media Archives Snapshot */}
              <div className={styles.card} style={{ marginBottom: 0 }}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Media Archives</h3>
                  <button
                    onClick={() => setActiveTab('media')}
                    className={styles.btnSecondary}
                    style={{ fontSize: 11, padding: '4px 8px' }}
                  >
                    View All ({mediaList.length}) →
                  </button>
                </div>

                <div className={styles.miniList}>
                  {mediaList.slice(0, 4).map((item, idx) => (
                    <div key={item.id || idx} className={styles.miniItem}>
                      <div className={styles.miniItemLeft}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnail || item.image || item.thumbnail_url || '/image/jackie_web.webp'}
                          alt={item.name}
                          className={styles.miniItemThumb}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div className={styles.miniItemTitle}>{item.name}</div>
                          <div className={styles.miniItemMeta}>{item.date}</div>
                        </div>
                      </div>

                      <a
                        href={item.facebookUrl || item.facebook_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.linkPill}
                        style={{ fontSize: 10, padding: '2px 6px' }}
                      >
                        Facebook ↗
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SHOWS */}
        {activeTab === 'shows' && (
          <div>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Shows & Events</h1>
                <p className={styles.pageDesc}>
                  Manage scheduled tour dates, tickets via Posh.vip, and event flyers.
                </p>
              </div>

              <div className={styles.headerActions}>
                <button
                  onClick={() => loadShows()}
                  className={styles.btnSecondary}
                  title="Reload data"
                >
                  Refresh
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
                        placeholder="e.g. 4:00 PM — 9:00 PM"
                        value={newShow.time}
                        onChange={(e) => setNewShow({ ...newShow, time: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Date Code (Flyer tag)</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="e.g. 07.25"
                        value={newShow.date_code}
                        onChange={(e) => setNewShow({ ...newShow, date_code: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Date Formatted (HTML)</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="e.g. Fri<br>Jul 25"
                        value={newShow.date_formatted}
                        onChange={(e) => setNewShow({ ...newShow, date_formatted: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Posh.vip URL (Direct link)</label>
                      <input
                        type="url"
                        className={styles.formInput}
                        placeholder="https://posh.vip/e/..."
                        value={newShow.posh_url}
                        onChange={(e) => setNewShow({ ...newShow, posh_url: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Music Tags (comma-separated)</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="House, Techno, Bass"
                        value={newShow.tags}
                        onChange={(e) => setNewShow({ ...newShow, tags: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Event Status</label>
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

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#a1a1a6', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newShow.featured}
                        onChange={(e) => setNewShow({ ...newShow, featured: e.target.checked })}
                      />
                      Mark as Featured
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
                    </tr>
                  </thead>
                  <tbody>
                    {showsList.map((show, idx) => (
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
                          {(show.tags || []).map((t: string) => (
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
                              Posh.vip ↗
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MEDIA ARCHIVES */}
        {activeTab === 'media' && (
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
                  className={styles.btnSecondary}
                >
                  Refresh
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
                            Instant preview & upload to media storage
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
                      <label className={styles.formLabel}>Date & Venue String *</label>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Notifications */}
      {notification && (
        <div
          className={`${styles.notification} ${
            notification.type === 'success' ? styles.notificationSuccess : styles.notificationError
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}
