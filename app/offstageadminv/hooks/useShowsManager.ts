import { useState, useCallback, useEffect, useRef } from 'react';
import { createInitialShowDraft } from '../constants/defaults';
import {
  createShowRecord,
  deleteShowRecord,
  fetchShowsList,
  updateShowRecord,
} from '../services/consoleClientService';
import { confirmDestructiveAction } from '../utils/browserActions';
import { extractErrorMessage } from '../utils/errorHelpers';
import { useMediaUpload } from './useMediaUpload';
import type {
  NotifyHandler,
  Show,
  ShowEditDraft,
  ShowFormDraft,
} from '../types';

export interface UseShowsManagerOptions {
  passkey: string;
  notify: NotifyHandler;
  externalShowCreateDrawer?: boolean;
  setExternalShowCreateDrawer?: (open: boolean) => void;
  onShowsCountChange?: (count: number) => void;
}

export function useShowsManager({
  passkey,
  notify,
  externalShowCreateDrawer,
  setExternalShowCreateDrawer,
  onShowsCountChange,
}: UseShowsManagerOptions) {
  const [showsList, setShowsList] = useState<Show[]>([]);
  const [isLoadingShows, setIsLoadingShows] = useState<boolean>(true);
  const [isInternalDrawerOpen, setInternalDrawerOpen] = useState<boolean>(false);

  const isCreateDrawerOpen =
    externalShowCreateDrawer !== undefined ? externalShowCreateDrawer : isInternalDrawerOpen;
  const setCreateDrawerOpen = setExternalShowCreateDrawer || setInternalDrawerOpen;

  const [newShowDraft, setNewShowDraft] = useState<ShowFormDraft>(createInitialShowDraft);
  const [editingShow, setEditingShow] = useState<ShowEditDraft | null>(null);

  const countCallbackRef = useRef(onShowsCountChange);
  countCallbackRef.current = onShowsCountChange;

  const loadShows = useCallback(async () => {
    setIsLoadingShows(true);
    try {
      const shows = await fetchShowsList();
      setShowsList(shows);
      countCallbackRef.current?.(shows.length);
    } catch (error: unknown) {
      console.error('Failed to load shows:', error);
      notify('error', 'Failed to load shows list');
    } finally {
      setIsLoadingShows(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadShows();
  }, [loadShows]);

  const handleNewPosterUploaded = useCallback((uploadedUrl: string) => {
    setNewShowDraft((previous) => ({ ...previous, poster_url: uploadedUrl }));
  }, []);

  const handleEditPosterUploaded = useCallback((uploadedUrl: string) => {
    setEditingShow((previous) =>
      previous ? { ...previous, poster_url: uploadedUrl } : null
    );
  }, []);

  const createPosterUpload = useMediaUpload({
    folder: 'shows',
    passkey,
    notify,
    successMessage: 'Poster uploaded successfully',
    failureMessage: 'Failed to upload poster image',
    onUploaded: handleNewPosterUploaded,
  });

  const editPosterUpload = useMediaUpload({
    folder: 'shows',
    passkey,
    notify,
    successMessage: 'New poster uploaded',
    failureMessage: 'Failed to replace poster image',
    onUploaded: handleEditPosterUploaded,
  });

  const handleCreateShow = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!newShowDraft.poster_url) {
        notify('error', 'Please upload a poster image first.');
        return;
      }

      try {
        const parsedTags = newShowDraft.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

        await createShowRecord(
          {
            ...newShowDraft,
            tags: parsedTags,
          },
          passkey
        );

        notify('success', 'Show created successfully');
        setNewShowDraft({
          ...createInitialShowDraft(),
          month: 'September 2026',
        });
        createPosterUpload.setPreviewUrl(null);
        setCreateDrawerOpen(false);
        void loadShows();
      } catch (error: unknown) {
        notify('error', extractErrorMessage(error, 'Failed to add show'));
      }
    },
    [newShowDraft, passkey, notify, createPosterUpload, setCreateDrawerOpen, loadShows]
  );

  const openEditShowModal = useCallback(
    (show: Show) => {
      const resolvedPoster = show.poster_url || show.poster || '';
      setEditingShow({
        id: show.id,
        name: show.name || '',
        subtitle: show.subtitle || '',
        venue: show.venue || '',
        time: show.time || '',
        date_code: show.date_code || show.dateCode || '',
        date_formatted: show.date_formatted || show.dateFormatted || '',
        event_date: show.event_date || show.eventDate || '',
        poster_url: resolvedPoster,
        tags: Array.isArray(show.tags) ? show.tags.join(', ') : show.tags || '',
        featured: Boolean(show.featured),
        month: show.month || 'August 2026',
        posh_url: show.posh_url || show.poshUrl || show.ticket_url || show.ticketUrl || '',
        status: show.status || 'upcoming',
      });
      editPosterUpload.setPreviewUrl(resolvedPoster || null);
    },
    [editPosterUpload]
  );

  const closeEditShowModal = useCallback(() => {
    setEditingShow(null);
  }, []);

  const handleUpdateShow = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!editingShow) {
        return;
      }

      try {
        const parsedTags = editingShow.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

        await updateShowRecord(
          {
            ...editingShow,
            tags: parsedTags,
          },
          passkey
        );

        notify('success', `Show "${editingShow.name}" updated successfully`);
        setEditingShow(null);
        editPosterUpload.setPreviewUrl(null);
        void loadShows();
      } catch (error: unknown) {
        notify('error', extractErrorMessage(error, 'Failed to update show'));
      }
    },
    [editingShow, passkey, notify, editPosterUpload, loadShows]
  );

  const handleDeleteShow = useCallback(
    async (showId: string, showName: string) => {
      const isConfirmed = confirmDestructiveAction(
        `Delete show "${showName}"? This action will remove it from database.`
      );
      if (!isConfirmed) {
        return;
      }

      try {
        await deleteShowRecord(showId, passkey);
        notify('success', `Show "${showName}" deleted`);
        void loadShows();
      } catch (error: unknown) {
        notify('error', extractErrorMessage(error, 'Failed to delete show'));
      }
    },
    [passkey, notify, loadShows]
  );

  return {
    showsList,
    isLoadingShows,
    isCreateDrawerOpen,
    setCreateDrawerOpen,
    newShowDraft,
    setNewShowDraft,
    isCreatingPosterUploading: createPosterUpload.isUploading,
    createPosterPreviewUrl: createPosterUpload.previewUrl,
    uploadNewShowPoster: createPosterUpload.uploadFile,
    editingShow,
    setEditingShow,
    isEditingPosterUploading: editPosterUpload.isUploading,
    editPosterPreviewUrl: editPosterUpload.previewUrl,
    uploadEditShowPoster: editPosterUpload.uploadFile,
    loadShows,
    handleCreateShow,
    openEditShowModal,
    closeEditShowModal,
    handleUpdateShow,
    handleDeleteShow,
  };
}
