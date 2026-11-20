'use client';

import React from 'react';
import type { ShopBanner, ShopBannerFormDraft } from '../../../types';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';
import storeStyles from '../../../styles/adminStore.module.css';
import { EditBannerModal } from '../../modals/EditBannerModal';
import { BannerCreateDrawer } from './BannerCreateDrawer';

interface BannersManagementSectionProps {
  banners: ShopBanner[];
  isLoadingBanners: boolean;
  isCreateDrawerOpen: boolean;
  setCreateDrawerOpen: (open: boolean) => void;
  newBannerDraft: ShopBannerFormDraft;
  setNewBannerDraft: (draft: ShopBannerFormDraft) => void;
  isCreateDesktopUploading: boolean;
  createDesktopPreviewUrl: string | null;
  setCreateDesktopPreviewUrl: (url: string | null) => void;
  uploadCreateDesktopBanner: (file: File) => void;
  isCreateMobileUploading: boolean;
  createMobilePreviewUrl: string | null;
  setCreateMobilePreviewUrl: (url: string | null) => void;
  uploadCreateMobileBanner: (file: File) => void;
  editingBanner: ShopBanner | null;
  setEditingBanner: (banner: ShopBanner | null) => void;
  isEditDesktopUploading: boolean;
  editDesktopPreviewUrl: string | null;
  setEditDesktopPreviewUrl: (url: string | null) => void;
  uploadEditDesktopBanner: (file: File) => void;
  isEditMobileUploading: boolean;
  editMobilePreviewUrl: string | null;
  setEditMobilePreviewUrl: (url: string | null) => void;
  uploadEditMobileBanner: (file: File) => void;
  onRefreshBanners: () => void;
  onCreateBanner: (event: React.FormEvent) => void;
  onOpenEditModal: (banner: ShopBanner) => void;
  onCloseEditModal: () => void;
  onUpdateBanner: (event: React.FormEvent) => void;
  onDeleteBanner: (bannerId: string, title: string) => void;
  onToggleBannerActive: (banner: ShopBanner) => void;
}

export function BannersManagementSection({
  banners,
  isLoadingBanners,
  isCreateDrawerOpen,
  setCreateDrawerOpen,
  newBannerDraft,
  setNewBannerDraft,
  isCreateDesktopUploading,
  createDesktopPreviewUrl,
  setCreateDesktopPreviewUrl,
  uploadCreateDesktopBanner,
  isCreateMobileUploading,
  createMobilePreviewUrl,
  setCreateMobilePreviewUrl,
  uploadCreateMobileBanner,
  editingBanner,
  setEditingBanner,
  isEditDesktopUploading,
  editDesktopPreviewUrl,
  setEditDesktopPreviewUrl,
  uploadEditDesktopBanner,
  isEditMobileUploading,
  editMobilePreviewUrl,
  setEditMobilePreviewUrl,
  uploadEditMobileBanner,
  onRefreshBanners,
  onCreateBanner,
  onOpenEditModal,
  onCloseEditModal,
  onUpdateBanner,
  onDeleteBanner,
  onToggleBannerActive,
}: BannersManagementSectionProps) {
  return (
    <div>
      <div className={`${overviewStyles.rowBetween} ${overviewStyles.sectionSpaced}`}>
        <div className={overviewStyles.cellSecondaryText}>
          {banners.length} banner slide{banners.length === 1 ? '' : 's'} configured in slider
        </div>

        <div className={overviewStyles.rowGapSm}>
          <button
            type="button"
            className={shellStyles.btnSecondary}
            onClick={onRefreshBanners}
            disabled={isLoadingBanners}
          >
            Refresh Banners
          </button>
          <button
            type="button"
            className={shellStyles.btnPrimary}
            onClick={() => setCreateDrawerOpen(!isCreateDrawerOpen)}
          >
            {isCreateDrawerOpen ? 'Close Form' : '+ Add New Banner'}
          </button>
        </div>
      </div>

      {isCreateDrawerOpen && (
        <BannerCreateDrawer
          draft={newBannerDraft}
          desktopPreviewUrl={createDesktopPreviewUrl}
          mobilePreviewUrl={createMobilePreviewUrl}
          isDesktopUploading={isCreateDesktopUploading}
          isMobileUploading={isCreateMobileUploading}
          onChange={setNewBannerDraft}
          onUploadDesktop={uploadCreateDesktopBanner}
          onUploadMobile={uploadCreateMobileBanner}
          onClearDesktop={() => {
            setCreateDesktopPreviewUrl(null);
            setNewBannerDraft({ ...newBannerDraft, image_url: '' });
          }}
          onClearMobile={() => {
            setCreateMobilePreviewUrl(null);
            setNewBannerDraft({ ...newBannerDraft, mobile_image_url: '' });
          }}
          onSubmit={onCreateBanner}
          onCancel={() => setCreateDrawerOpen(false)}
        />
      )}

      <div className={`${shellStyles.card} ${shellStyles.cardFlush}`}>
        <div className={shellStyles.tableWrapper}>
          <table className={shellStyles.table}>
            <thead>
              <tr>
                <th>Preview (Desktop / Mobile)</th>
                <th>Banner Info</th>
                <th>Order</th>
                <th>Overlay Flags</th>
                <th>Status</th>
                <th className={shellStyles.tableActionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingBanners ? (
                [1, 2, 3].map((rowIndex) => (
                  <tr key={rowIndex} className={shellStyles.tableRow}>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarLg}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarMd}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                    <td className={shellStyles.tableActionsCell}>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                  </tr>
                ))
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className={shellStyles.tableEmptyCell}>
                    No shop hero banners configured. Click &apos;+ Add New Banner&apos; to publish one.
                  </td>
                </tr>
              ) : (
                banners.map((banner) => {
                  const isActive = banner.active !== false;
                  const hiddenFlags = [
                    banner.hide_title ? 'Title hidden' : null,
                    banner.hide_price ? 'Price hidden' : null,
                    banner.hide_button ? 'Button hidden' : null,
                  ].filter(Boolean);

                  return (
                    <tr key={banner.id} className={shellStyles.tableRow}>
                      <td>
                        <div className={storeStyles.bannerTableThumbs}>
                          {banner.image_url?.trim() ? (
                            <img
                              src={banner.image_url}
                              alt={banner.title || 'Desktop banner'}
                              className={storeStyles.bannerDesktopThumb}
                            />
                          ) : (
                            <span className={storeStyles.bannerNoDesktopThumb}>No Desktop</span>
                          )}
                          {banner.mobile_image_url?.trim() && (
                            <img
                              src={banner.mobile_image_url}
                              alt="Mobile portrait banner"
                              className={storeStyles.bannerMobileThumb}
                            />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={overviewStyles.cellPrimaryTitle}>
                          {banner.title || '(Image-Only Banner)'}
                        </div>
                        <div className={overviewStyles.cellPrimarySubtitle}>
                          {banner.category || 'Uncategorized'}
                          {banner.price ? ` · ${banner.price}` : ''}
                          {banner.link_url ? ` · ${banner.link_url}` : ''}
                        </div>
                      </td>
                      <td className={overviewStyles.codeText}>#{banner.display_order ?? 1}</td>
                      <td>
                        {hiddenFlags.length > 0 ? (
                          <span className={shellStyles.tagPill}>{hiddenFlags.join(' · ')}</span>
                        ) : (
                          <span className={overviewStyles.cellSecondaryText}>All overlays visible</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={storeStyles.bannerActiveToggleBtn}
                          onClick={() => onToggleBannerActive(banner)}
                          title="Click to toggle visibility"
                        >
                          <span
                            className={`${shellStyles.statusBadge} ${
                              isActive
                                ? shellStyles.statusBadgeActive
                                : shellStyles.statusBadgeDanger
                            }`}
                          >
                            {isActive ? 'Active' : 'Hidden'}
                          </span>
                        </button>
                      </td>
                      <td className={shellStyles.tableActionsCell}>
                        <div className={shellStyles.tableActionsRow}>
                          <button
                            type="button"
                            className={shellStyles.btnEdit}
                            onClick={() => onOpenEditModal(banner)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={shellStyles.btnDanger}
                            onClick={() => onDeleteBanner(banner.id, banner.title || 'Untitled Banner')}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditBannerModal
        banner={editingBanner}
        isUploadingDesktop={isEditDesktopUploading}
        isUploadingMobile={isEditMobileUploading}
        previewDesktopUrl={editDesktopPreviewUrl}
        previewMobileUrl={editMobilePreviewUrl}
        onClose={onCloseEditModal}
        onSubmit={onUpdateBanner}
        onUpdateBanner={(updated) => setEditingBanner(updated)}
        onUploadDesktop={uploadEditDesktopBanner}
        onUploadMobile={uploadEditMobileBanner}
        onClearDesktop={() => {
          setEditDesktopPreviewUrl(null);
          if (editingBanner) {
            setEditingBanner({ ...editingBanner, image_url: '' });
          }
        }}
        onClearMobile={() => {
          setEditMobilePreviewUrl(null);
          if (editingBanner) {
            setEditingBanner({ ...editingBanner, mobile_image_url: '' });
          }
        }}
      />
    </div>
  );
}

