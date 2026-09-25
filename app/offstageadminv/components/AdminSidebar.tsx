'use client';

import React from 'react';
import styles from '../admin.module.css';
import { TabType } from '../types';

interface AdminSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setShowCreateDrawer: (open: boolean) => void;
  showsCount: number;
  mediaCount: number;
  inquiriesCount: number;
  unreadInquiriesCount: number;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  setShowCreateDrawer,
  showsCount,
  mediaCount,
  inquiriesCount,
  unreadInquiriesCount,
}: AdminSidebarProps) {
  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    setShowCreateDrawer(false);
    setMobileMenuOpen(false);
  };

  return (
    <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ''}`} data-lenis-prevent="true">
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

        {/* Nav Items */}
        <div className={styles.navGroup}>
          <button
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}
            onClick={() => handleNavClick('dashboard')}
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
            onClick={() => handleNavClick('shows')}
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
            <span className={styles.navBadge}>{showsCount}</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'media' ? styles.navItemActive : ''}`}
            onClick={() => handleNavClick('media')}
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
            <span className={styles.navBadge}>{mediaCount}</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'inquiries' ? styles.navItemActive : ''}`}
            onClick={() => handleNavClick('inquiries')}
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
              <span className={styles.navBadge}>{inquiriesCount}</span>
            )}
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'analytics' ? styles.navItemActive : ''}`}
            onClick={() => handleNavClick('analytics')}
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

          <button
            className={`${styles.navItem} ${activeTab === 'socials' ? styles.navItemActive : ''}`}
            onClick={() => handleNavClick('socials')}
          >
            <div className={styles.navItemLeft}>
              <span className={styles.navIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </span>
              <span>Social Media</span>
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
  );
}
