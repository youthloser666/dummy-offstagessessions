import { useState, useCallback, useEffect, useRef } from 'react';
import { createInitialMediaDraft } from '../constants/defaults';
import {
  createMediaRecord,
  deleteMediaRecord,
  fetchMediaList,
  updateMediaRecord,
} from '../services/consoleClientService';
import { confirmDestructiveAction } from '../utils/browserActions';
import { extractErrorMessage } from '../utils/errorHelpers';
import { useMediaUpload } from './useMediaUpload';
import type {
  MediaEditDraft,
  MediaFormDraft,
  MediaItem,
  NotifyHandler,
} from '../types';

export interface UseMediaArchivesManagerOptions {
  passkey: string;
  notify: NotifyHandler;
  onMediaCountChange?: (count: number) => void;
}

export function useMediaArchivesManager({
  passkey,
  notify,
  onMediaCountChange,
}: UseMediaArchivesManagerOptions) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState<boolean>(true);
  const [isCreateDrawerOpen, setCreateDrawerOpen] = useState<boolean>(false);

  const [newMediaDraft, setNewMediaDraft] = useState<MediaFormDraft>(createInitialMediaDraft);
  const [editingMedia, setEditingMedia] = useState<MediaEditDraft | null>(null);

  const countCallbackRef = useRef(onMediaCountChange);
  countCallbackRef.current = onMediaCountChange;

  const loadMedia = useCallback(async () => {
    setIsLoadingMedia(true);
    try {
      const items = await fetchMediaList();
      setMediaList(items);
      countCallbackRef.current?.(items.length);
    } catch (error: unknown) {
      console.error('Failed to load media:', error);
      notify('error', 'Failed to load media archives');
    } finally {
      setIsLoadingMedia(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadMedia();
  }, [loadMedia]);

  const handleNewThumbnailUploaded = useCallback((uploadedUrl: string) => {
    setNewMediaDraft((previous) => ({ ...previous, thumbnail_url: uploadedUrl }));
  }, []);

  const handleEditThumbnailUploaded = useCallback((uploadedUrl: string) => {
    setEditingMedia((previous) =>
      previous ? { ...previous, thumbnail_url: uploadedUrl } : null
    );
  }, []);

  const createThumbnailUpload = useMediaUpload({
    folder: 'media',
    passkey,
    notify,
    successMessage: 'Thumbnail uploaded successfully',
    failureMessage: 'Failed to upload image',
    onUploaded: handleNewThumbnailUploaded,
  });

  const editThumbnailUpload = useMediaUpload({
    folder: 'media',
    passkey,
    notify,
    successMessage: 'New thumbnail uploaded',
    failureMessage: 'Failed to upload image',
    onUploaded: handleEditThumbnailUploaded,
  });

  const handleCreateMedia = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!newMediaDraft.thumbnail_url) {
        notify('error', 'Please upload a thumbnail image first.');
        return;
      }

      try {
        await createMediaRecord(newMediaDraft, passkey);
        notify('success', 'Media archive item added');
        setNewMediaDraft(createInitialMediaDraft());
        createThumbnailUpload.setPreviewUrl(null);
        setCreateDrawerOpen(false);
        void loadMedia();
      } catch (error: unknown) {
        notify('error', extractErrorMessage(error, 'Failed to add media'));
      }
    },
    [newMediaDraft, passkey, notify, createThumbnailUpload, loadMedia]
  );

  const openEditMediaModal = useCallback(
    (media: MediaItem) => {
      const resolvedThumbnail =
        media.thumbnail_url || media.thumbnail || media.image_url || media.image || '';
      setEditingMedia({
        id: media.id,
        name: media.name || '',
        date: media.date || '',
        thumbnail_url: resolvedThumbnail,
        facebook_url: media.facebook_url || media.facebookUrl || '',
        category: media.category || 'photo',
        display_order: media.display_order !== undefined ? media.display_order : 0,
      });
      editThumbnailUpload.setPreviewUrl(
        media.thumbnail_url || media.thumbnail || media.image_url || null
      );
    },
    [editThumbnailUpload]
  );

  const closeEditMediaModal = useCallback(() => {
    setEditingMedia(null);
  }, []);

  const handleUpdateMedia = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!editingMedia) {
        return;
      }

      try {
        await updateMediaRecord(editingMedia, passkey);
        notify('success', `Media item "${editingMedia.name}" updated`);
        setEditingMedia(null);
        editThumbnailUpload.setPreviewUrl(null);
        void loadMedia();
      } catch (error: unknown) {
        notify('error', extractErrorMessage(error, 'Failed to update media archive'));
      }
    },
    [editingMedia, passkey, notify, editThumbnailUpload, loadMedia]
  );

  const handleDeleteMedia = useCallback(
    async (mediaId: string | number, mediaName: string) => {
      const isConfirmed = confirmDestructiveAction(
        `Delete "${mediaName}" from media archives?`
      );
      if (!isConfirmed) {
        return;
      }

      try {
        await deleteMediaRecord(mediaId, passkey);
        notify('success', `Media item "${mediaName}" deleted`);
        void loadMedia();
      } catch (error: unknown) {
        notify('error', extractErrorMessage(error, 'Failed to delete media'));
      }
    },
    [passkey, notify, loadMedia]
  );

  return {
    mediaList,
    isLoadingMedia,
    isCreateDrawerOpen,
    setCreateDrawerOpen,
    newMediaDraft,
    setNewMediaDraft,
    isCreatingThumbnailUploading: createThumbnailUpload.isUploading,
    createThumbnailPreviewUrl: createThumbnailUpload.previewUrl,
    uploadNewMediaThumbnail: createThumbnailUpload.uploadFile,
    editingMedia,
    setEditingMedia,
    isEditingThumbnailUploading: editThumbnailUpload.isUploading,
    editThumbnailPreviewUrl: editThumbnailUpload.previewUrl,
    uploadEditMediaThumbnail: editThumbnailUpload.uploadFile,
    loadMedia,
    handleCreateMedia,
    openEditMediaModal,
    closeEditMediaModal,
    handleUpdateMedia,
    handleDeleteMedia,
  };
}

