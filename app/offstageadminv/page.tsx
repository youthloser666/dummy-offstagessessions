'use client';

import React, { useState } from 'react';
import AdminLoginView from './components/auth/AdminLoginView';
import AdminSidebar from './components/shell/AdminSidebar';
import MobileTopBar from './components/shell/MobileTopBar';
import NotificationToast from './components/shell/NotificationToast';
import { AdminsTab } from './components/tabs/admins/AdminsTab';
import { AnalyticsTab } from './components/tabs/analytics/AnalyticsTab';
import { DashboardTab } from './components/tabs/dashboard/DashboardTab';
import { InquiriesTab } from './components/tabs/inquiries/InquiriesTab';
import { MediaTab } from './components/tabs/media/MediaTab';
import { MetaPixelTab } from './components/tabs/metapixel/MetaPixelTab';
import { ShowsTab } from './components/tabs/shows/ShowsTab';
import { SocialsTab } from './components/tabs/socials/SocialsTab';
import { StoreTab } from './components/tabs/store/StoreTab';
import { ADMIN_PASSKEY_FALLBACK } from './constants/defaults';
import { useAdminNotification } from './hooks/useAdminNotification';
import { useAdminSession } from './hooks/useAdminSession';
import { useConsoleOverviewData } from './hooks/useConsoleOverviewData';
import authStyles from './styles/adminAuth.module.css';
import shellStyles from './styles/adminShell.module.css';
import tokenStyles from './styles/adminTokens.module.css';
import type { TabType } from './types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isShowCreateDrawerOpen, setIsShowCreateDrawerOpen] = useState<boolean>(false);
  const [resolvedPasskey, setResolvedPasskey] = useState<string>(ADMIN_PASSKEY_FALLBACK);

  const { notification, notify } = useAdminNotification();

  const {
    inquiriesList,
    isLoadingInquiries,
    inquiryFilter,
    setInquiryFilter,
    selectedInquiry,
    setSelectedInquiry,
    unreadInquiriesCount,
    showsList,
    mediaList,
    storeProductsCount,
    analyticsData,
    isLoadingAnalytics,
    socialForm,
    setSocialForm,
    isLoadingSocials,
    isSavingSocials,
    isSocialTableMissing,
    connectionDiagnostics,
    isTestingConnection,
    checkConnection,
    loadShows,
    loadMedia,
    loadInquiries,
    loadAnalytics,
    loadSocials,
    loadConsoleOverview,
    handleUpdateInquiryStatus,
    handleDeleteInquiry,
    handleResetAnalytics,
    handleSaveSocials,
  } = useConsoleOverviewData({
    passkey: resolvedPasskey,
    notify,
  });

  const { passkey, isAuthenticated, currentUser, handleLoginSuccess, handleLogout } =
    useAdminSession({
      notify,
      onSessionAuthenticated: (nextPasskey) => {
        setResolvedPasskey(nextPasskey);
        loadConsoleOverview(nextPasskey);
      },
    });

  // Session verification loading state
  if (isAuthenticated === null) {
    return (
      <div className={tokenStyles.consoleThemeRoot}>
        <div className={`${authStyles.loginWrapper} ${authStyles.sessionSplash}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Offstage"
            className={`${authStyles.loginLogoImg} ${authStyles.loginLogoImgLarge}`}
          />
          <div className={authStyles.sessionSplashLabel}>Verifying Console Session...</div>
        </div>
      </div>
    );
  }

  // Not authenticated: Show login screen
  if (!isAuthenticated) {
    return (
      <div className={tokenStyles.consoleThemeRoot}>
        <AdminLoginView onLoginSuccess={handleLoginSuccess} notify={notify} />
        <NotificationToast notification={notification} />
      </div>
    );
  }

  return (
    <div className={`${tokenStyles.consoleThemeRoot} ${shellStyles.adminLayout}`}>
      <MobileTopBar
        activeTab={activeTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setIsShowCreateDrawerOpen={setIsShowCreateDrawerOpen}
        unreadInquiriesCount={unreadInquiriesCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className={shellStyles.mainContent} id="admin-main-scroll">
        <div id="admin-main-scroll-content" className={shellStyles.mainContentInner}>
          {activeTab === 'dashboard' && (
            <DashboardTab
              showsList={showsList}
              mediaList={mediaList}
              inquiriesList={inquiriesList}
              unreadInquiriesCount={unreadInquiriesCount}
              storeProductsCount={storeProductsCount}
              analyticsData={analyticsData}
              isLoadingAnalytics={isLoadingAnalytics}
              connectionDiagnostics={connectionDiagnostics}
              isTestingConnection={isTestingConnection}
              onTestConnection={() => {
                void checkConnection();
              }}
              onNavigateTab={setActiveTab}
              onQuickCreateShow={() => {
                setActiveTab('shows');
                setIsShowCreateDrawerOpen(true);
              }}
            />
          )}

          {activeTab === 'shows' && (
            <ShowsTab
              passkey={passkey}
              notify={notify}
              showCreateDrawer={isShowCreateDrawerOpen}
              setShowCreateDrawer={setIsShowCreateDrawerOpen}
              onShowsChange={() => {
                void loadShows();
              }}
            />
          )}

          {activeTab === 'media' && (
            <MediaTab
              passkey={passkey}
              notify={notify}
              onMediaChange={() => {
                void loadMedia();
              }}
            />
          )}

          {activeTab === 'inquiries' && (
            <InquiriesTab
              inquiriesList={inquiriesList}
              isLoadingInquiries={isLoadingInquiries}
              inquiryFilter={inquiryFilter}
              setInquiryFilter={setInquiryFilter}
              selectedInquiry={selectedInquiry}
              setSelectedInquiry={setSelectedInquiry}
              unreadCount={unreadInquiriesCount}
              onRefreshInquiries={() => {
                void loadInquiries(passkey);
              }}
              onUpdateStatus={(id, status) => {
                void handleUpdateInquiryStatus(id, status);
              }}
              onDeleteInquiry={(id) => {
                void handleDeleteInquiry(id);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              analyticsData={analyticsData}
              isLoadingAnalytics={isLoadingAnalytics}
              onRefreshAnalytics={() => {
                void loadAnalytics(passkey);
              }}
              onResetAnalytics={() => {
                void handleResetAnalytics();
              }}
            />
          )}

          {activeTab === 'metapixel' && (
            <MetaPixelTab analyticsData={analyticsData} notify={notify} />
          )}

          {activeTab === 'socials' && (
            <SocialsTab
              socialForm={socialForm}
              setSocialForm={setSocialForm}
              isLoadingSocials={isLoadingSocials}
              isSavingSocials={isSavingSocials}
              isSocialTableMissing={isSocialTableMissing}
              notify={notify}
              onReloadSocials={() => {
                void loadSocials();
              }}
              onSaveSocials={(event) => {
                void handleSaveSocials(event);
              }}
            />
          )}

          {activeTab === 'store' && <StoreTab passkey={passkey} notify={notify} />}

          {activeTab === 'admins' && (
            <AdminsTab currentUser={currentUser} passkey={passkey} notify={notify} />
          )}
        </div>
      </main>

      <NotificationToast notification={notification} />
    </div>
  );
}
