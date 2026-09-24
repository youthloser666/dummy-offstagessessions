'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './admin.module.css';

export default function AdminPage() {
  const [passkey, setPasskey] = useState('offstage-session-admin-2026');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shows' | 'media' | 'inquiries' | 'analytics'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  // Inquiries & Email Tracking State
  const [inquiriesList, setInquiriesList] = useState<any[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquiryFilter, setInquiryFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

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

  // Edit states for Shows
  const [editingShow, setEditingShow] = useState<any | null>(null);
  const [editShowUploading, setEditShowUploading] = useState(false);
  const [editShowPreview, setEditShowPreview] = useState<string | null>(null);
  const editShowFileInputRef = useRef<HTMLInputElement>(null);

  // Edit states for Media
  const [editingMedia, setEditingMedia] = useState<any | null>(null);
  const [editMediaUploading, setEditMediaUploading] = useState(false);
  const [editMediaPreview, setEditMediaPreview] = useState<string | null>(null);
  const editMediaFileInputRef = useRef<HTMLInputElement>(null);

  // Analytics & Traffic State
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [connStatus, setConnStatus] = useState<any>(null);
  const [testingConn, setTestingConn] = useState(false);

  useEffect(() => {
    loadShows();
    loadMedia();
    loadInquiries();
    loadAnalytics();
    checkConnection();
  }, []);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const checkConnection = async () => {
    setTestingConn(true);
    try {
      const res = await fetch('/api/test-connection');
      const data = await res.json();
      setConnStatus(data);
    } catch (err) {
      console.error('Failed to check connection:', err);
    } finally {
      setTestingConn(false);
    }
  };

  const handleDeleteShow = async (id: string, name: string) => {
    if (!window.confirm(`Delete show "${name}"? This action will remove it from Supabase.`)) return;
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

  const loadInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const res = await fetch('/api/contact', {
        headers: { 'x-admin-passkey': passkey },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setInquiriesList(json.data);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const handleUpdateInquiryStatus = async (id: string | number, newStatus: string) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update status');
      notify('success', `Status updated to ${newStatus}`);
      loadInquiries();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleDeleteInquiry = async (id: string | number) => {
    if (!window.confirm('Delete this inquiry record? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/contact?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': passkey },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete');
      notify('success', 'Inquiry deleted');
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      loadInquiries();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/analytics', {
        headers: { 'x-admin-passkey': passkey },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAnalyticsData(json.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleResetAnalytics = async () => {
    if (!window.confirm('RESET ALL TRAFFIC ANALYTICS?\n\nThis will permanently delete all visitor records, page view counts, and live streams from Supabase. Are you sure?')) {
      return;
    }
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/analytics', {
        method: 'DELETE',
        headers: { 'x-admin-passkey': passkey },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to reset analytics');
      notify('success', 'All site traffic analytics have been reset');
      loadAnalytics();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const openEditShow = (show: any) => {
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

  const openEditMedia = (media: any) => {
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

  // Direct Image Upload Handler for Editing
  const handleEditFileUpload = async (file: File, target: 'show' | 'media') => {
    if (!file) return;

    if (target === 'show') setEditShowUploading(true);
    else setEditMediaUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', target === 'show' ? 'shows' : 'media');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-passkey': passkey },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      if (target === 'show') {
        setEditingShow((prev: any) => ({ ...prev, poster_url: data.url }));
        setEditShowPreview(data.url);
      } else {
        setEditingMedia((prev: any) => ({ ...prev, thumbnail_url: data.url }));
        setEditMediaPreview(data.url);
      }

      notify('success', 'Image replaced and uploaded successfully');
    } catch (err: any) {
      notify('error', err.message || 'Failed to upload image');
    } finally {
      if (target === 'show') setEditShowUploading(false);
      else setEditMediaUploading(false);
    }
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

  const unreadInquiriesCount = inquiriesList.filter((i) => i.status === 'unread').length;
  const bookingCount = inquiriesList.filter((i) => i.category === 'Booking').length;
  const collabCount = inquiriesList.filter((i) => i.category === 'Collaboration').length;
  const pressCount = inquiriesList.filter((i) => i.category === 'Press').length;
  const generalCount = inquiriesList.filter((i) => i.category === 'General').length;

  const houseShows = showsList.filter((s) => (s.tags || []).includes('House')).length;
  const technoShows = showsList.filter((s) => (s.tags || []).includes('Techno')).length;
  const bassShows = showsList.filter((s) => (s.tags || []).includes('Bass')).length;

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

            <button
              className={`${styles.navItem} ${activeTab === 'inquiries' ? styles.navItemActive : ''}`}
              onClick={() => {
                setActiveTab('inquiries');
                setShowCreateDrawer(false);
                setMobileMenuOpen(false);
              }}
            >
              <div className={styles.navItemLeft}>
                <span className={styles.navIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <span>Track Emails</span>
              </div>
              {unreadInquiriesCount > 0 ? (
                <span className={styles.navBadge} style={{ backgroundColor: 'rgba(226, 255, 50, 0.2)', color: '#e2ff32', fontWeight: 700 }}>
                  {unreadInquiriesCount} new
                </span>
              ) : (
                <span className={styles.navBadge}>{inquiriesList.length}</span>
              )}
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'analytics' ? styles.navItemActive : ''}`}
              onClick={() => {
                setActiveTab('analytics');
                setShowCreateDrawer(false);
                setMobileMenuOpen(false);
              }}
            >
              <div className={styles.navItemLeft}>
                <span className={styles.navIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </span>
                <span>Analytics</span>
              </div>
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

            {/* Connection Status Banner */}
            <div className={styles.connectionCard}>
              <div className={styles.connectionItems}>
                <div className={styles.connectionItem}>
                  <span
                    className={`${styles.statusDot} ${
                      connStatus?.supabase?.connected
                        ? styles.dotConnected
                        : connStatus?.supabase?.configured
                        ? styles.dotWarning
                        : styles.dotOffline
                    }`}
                  />
                  <span>
                    <strong>Supabase:</strong>{' '}
                    {connStatus
                      ? connStatus.supabase?.connected
                        ? `Connected (${connStatus.supabase.showsCount} shows in DB)`
                        : connStatus.supabase?.configured
                        ? 'Configured (schema pending)'
                        : 'Offline Mode (Set .env.local)'
                      : 'Checking...'}
                  </span>
                </div>

                <div className={styles.connectionItem}>
                  <span
                    className={`${styles.statusDot} ${
                      connStatus?.cloudinary?.connected
                        ? styles.dotConnected
                        : connStatus?.cloudinary?.configured
                        ? styles.dotWarning
                        : styles.dotOffline
                    }`}
                  />
                  <span>
                    <strong>Cloudinary:</strong>{' '}
                    {connStatus
                      ? connStatus.cloudinary?.connected
                        ? `Connected (${connStatus.cloudinary.cloudName})`
                        : connStatus.cloudinary?.configured
                        ? 'Configured (Ping check)'
                        : 'Offline Mode (Set .env.local)'
                      : 'Checking...'}
                  </span>
                </div>
              </div>

              <button
                onClick={checkConnection}
                disabled={testingConn}
                className={styles.btnSecondary}
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                {testingConn ? 'Testing...' : 'Test Connection'}
              </button>
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

              <div
                className={styles.metricCard}
                onClick={() => setActiveTab('inquiries')}
                style={{ cursor: 'pointer' }}
                title="Click to view inquiries"
              >
                <div className={styles.metricLabel}>Tracked Emails</div>
                <div className={styles.metricValue}>{inquiriesList.length}</div>
                <div
                  className={styles.metricSubtitle}
                  style={{ color: unreadInquiriesCount > 0 ? '#e2ff32' : '#55f385' }}
                >
                  {unreadInquiriesCount > 0 ? `${unreadInquiriesCount} Unread · ` : ''}{bookingCount} Bookings
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

              {/* Inquiries Snapshot */}
              <div className={styles.card} style={{ marginBottom: 0 }}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Recent Inquiries</h3>
                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className={styles.btnSecondary}
                    style={{ fontSize: 11, padding: '4px 8px' }}
                  >
                    View All ({inquiriesList.length}) →
                  </button>
                </div>

                <div className={styles.miniList}>
                  {inquiriesList.length === 0 ? (
                    <div style={{ color: '#86868b', fontSize: 12, padding: '16px 0', textAlign: 'center' }}>
                      No inquiries received yet
                    </div>
                  ) : (
                    inquiriesList.slice(0, 4).map((inq, idx) => (
                      <div key={inq.id || idx} className={styles.miniItem}>
                        <div className={styles.miniItemLeft}>
                          <div style={{ minWidth: 0 }}>
                            <div className={styles.miniItemTitle}>
                              {inq.subject || 'No Subject'}
                            </div>
                            <div className={styles.miniItemMeta}>
                              {inq.email || 'Anonymous'} · {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'Recent'}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`${styles.statusBadge} ${
                            inq.status === 'unread'
                              ? styles.statusUnread
                              : inq.status === 'replied'
                              ? styles.statusReplied
                              : styles.statusRead
                          }`}
                          style={{ fontSize: 10, padding: '2px 6px' }}
                        >
                          {inq.status}
                        </span>
                      </div>
                    ))
                  )}
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
                      <th style={{ width: 140, textAlign: 'center' }}>Actions</th>
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
        )}

        {/* TAB: EMAIL INQUIRIES & TRACKING */}
        {activeTab === 'inquiries' && (
          <div>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Track Emails & Inquiries</h1>
                <p className={styles.pageDesc}>
                  Live log of booking requests, collaborations, and contact messages sent from your website.
                </p>
              </div>

              <div className={styles.headerActions}>
                <button
                  onClick={() => {
                    loadInquiries();
                    notify('success', 'Inquiries refreshed');
                  }}
                  className={styles.btnSecondary}
                >
                  Refresh Inquiries
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['all', 'unread', 'Booking', 'Collaboration', 'Press', 'General', 'replied'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setInquiryFilter(cat)}
                  className={inquiryFilter === cat ? styles.btnPrimary : styles.btnSecondary}
                  style={{ fontSize: 12, padding: '5px 12px', textTransform: 'capitalize' }}
                >
                  {cat === 'all'
                    ? `All (${inquiriesList.length})`
                    : cat === 'unread'
                    ? `Unread (${unreadInquiriesCount})`
                    : cat}
                </button>
              ))}
            </div>

            {/* Inquiries Table */}
            <div className={styles.card} style={{ padding: 0 }}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Sender Email</th>
                      <th>Category</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th style={{ width: 140, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiriesList.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: '#86868b' }}>
                          No inquiries received yet. Try submitting the contact form on your website!
                        </td>
                      </tr>
                    ) : (
                      inquiriesList
                        .filter((item) => {
                          if (inquiryFilter === 'all') return true;
                          if (inquiryFilter === 'unread') return item.status === 'unread';
                          if (inquiryFilter === 'replied') return item.status === 'replied';
                          return item.category === inquiryFilter;
                        })
                        .map((item, idx) => (
                          <tr key={item.id || idx} className={styles.tableRow}>
                            <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: '#a1a1a6' }}>
                              {item.created_at
                                ? new Date(item.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Recent'}
                            </td>
                            <td>
                              <div style={{ color: '#ffffff', fontWeight: 600 }}>{item.email || 'Anonymous'}</div>
                              {item.ip_address && (
                                <div style={{ fontSize: 10, color: '#666' }}>IP: {item.ip_address}</div>
                              )}
                            </td>
                            <td>
                              <span
                                className={`${styles.categoryTag} ${
                                  item.category === 'Booking'
                                    ? styles.categoryBooking
                                    : item.category === 'Collaboration'
                                    ? styles.categoryCollab
                                    : item.category === 'Press'
                                    ? styles.categoryPress
                                    : styles.categoryGeneral
                                }`}
                              >
                                {item.category || 'General'}
                              </span>
                            </td>
                            <td>
                              <div style={{ color: '#ffffff', fontWeight: 500 }}>{item.subject}</div>
                            </td>
                            <td style={{ maxWidth: 280, color: '#a1a1a6', fontSize: 12 }}>
                              <div
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                }}
                                title="Click to view full message"
                                onClick={() => setSelectedInquiry(item)}
                              >
                                {item.message}
                              </div>
                            </td>
                            <td>
                              <select
                                value={item.status || 'unread'}
                                onChange={(e) => handleUpdateInquiryStatus(item.id, e.target.value)}
                                className={styles.formSelect}
                                style={{
                                  padding: '3px 8px',
                                  fontSize: 11,
                                  width: 'auto',
                                  borderRadius: 12,
                                  backgroundColor:
                                    item.status === 'unread'
                                      ? 'rgba(226, 255, 50, 0.15)'
                                      : item.status === 'replied'
                                      ? 'rgba(85, 243, 133, 0.15)'
                                      : 'rgba(100, 181, 246, 0.15)',
                                  color:
                                    item.status === 'unread'
                                      ? '#e2ff32'
                                      : item.status === 'replied'
                                      ? '#55f385'
                                      : '#64b5f6',
                                  fontWeight: 600,
                                }}
                              >
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                                <option value="replied">Replied</option>
                              </select>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                {item.email && (
                                  <a
                                    href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`}
                                    className={styles.linkPill}
                                    style={{ fontSize: 11 }}
                                    title="Reply via Email Client"
                                    onClick={() => {
                                      if (item.status === 'unread') {
                                        handleUpdateInquiryStatus(item.id, 'replied');
                                      }
                                    }}
                                  >
                                    Reply ↗
                                  </a>
                                )}
                                <button
                                  type="button"
                                  className={styles.btnDanger}
                                  onClick={() => handleDeleteInquiry(item.id)}
                                  title="Delete Inquiry"
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

            {/* Message Detail Modal / Drawer */}
            {selectedInquiry && (
              <div className={styles.card} style={{ marginTop: 24, border: '1px solid rgba(226, 255, 50, 0.3)' }}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{selectedInquiry.subject}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#86868b' }}>
                      From: <strong style={{ color: '#fff' }}>{selectedInquiry.email}</strong> · Category: {selectedInquiry.category}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className={styles.btnSecondary}
                    style={{ fontSize: 11 }}
                  >
                    Close Preview
                  </button>
                </div>
                <div style={{ backgroundColor: '#141417', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap', color: '#e0e0e0', fontSize: 14, lineHeight: 1.6 }}>
                  {selectedInquiry.message}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: SITE TRAFFIC & VISITOR ANALYTICS */}
        {activeTab === 'analytics' && (
          <div>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Site Traffic & Visitor Analytics</h1>
                <p className={styles.pageDesc}>
                  Live real-time monitoring of people visiting your website, page views, devices, and traffic origins.
                </p>
              </div>

              <div className={styles.headerActions}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: '#55f385',
                    backgroundColor: 'rgba(85, 243, 133, 0.1)',
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: '1px solid rgba(85, 243, 133, 0.25)',
                  }}
                >
                  <span className={styles.trafficLiveDot} />
                  <span>Tracking Active</span>
                </div>

                <button
                  onClick={() => {
                    loadAnalytics();
                    notify('success', 'Traffic analytics refreshed');
                  }}
                  disabled={loadingAnalytics}
                  className={styles.btnSecondary}
                >
                  {loadingAnalytics ? 'Refreshing...' : 'Refresh Traffic'}
                </button>

                <button
                  onClick={handleResetAnalytics}
                  disabled={loadingAnalytics}
                  className={styles.btnSecondary}
                  style={{
                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                    borderColor: 'rgba(255, 68, 68, 0.3)',
                    color: '#ff6b6b',
                  }}
                  title="Clear all visitor traffic history"
                >
                  Reset Analytics
                </button>

                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.btnPrimary}
                  style={{ textDecoration: 'none' }}
                >
                  Open Live Site ↗
                </a>
              </div>
            </div>

            {/* Primary Visitor KPI Metrics */}
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Total Page Views</div>
                <div className={styles.metricValue}>
                  {analyticsData ? (analyticsData.totalViews || 0).toLocaleString() : '—'}
                </div>
                <div className={styles.metricSubtitle}>
                  {analyticsData?.hasData ? 'Past 30 days traffic' : 'Awaiting first visits'}
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Unique Visitors</div>
                <div className={styles.metricValue} style={{ color: '#e2ff32' }}>
                  {analyticsData ? (analyticsData.uniqueVisitors || 0).toLocaleString() : '—'}
                </div>
                <div className={styles.metricSubtitle} style={{ color: '#e2ff32' }}>
                  Distinct audience visitors
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Today&apos;s Traffic</div>
                <div className={styles.metricValue}>
                  {analyticsData ? (analyticsData.viewsToday || 0).toLocaleString() : '—'}
                </div>
                <div className={styles.metricSubtitle}>
                  {analyticsData ? `${analyticsData.uniqueVisitorsToday || 0} unique today` : 'Live daily count'}
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Top Visited Route</div>
                <div
                  className={styles.metricValue}
                  style={{ fontSize: 20, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {analyticsData?.topPages?.[0]?.path || '/'}
                </div>
                <div className={styles.metricSubtitle}>
                  {analyticsData?.topPages?.[0]
                    ? `${analyticsData.topPages[0].count} views (${analyticsData.topPages[0].percentage}%)`
                    : 'No visits yet'}
                </div>
              </div>
            </div>

            {/* Split: Top Pages vs Device Breakdown */}
            <div className={styles.dashboardSplit}>
              {/* Top Pages Visited */}
              <div className={styles.card} style={{ marginBottom: 0 }}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Top Visited Pages</h3>
                  <span style={{ fontSize: 11, color: '#86868b' }}>By view count</span>
                </div>

                {analyticsData?.topPages && analyticsData.topPages.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {analyticsData.topPages.map((p: any, idx: number) => (
                      <div key={p.path || idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span className={styles.trafficPathBadge}>{p.path}</span>
                          <span style={{ fontSize: 12, color: '#ffffff', fontWeight: 600 }}>
                            {p.count} views <span style={{ color: '#86868b', fontWeight: 400 }}>({p.percentage}%)</span>
                          </span>
                        </div>
                        <div className={styles.analyticsBarContainer}>
                          <div
                            className={styles.analyticsBarFill}
                            style={{
                              width: `${Math.max(p.percentage, 4)}%`,
                              background: idx === 0 ? 'linear-gradient(90deg, #55f385, #e2ff32)' : '#e2ff32',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: '#86868b', fontSize: 13 }}>
                    <p style={{ margin: '0 0 8px 0', color: '#ffffff', fontWeight: 500 }}>No page traffic logged yet</p>
                    <p style={{ margin: 0, fontSize: 12 }}>
                      Visits to your landing page, /shows, /media, etc. will automatically appear here once visitors browse.
                    </p>
                  </div>
                )}
              </div>

              {/* Devices, Browsers & Traffic Sources */}
              <div className={styles.card} style={{ marginBottom: 0 }}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Device & Audience Sources</h3>
                  <span style={{ fontSize: 11, color: '#86868b' }}>Browser breakdown</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Device Types */}
                  <div>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86868b', marginBottom: 10, fontWeight: 600 }}>
                      Device Types
                    </div>
                    {(analyticsData?.devices || [
                      { device: 'desktop', count: 0, percentage: 0 },
                      { device: 'mobile', count: 0, percentage: 0 },
                      { device: 'tablet', count: 0, percentage: 0 },
                    ]).map((dev: any) => (
                      <div key={dev.device} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#fff', marginBottom: 4 }}>
                          <span style={{ textTransform: 'capitalize' }}>
                            {dev.device === 'desktop' ? '💻 Desktop' : dev.device === 'mobile' ? '📱 Mobile' : '📟 Tablet'}
                          </span>
                          <strong>{dev.count} ({dev.percentage}%)</strong>
                        </div>
                        <div className={styles.analyticsBarContainer}>
                          <div
                            className={styles.analyticsBarFill}
                            style={{
                              width: `${Math.max(dev.percentage, dev.count > 0 ? 4 : 0)}%`,
                              background: dev.device === 'mobile' ? '#64b5f6' : dev.device === 'desktop' ? '#55f385' : '#c77dff',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sources / Referrers */}
                  {analyticsData?.sources && analyticsData.sources.length > 0 && (
                    <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86868b', marginBottom: 8, fontWeight: 600 }}>
                        Traffic Sources
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {analyticsData.sources.map((s: any) => (
                          <span key={s.source} className={styles.sourceBadge}>
                            {s.source} · {s.count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Operating Systems */}
                  {analyticsData?.osBreakdown && analyticsData.osBreakdown.length > 0 && (
                    <div style={{ paddingTop: 8 }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86868b', marginBottom: 8, fontWeight: 600 }}>
                        Platforms
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {analyticsData.osBreakdown.map((item: any) => (
                          <span key={item.os} className={styles.tagPill}>
                            {item.os}: {item.count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live Real-Time Visitor Stream */}
            <div className={styles.card} style={{ marginTop: 24, padding: 0 }}>
              <div className={styles.cardHeader} style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
                <div>
                  <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={styles.trafficLiveDot} />
                    Live Visitor Activity Stream
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#86868b' }}>
                    Most recent real-time audience page navigations across the website.
                  </p>
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 140 }}>Timestamp</th>
                      <th>Visited Route</th>
                      <th>Device</th>
                      <th>Browser & OS</th>
                      <th>Source / Referrer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData?.recentVisits && analyticsData.recentVisits.length > 0 ? (
                      analyticsData.recentVisits.map((visit: any, idx: number) => (
                        <tr key={visit.id || idx} className={styles.tableRow}>
                          <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: '#a1a1a6' }}>
                            {visit.created_at
                              ? new Date(visit.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })
                              : 'Just now'}
                            <div style={{ fontSize: 10, color: '#666' }}>
                              {visit.created_at ? new Date(visit.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                            </div>
                          </td>
                          <td>
                            <span className={styles.trafficPathBadge}>{visit.path || '/'}</span>
                          </td>
                          <td>
                            <span
                              className={styles.statusBadge}
                              style={{
                                textTransform: 'capitalize',
                                backgroundColor:
                                  visit.device === 'mobile'
                                    ? 'rgba(100, 181, 246, 0.15)'
                                    : 'rgba(85, 243, 133, 0.15)',
                                color: visit.device === 'mobile' ? '#64b5f6' : '#55f385',
                              }}
                            >
                              {visit.device === 'mobile' ? '📱 Mobile' : '💻 Desktop'}
                            </span>
                          </td>
                          <td style={{ color: '#d1d1d6', fontSize: 12 }}>
                            {visit.browser || 'Browser'} · {visit.os || 'OS'}
                          </td>
                          <td style={{ color: '#86868b', fontSize: 12 }}>
                            {visit.referrer && visit.referrer !== 'Direct' ? (
                              <span style={{ color: '#e2ff32' }}>{visit.referrer}</span>
                            ) : (
                              'Direct / Bookmark'
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '36px 0', color: '#86868b' }}>
                          <p style={{ margin: '0 0 6px 0', color: '#fff', fontWeight: 500 }}>No live traffic recorded yet</p>
                          <p style={{ margin: 0, fontSize: 12 }}>
                            Visit the website at{' '}
                            <a href="/" target="_blank" style={{ color: '#e2ff32', textDecoration: 'underline' }}>
                              localhost:3000 /
                            </a>{' '}
                            to test and verify the live visitor stream.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: EDIT SHOW */}
      {/* ============================================================== */}
      {editingShow && (
        <div className={styles.modalBackdrop} onClick={() => setEditingShow(null)}>
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
              {/* Direct Image Upload Dropzone */}
              <div className={styles.formGroup} style={{ marginBottom: 20 }}>
                <label className={styles.formLabel}>Event Poster (Click to Replace via Cloudinary)</label>
                <div
                  className={styles.dropzoneContainer}
                  onClick={() => editShowFileInputRef.current?.click()}
                >
                  <input
                    ref={editShowFileInputRef}
                    type="file"
                    accept="image/*"
                    className={styles.hiddenFileInput}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleEditFileUpload(file, 'show');
                    }}
                  />

                  {editShowUploading ? (
                    <div className={styles.dropzonePrompt}>Uploading new poster to Cloudinary...</div>
                  ) : editShowPreview || editingShow.poster_url ? (
                    <div className={styles.dropzonePreview}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editShowPreview || editingShow.poster_url}
                        alt="Poster preview"
                        className={styles.dropzoneImg}
                      />
                      <div className={styles.dropzoneInfo}>
                        <div className={styles.dropzoneFileName}>Poster Ready</div>
                        <div className={styles.dropzoneStatus}>Click to replace with another image</div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                        Click to upload poster image
                      </div>
                      <div className={styles.dropzonePrompt}>
                        Supports WebP, PNG, JPG (automatically uploaded to Cloudinary)
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
                  <label className={styles.formLabel}>Date Formatted (e.g. Fri&lt;br&gt;Jul 25)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={editingShow.date_formatted}
                    onChange={(e) => setEditingShow({ ...editingShow, date_formatted: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Posh.vip / Ticket URL</label>
                  <input
                    type="url"
                    className={styles.formInput}
                    placeholder="https://posh.vip/e/..."
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
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT MEDIA ARCHIVE */}
      {/* ============================================================== */}
      {editingMedia && (
        <div className={styles.modalBackdrop} onClick={() => setEditingMedia(null)}>
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
      )}

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
