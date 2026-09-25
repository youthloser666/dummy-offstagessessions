'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './admin.module.css';

// Types
import {
  TabType,
  Show,
  MediaItem,
  Inquiry,
  AnalyticsData,
  SocialForm,
  NotificationState,
} from './types';

// Layout & UI Components
import MobileTopBar from './components/MobileTopBar';
import AdminSidebar from './components/AdminSidebar';
import NotificationToast from './components/NotificationToast';

// Tab Views
import DashboardTab from './components/tabs/DashboardTab';
import ShowsTab from './components/tabs/ShowsTab';
import MediaTab from './components/tabs/MediaTab';
import InquiriesTab from './components/tabs/InquiriesTab';
import AnalyticsTab from './components/tabs/AnalyticsTab';
import SocialsTab from './components/tabs/SocialsTab';

// Modals
import EditShowModal from './components/modals/EditShowModal';
import EditMediaModal from './components/modals/EditMediaModal';

export default function AdminPage() {
  const [passkey] = useState('offstage-session-admin-2026');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  // Inquiries & Email Tracking State
  const [inquiriesList, setInquiriesList] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquiryFilter, setInquiryFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Shows state
  const [showsList, setShowsList] = useState<Show[]>([]);
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
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
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
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Social Media Channels State
  const [socialForm, setSocialForm] = useState<SocialForm>({
    instagram: 'https://instagram.com/offstagesession',
    tiktok: 'https://www.tiktok.com/@offstagesessions',
    facebook: 'https://www.facebook.com/offstagesessions',
    email: 'offstage@offstagesessions.com',
    spotify: '',
    soundcloud: '',
    youtube: '',
  });
  const [loadingSocials, setLoadingSocials] = useState(false);
  const [savingSocials, setSavingSocials] = useState(false);
  const [socialTableMissing, setSocialTableMissing] = useState(false);

  // Notification & Service Connection States
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [connStatus, setConnStatus] = useState<any>(null);
  const [testingConn, setTestingConn] = useState(false);

  useEffect(() => {
    loadShows();
    loadMedia();
    loadInquiries();
    loadAnalytics();
    loadSocials();
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

  // --------------------------------------------------------------------------
  // SHOWS HANDLERS
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // MEDIA HANDLERS
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // INQUIRIES HANDLERS
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // ANALYTICS HANDLERS
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // SOCIALS HANDLERS
  // --------------------------------------------------------------------------
  const loadSocials = async () => {
    setLoadingSocials(true);
    try {
      const res = await fetch('/api/socials');
      const json = await res.json();
      if (json.success && json.data) {
        setSocialForm((prev) => ({ ...prev, ...json.data }));
      }
    } catch (err) {
      console.error('Failed to load social links:', err);
    } finally {
      setLoadingSocials(false);
    }
  };

  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocials(true);
    try {
      const res = await fetch('/api/socials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(socialForm),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.isTableMissing) {
          setSocialTableMissing(true);
        }
        throw new Error(json.error || 'Failed to update social channels');
      }
      setSocialTableMissing(false);
      notify('success', 'Social media channels saved successfully!');
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSavingSocials(false);
    }
  };

  // --------------------------------------------------------------------------
  // FILE UPLOAD HANDLERS
  // --------------------------------------------------------------------------
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

  const unreadInquiriesCount = inquiriesList.filter((i) => i.status === 'unread').length;

  return (
    <div className={styles.adminLayout}>
      <MobileTopBar
        activeTab={activeTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setShowCreateDrawer={setShowCreateDrawer}
        showsCount={showsList.length}
        mediaCount={mediaList.length}
        inquiriesCount={inquiriesList.length}
        unreadInquiriesCount={unreadInquiriesCount}
      />

      <main className={styles.mainContent} id="admin-main-scroll">
        <div id="admin-main-scroll-content" className={styles.mainContentInner}>
          {activeTab === 'dashboard' && (
            <DashboardTab
              showsList={showsList}
              mediaList={mediaList}
              inquiriesList={inquiriesList}
              analyticsData={analyticsData}
              connStatus={connStatus}
              testingConn={testingConn}
              checkConnection={checkConnection}
              loadShows={loadShows}
              loadMedia={loadMedia}
              loadInquiries={loadInquiries}
              loadAnalytics={loadAnalytics}
              setActiveTab={setActiveTab}
              setShowCreateDrawer={setShowCreateDrawer}
              unreadInquiriesCount={unreadInquiriesCount}
            />
          )}

          {activeTab === 'shows' && (
            <ShowsTab
              showsList={showsList}
              loadingShows={loadingShows}
              loadShows={loadShows}
              showCreateDrawer={showCreateDrawer}
              setShowCreateDrawer={setShowCreateDrawer}
              newShow={newShow}
              setNewShow={setNewShow}
              showUploading={showUploading}
              showUploadPreview={showUploadPreview}
              showFileInputRef={showFileInputRef}
              handleFileUpload={handleFileUpload}
              handleCreateShow={handleCreateShow}
              openEditShow={openEditShow}
              handleDeleteShow={handleDeleteShow}
            />
          )}

          {activeTab === 'media' && (
            <MediaTab
              mediaList={mediaList}
              loadingMedia={loadingMedia}
              loadMedia={loadMedia}
              showCreateDrawer={showCreateDrawer}
              setShowCreateDrawer={setShowCreateDrawer}
              newMedia={newMedia}
              setNewMedia={setNewMedia}
              mediaUploading={mediaUploading}
              mediaUploadPreview={mediaUploadPreview}
              mediaFileInputRef={mediaFileInputRef}
              handleFileUpload={handleFileUpload}
              handleCreateMedia={handleCreateMedia}
              openEditMedia={openEditMedia}
              handleDeleteMedia={handleDeleteMedia}
            />
          )}

          {activeTab === 'inquiries' && (
            <InquiriesTab
              inquiriesList={inquiriesList}
              loadingInquiries={loadingInquiries}
              loadInquiries={loadInquiries}
              inquiryFilter={inquiryFilter}
              setInquiryFilter={setInquiryFilter}
              selectedInquiry={selectedInquiry}
              setSelectedInquiry={setSelectedInquiry}
              handleUpdateInquiryStatus={handleUpdateInquiryStatus}
              handleDeleteInquiry={handleDeleteInquiry}
              unreadInquiriesCount={unreadInquiriesCount}
              notify={notify}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              analyticsData={analyticsData}
              loadingAnalytics={loadingAnalytics}
              loadAnalytics={loadAnalytics}
              handleResetAnalytics={handleResetAnalytics}
              notify={notify}
            />
          )}

          {activeTab === 'socials' && (
            <SocialsTab
              socialForm={socialForm}
              setSocialForm={setSocialForm}
              loadingSocials={loadingSocials}
              savingSocials={savingSocials}
              socialTableMissing={socialTableMissing}
              loadSocials={loadSocials}
              handleSaveSocials={handleSaveSocials}
              notify={notify}
            />
          )}
        </div>
      </main>

      {/* Edit Modals */}
      <EditShowModal
        editingShow={editingShow}
        setEditingShow={setEditingShow}
        editShowUploading={editShowUploading}
        editShowPreview={editShowPreview}
        editShowFileInputRef={editShowFileInputRef}
        handleEditFileUpload={handleEditFileUpload}
        handleUpdateShow={handleUpdateShow}
      />

      <EditMediaModal
        editingMedia={editingMedia}
        setEditingMedia={setEditingMedia}
        editMediaUploading={editMediaUploading}
        editMediaPreview={editMediaPreview}
        editMediaFileInputRef={editMediaFileInputRef}
        handleEditFileUpload={handleEditFileUpload}
        handleUpdateMedia={handleUpdateMedia}
      />

      {/* Global Notifications */}
      <NotificationToast notification={notification} />
    </div>
  );
}
