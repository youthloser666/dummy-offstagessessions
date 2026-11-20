'use client';

import React from 'react';
import type { ShopBanner, ShopBannerFormDraft } from '../../types';
import shellStyles from '../../styles/adminShell.module.css';
import storeStyles from '../../styles/adminStore.module.css';
import { BannerFormFields } from '../tabs/store/BannerFormFields';

interface EditBannerModalProps {
  banner: ShopBanner | null;
  isUploadingDesktop: boolean;
  isUploadingMobile: boolean;
  previewDesktopUrl: string | null;
  previewMobileUrl: string | null;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onUpdateBanner: (updatedBanner: ShopBanner) => void;
  onUploadDesktop: (file: File) => void;
  onUploadMobile: (file: File) => void;
  onClearDesktop: () => void;
  onClearMobile: () => void;
}

export function EditBannerModal({
  banner,
  isUploadingDesktop,
  isUploadingMobile,
  previewDesktopUrl,
  previewMobileUrl,
  onClose,
  onSubmit,
  onUpdateBanner,
  onUploadDesktop,
  onUploadMobile,
  onClearDesktop,
  onClearMobile,
}: EditBannerModalProps) {
  if (!banner) {
    return null;
  }

  const handleFieldChange = <K extends keyof ShopBannerFormDraft>(
    field: K,
    value: ShopBannerFormDraft[K]
  ) => {
    onUpdateBanner({
      ...banner,
      [field]: value,
    });
  };

  return (
    <div
      className={shellStyles.modalBackdrop}
      data-lenis-prevent="true"
      onClick={onClose}
    >
      <div
        className={`${shellStyles.modalContent} ${storeStyles.editBannerModalContent}`}
        data-lenis-prevent="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={shellStyles.modalHeader}>
          <h3 className={shellStyles.modalTitle}>Edit Shop Banner</h3>
          <button
            type="button"
            className={shellStyles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <BannerFormFields
            values={banner}
            desktopPreviewUrl={previewDesktopUrl}
            mobilePreviewUrl={previewMobileUrl}
            isDesktopUploading={isUploadingDesktop}
            isMobileUploading={isUploadingMobile}
            activeCheckboxLabel="Active &amp; Visible on Store Carousel"
            onFieldChange={handleFieldChange}
            onUploadDesktop={onUploadDesktop}
            onUploadMobile={onUploadMobile}
            onClearDesktop={onClearDesktop}
            onClearMobile={onClearMobile}
          />

          <div className={shellStyles.modalFooter}>
            <button type="button" className={shellStyles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={shellStyles.btnPrimary}
              disabled={isUploadingDesktop || isUploadingMobile}
            >
              Save Banner Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
