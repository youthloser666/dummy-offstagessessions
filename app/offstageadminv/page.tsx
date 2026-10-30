'use client';

import React, { useState, useEffect } from 'react';
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
  AdminUserPublic,
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
import MetaPixelTab from './components/tabs/MetaPixelTab';
import SocialsTab from './components/tabs/SocialsTab';
import StoreTab from './components/tabs/StoreTab';
import AdminsTab from './components/tabs/AdminsTab';

// Auth Login View
import AdminLoginView from './components/AdminLoginView';

export default function AdminPage() {
  const [passkey, setPasskey] = useState('offstage-session-admin-2026');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<AdminUserPublic | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  // Inquiries & Email Tracking State
  const [inquiriesList, setInquiriesList] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [inquiryFilter, setInquiryFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Shows overview state (shared with Dashboard & Sidebar)
  const [showsList, setShowsList] = useState<Show[]>([]);
  const [showsCount, setShowsCount] = useState<number>(0);

  // Media overview state (shared with Dashboard & Sidebar)
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [mediaCount, setMediaCount] = useState<number>(0);

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
  const [storeCount, setStoreCount] = useState<number>(0);

  // Notification & Service Connection States
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [connStatus, setConnStatus] = useState<any>(null);
  const [testingConn, setTestingConn] = useState(false);

  useEffect(() => {
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        if (data.passkey) setPasskey(data.passkey);
        // Load operational admin data
        loadShows();
        loadMedia();
        loadInquiries();
        loadAnalytics();
        loadSocials();
        loadStoreCount();
        checkConnection();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLoginSuccess = (data: { user: AdminUserPublic; passkey: string }) => {
    setCurrentUser(data.user);
    if (data.passkey) setPasskey(data.passkey);
    setIsAuthenticated(true);
    loadShows();
    loadMedia();
    loadInquiries();
    loadAnalytics();
    loadSocials();
    loadStoreCount();
    checkConnection();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // silent
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    notify('success', 'Console session ended.');
  };

  const loadStoreCount = async () => {
    try {
      const res = await fetch('/api/shopify/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setStoreCount(data.products.length);
      }
    } catch {
      // silent
    }
  };

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
  // SHOWS & MEDIA DATA LOADERS (for Dashboard & Sidebar counts)
  // --------------------------------------------------------------------------
  const loadShows = async () => {
    try {
      const res = await fetch('/api/shows');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setShowsList(json.data);
        setShowsCount(json.data.length);
      }
    } catch (err) {
      console.error('Failed to load shows:', err);
    }
  };

  const loadMedia = async () => {
    try {
      const res = await fetch('/api/media');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMediaList(json.data);
        setMediaCount(json.data.length);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    }
  };

  const handleShowsCountChange = React.useCallback((count: number) => {
    setShowsCount(count);
  }, []);

  const handleMediaCountChange = React.useCallback((count: number) => {
    setMediaCount(count);
  }, []);

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

  const unreadInquiriesCount = inquiriesList.filter((i) => i.status === 'unread').length;

  // Session verification loading state
  if (isAuthenticated === null) {
    return (
      <div className={styles.loginWrapper} style={{ flexDirection: 'column', gap: 16 }}>
        <div className={styles.loginAmbientGlow} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Offstage" className={styles.loginLogoImg} style={{ height: 32 }} />
        <div style={{ color: '#86868b', fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Verifying Console Session...
        </div>
      </div>
    );
  }

  // Not authenticated: Show login screen
  if (!isAuthenticated) {
    return (
      <>
        <AdminLoginView onLoginSuccess={handleLoginSuccess} notify={notify} />
        <NotificationToast notification={notification} />
      </>
    );
  }

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
        showsCount={showsCount || showsList.length}
        mediaCount={mediaCount || mediaList.length}
        storeCount={storeCount}
        inquiriesCount={inquiriesList.length}
        unreadInquiriesCount={unreadInquiriesCount}
        currentUser={currentUser}
        onLogout={handleLogout}
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
              passkey={passkey}
              notify={notify}
              showCreateDrawer={showCreateDrawer}
              setShowCreateDrawer={setShowCreateDrawer}
              onShowsCountChange={handleShowsCountChange}
            />
          )}

          {activeTab === 'media' && (
            <MediaTab
              passkey={passkey}
              notify={notify}
              onMediaCountChange={handleMediaCountChange}
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
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'metapixel' && (
            <MetaPixelTab
              inquiriesList={inquiriesList}
              analyticsData={analyticsData}
              notify={notify}
              setActiveTab={setActiveTab}
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

          {activeTab === 'store' && (
            <StoreTab passkey={passkey} notify={notify} />
          )}

          {activeTab === 'admins' && (
            <AdminsTab currentUser={currentUser} passkey={passkey} notify={notify} />
          )}
        </div>
      </main>

      {/* Global Notifications */}
      <NotificationToast notification={notification} />
    </div>
  );
}
