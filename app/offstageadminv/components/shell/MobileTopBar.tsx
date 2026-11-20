'use client';

import React from 'react';
import styles from '../../styles/adminShell.module.css';
import type { TabType } from '../../types';

interface MobileTopBarProps {
  activeTab: TabType;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function MobileTopBar({
  activeTab,
  isMobileMenuOpen,
  setMobileMenuOpen,
}: MobileTopBarProps) {
  return (
    <>
      <div className={styles.mobileTopBar}>
        <div className={styles.mobileBrandGroup}>
          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
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
        <div className={styles.mobileActiveTabLabel}>
          {activeTab === 'admins' ? 'Admin Access (2FA)' : activeTab}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

