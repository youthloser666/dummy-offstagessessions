import { useState, useCallback, useEffect, useMemo } from 'react';
import { createInitialBannerDraft } from '../constants/defaults';
import {
  createShopBannerRecord,
  deleteShopBannerRecord,
  fetchShopBannersList,
  updateShopBannerRecord,
} from '../services/consoleClientService';
import { confirmDestructiveAction } from '../utils/browserActions';
import { extractErrorMessage } from '../utils/errorHelpers';
import { useMediaUpload } from './useMediaUpload';
import type {
  NotifyHandler,
  ShopBanner,
  ShopBannerFormDraft,
} from '../types';

export interface UseShopBannersManagerOptions {
  passkey: string;
  notify?: NotifyHandler;
}

export function useShopBannersManager({
  passkey,
  notify,
}: UseShopBannersManagerOptions) {
  const [banners, setBanners] = useState<ShopBanner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState<boolean>(true);
  const [isCreateBannerDrawerOpen, setCreateBannerDrawerOpen] = useState<boolean>(false);

  const [newBannerDraft, setNewBannerDraft] =
    useState<ShopBannerFormDraft>(createInitialBannerDraft);
  const [editingBanner, setEditingBanner] = useState<ShopBanner | null>(null);

  const loadBanners = useCallback(async () => {
    setIsLoadingBanners(true);
    try {
      const list = await fetchShopBannersList();
      setBanners(list);
    } catch (error: unknown) {
      console.error('Failed to load shop banners:', error);
      notify?.('error', 'Failed to load shop banners');
    } finally {
      setIsLoadingBanners(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  const handleNewDesktopUploaded = useCallback((uploadedUrl: string) => {
    setNewBannerDraft((previous) => ({ ...previous, image_url: uploadedUrl }));
  }, []);

  const handleNewMobileUploaded = useCallback((uploadedUrl: string) => {
    setNewBannerDraft((previous) => ({ ...previous, mobile_image_url: uploadedUrl }));
  }, []);

  const handleEditDesktopUploaded = useCallback((uploadedUrl: string) => {
    setEditingBanner((previous) =>
      previous ? { ...previous, image_url: uploadedUrl } : null
    );
  }, []);

  const handleEditMobileUploaded = useCallback((uploadedUrl: string) => {
    setEditingBanner((previous) =>
      previous ? { ...previous, mobile_image_url: uploadedUrl } : null
    );
  }, []);

  const createDesktopUpload = useMediaUpload({
    folder: 'shop-banners',
    passkey,
    notify,
    successMessage: 'Banner image uploaded successfully (Optimized WebP)',
    failureMessage: 'Failed to upload banner image',
    onUploaded: handleNewDesktopUploaded,
  });

  const createMobileUpload = useMediaUpload({
    folder: 'shop-banners',
    passkey,
    notify,
    successMessage: 'Mobile banner image uploaded successfully (Optimized WebP)',
    failureMessage: 'Failed to upload mobile banner image',
    onUploaded: handleNewMobileUploaded,
  });

  const editDesktopUpload = useMediaUpload({
    folder: 'shop-banners',
    passkey,
    notify,
    successMessage: 'New banner image uploaded',
    failureMessage: 'Failed to upload image',
    onUploaded: handleEditDesktopUploaded,
  });

  const editMobileUpload = useMediaUpload({
    folder: 'shop-banners',
    passkey,
    notify,
    successMessage: 'New mobile banner image uploaded',
    failureMessage: 'Failed to upload mobile banner image',
    onUploaded: handleEditMobileUploaded,
  });

  const handleCreateBanner = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!newBannerDraft.hide_title && !newBannerDraft.title.trim()) {
        notify?.('error', 'Please provide a banner title.');
        return;
      }

      const desktopImageUrl = newBannerDraft.image_url.trim();
      const mobileImageUrl = newBannerDraft.mobile_image_url.trim();
      if (!desktopImageUrl && !mobileImageUrl) {
        notify?.(
          'error',
          'Please upload or provide at least one banner image (Desktop or Mobile).'
        );
        return;
      }

      try {
        await createShopBannerRecord(
          {
            ...newBannerDraft,
            image_url: desktopImageUrl,
            mobile_image_url: mobileImageUrl,
          },
          passkey
        );

        notify?.(
          'success',
          `Banner "${newBannerDraft.title || 'Slide'}" created successfully!`
        );
        setNewBannerDraft({
          ...createInitialBannerDraft(),
          display_order: banners.length + 1,
        });
        createDesktopUpload.setPreviewUrl(null);
        createMobileUpload.setPreviewUrl(null);
        setCreateBannerDrawerOpen(false);
        void loadBanners();
      } catch (error: unknown) {
        notify?.('error', extractErrorMessage(error, 'Error creating banner'));
      }
    },
    [
      newBannerDraft,
      banners.length,
      passkey,
      notify,
      createDesktopUpload,
      createMobileUpload,
      loadBanners,
    ]
  );

  const openEditBannerModal = useCallback(
    (banner: ShopBanner) => {
      setEditingBanner({ ...banner });
      editDesktopUpload.setPreviewUrl(banner.image_url || null);
      editMobileUpload.setPreviewUrl(banner.mobile_image_url || null);
    },
    [editDesktopUpload, editMobileUpload]
  );

  const closeEditBannerModal = useCallback(() => {
    setEditingBanner(null);
  }, []);

  const handleUpdateBanner = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!editingBanner) {
        return;
      }

      const desktopImageUrl = (editingBanner.image_url || '').trim();
      const mobileImageUrl = (editingBanner.mobile_image_url || '').trim();
      if (!desktopImageUrl && !mobileImageUrl) {
        notify?.(
          'error',
          'Please upload or provide at least one banner image (Desktop or Mobile).'
        );
        return;
      }

      try {
        await updateShopBannerRecord(
          {
            ...editingBanner,
            image_url: desktopImageUrl,
            mobile_image_url: mobileImageUrl,
          },
          passkey
        );

        notify?.('success', `Banner "${editingBanner.title}" updated successfully!`);
        setEditingBanner(null);
        editDesktopUpload.setPreviewUrl(null);
        editMobileUpload.setPreviewUrl(null);
        void loadBanners();
      } catch (error: unknown) {
        notify?.('error', extractErrorMessage(error, 'Error updating banner'));
      }
    },
    [editingBanner, passkey, notify, editDesktopUpload, editMobileUpload, loadBanners]
  );

  const handleDeleteBanner = useCallback(
    async (bannerId: string, title: string) => {
      const isConfirmed = confirmDestructiveAction(
        `Are you sure you want to delete the banner "${title}"?`
      );
      if (!isConfirmed) {
        return;
      }

      try {
        await deleteShopBannerRecord(bannerId, passkey);
        notify?.('success', `Banner "${title}" deleted.`);
        void loadBanners();
      } catch (error: unknown) {
        notify?.('error', extractErrorMessage(error, 'Error deleting banner'));
      }
    },
    [passkey, notify, loadBanners]
  );

  const handleToggleBannerActive = useCallback(
    async (banner: ShopBanner) => {
      try {
        const nextActiveState = !banner.active;
        await updateShopBannerRecord({ id: banner.id, active: nextActiveState }, passkey);
        notify?.(
          'success',
          `Banner "${banner.title}" is now ${nextActiveState ? 'Active' : 'Hidden'}`
        );
        void loadBanners();
      } catch (error: unknown) {
        notify?.('error', extractErrorMessage(error, 'Failed to toggle banner status'));
      }
    },
    [passkey, notify, loadBanners]
  );

  const activeBannersCount = useMemo(
    () => banners.filter((banner) => banner.active !== false).length,
    [banners]
  );

  return {
    banners,
    activeBannersCount,
    isLoadingBanners,
    isCreateBannerDrawerOpen,
    setCreateBannerDrawerOpen,
    newBannerDraft,
    setNewBannerDraft,
    isCreateDesktopUploading: createDesktopUpload.isUploading,
    createDesktopPreviewUrl: createDesktopUpload.previewUrl,
    setCreateDesktopPreviewUrl: createDesktopUpload.setPreviewUrl,
    uploadCreateDesktopBanner: createDesktopUpload.uploadFile,
    isCreateMobileUploading: createMobileUpload.isUploading,
    createMobilePreviewUrl: createMobileUpload.previewUrl,
    setCreateMobilePreviewUrl: createMobileUpload.setPreviewUrl,
    uploadCreateMobileBanner: createMobileUpload.uploadFile,
    editingBanner,
    setEditingBanner,
    isEditDesktopUploading: editDesktopUpload.isUploading,
    editDesktopPreviewUrl: editDesktopUpload.previewUrl,
    setEditDesktopPreviewUrl: editDesktopUpload.setPreviewUrl,
    uploadEditDesktopBanner: editDesktopUpload.uploadFile,
    isEditMobileUploading: editMobileUpload.isUploading,
    editMobilePreviewUrl: editMobileUpload.previewUrl,
    setEditMobilePreviewUrl: editMobileUpload.setPreviewUrl,
    uploadEditMobileBanner: editMobileUpload.uploadFile,
    loadBanners,
    handleCreateBanner,
    openEditBannerModal,
    closeEditBannerModal,
    handleUpdateBanner,
    handleDeleteBanner,
    handleToggleBannerActive,
  };
}

