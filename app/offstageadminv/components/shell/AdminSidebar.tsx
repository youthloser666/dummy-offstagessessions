'use client';

import React from 'react';
import styles from '../../styles/adminShell.module.css';
import type { AdminUserPublic, TabType } from '../../types';
import { SidebarNavIcon } from './SidebarNavIcon';

interface SidebarNavItemConfig {
  id: TabType;
  label: string;
  staticTag?: string;
}

const SIDEBAR_NAV_ITEMS: SidebarNavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'shows', label: 'Shows' },
  { id: 'media', label: 'Media Archives' },
  { id: 'store', label: 'Shopify Store' },
  { id: 'inquiries', label: 'Track Emails' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'metapixel', label: 'Meta Pixel & Ads' },
  { id: 'socials', label: 'Social Media' },
  { id: 'admins', label: 'Admin Access', staticTag: '2FA' },
];

interface AdminSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
  setIsShowCreateDrawerOpen: (isOpen: boolean) => void;
  unreadInquiriesCount: number;
  currentUser?: AdminUserPublic | null;
  onLogout?: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setMobileMenuOpen,
  setIsShowCreateDrawerOpen,
  unreadInquiriesCount,
  currentUser,
  onLogout,
}: AdminSidebarProps) {
  const handleSelectNavigationTab = (tab: TabType) => {
    setActiveTab(tab);
    setIsShowCreateDrawerOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <aside
      className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}
      data-lenis-prevent="true"
    >
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
            type="button"
            className={styles.sidebarCloseBtn}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close Sidebar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <div role="navigation" className={styles.navGroup} aria-label="Console Navigation">
          {SIDEBAR_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navItem} ${
                activeTab === item.id ? styles.navItemActive : ''
              }`}
              onClick={() => handleSelectNavigationTab(item.id)}
            >
              <div className={styles.navItemLeft}>
                <span className={styles.navIcon}>
                  <SidebarNavIcon tab={item.id} />
                </span>
                <span>{item.label}</span>
              </div>

              {item.id === 'inquiries' && unreadInquiriesCount > 0 && (
                <span className={styles.navBadge}>{unreadInquiriesCount} new</span>
              )}
              {item.staticTag && <span className={styles.navBadgeMuted}>{item.staticTag}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className={styles.sidebarFooter}>
        {currentUser && (
          <div className={styles.userProfileFooter}>
            <div className={styles.userProfileInfo}>
              <div className={styles.userProfileAvatarMini}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className={styles.userProfileNameMini} title={currentUser.name}>
                  {currentUser.name}
                </div>
                <div className={styles.userProfileRoleMini}>ADMIN</div>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                className={styles.logoutBtnMini}
                onClick={onLogout}
                title="Log out from console"
                aria-label="Log Out"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className={styles.passkeyBadge}>
          <span>Passkey</span>
          <span className={styles.passkeyVal}>active</span>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className={styles.footerActionLink}
        >
          <span>Live Website</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
