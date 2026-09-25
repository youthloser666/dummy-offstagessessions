'use client';

import React from 'react';
import styles from '../admin.module.css';
import { TabType } from '../types';

interface MobileTopBarProps {
  activeTab: TabType;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function MobileTopBar({
  activeTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}: MobileTopBarProps) {
  return (
    <>
      <div className={styles.mobileTopBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
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
        <div style={{ fontSize: 12, color: '#86868b', textTransform: 'capitalize' }}>
          {activeTab}
        </div>
      </div>

      {/* Mobile Backdrop - only visible when drawer is open */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileBackdrop}
          style={{ display: 'block' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
