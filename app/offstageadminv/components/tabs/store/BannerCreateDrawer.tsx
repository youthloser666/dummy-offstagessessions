'use client';

import React from 'react';
import type { ShopBannerFormDraft } from '../../../types';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';
import { BannerFormFields } from './BannerFormFields';

interface BannerCreateDrawerProps {
  draft: ShopBannerFormDraft;
  desktopPreviewUrl: string | null;
  mobilePreviewUrl: string | null;
  isDesktopUploading: boolean;
  isMobileUploading: boolean;
  onChange: (updatedDraft: ShopBannerFormDraft) => void;
  onUploadDesktop: (file: File) => void;
  onUploadMobile: (file: File) => void;
  onClearDesktop: () => void;
  onClearMobile: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}

export function BannerCreateDrawer({
  draft,
  desktopPreviewUrl,
  mobilePreviewUrl,
  isDesktopUploading,
  isMobileUploading,
  onChange,
  onUploadDesktop,
  onUploadMobile,
  onClearDesktop,
  onClearMobile,
  onSubmit,
  onCancel,
}: BannerCreateDrawerProps) {
  const handleFieldChange = <K extends keyof ShopBannerFormDraft>(
    field: K,
    value: ShopBannerFormDraft[K]
  ) => {
    onChange({
      ...draft,
      [field]: value,
    });
  };

  return (
    <div className={`${shellStyles.card} ${overviewStyles.drawerCardSpaced}`}>
      <div className={shellStyles.cardHeader}>
        <div>
          <h3 className={shellStyles.cardTitle}>Create Shop Hero Banner</h3>
          <p className={shellStyles.cardSubtitle}>
            Configure desktop &amp; mobile editorial banner assets for the storefront carousel
          </p>
        </div>

        <button type="button" className={shellStyles.btnSecondary} onClick={onCancel}>
          Close
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <BannerFormFields
          values={draft}
          desktopPreviewUrl={desktopPreviewUrl}
          mobilePreviewUrl={mobilePreviewUrl}
          isDesktopUploading={isDesktopUploading}
          isMobileUploading={isMobileUploading}
          activeCheckboxLabel="Publish / Active immediately on Shop Carousel"
          onFieldChange={handleFieldChange}
          onUploadDesktop={onUploadDesktop}
          onUploadMobile={onUploadMobile}
          onClearDesktop={onClearDesktop}
          onClearMobile={onClearMobile}
        />

        <div className={shellStyles.modalFooter}>
          <button type="button" className={shellStyles.btnSecondary} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="submit"
            className={shellStyles.btnPrimary}
            disabled={isDesktopUploading || isMobileUploading}
          >
            {isDesktopUploading || isMobileUploading ? 'Uploading Assets...' : 'Publish Banner'}
          </button>
        </div>
      </form>
    </div>
  );
}

