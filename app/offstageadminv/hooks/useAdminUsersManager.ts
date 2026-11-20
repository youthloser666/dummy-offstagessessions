import { useState, useCallback, useEffect } from 'react';
import { createInitialAdminCreationDraft } from '../constants/defaults';
import {
  createAdminUserRecord,
  deleteAdminUserRecord,
  fetchAdminUsersList,
} from '../services/consoleClientService';
import { validateAdminCreationInput } from '../utils/adminValidation';
import { confirmDestructiveAction } from '../utils/browserActions';
import { extractErrorMessage } from '../utils/errorHelpers';
import type {
  AdminCreationDraft,
  AdminUserPublic,
  NotifyHandler,
} from '../types';

export interface UseAdminUsersManagerOptions {
  currentUser: AdminUserPublic | null;
  passkey: string;
  notify: NotifyHandler;
}

export function useAdminUsersManager({
  currentUser,
  passkey,
  notify,
}: UseAdminUsersManagerOptions) {
  const [adminsList, setAdminsList] = useState<AdminUserPublic[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState<boolean>(true);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);

  const [isAddModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [creationDraft, setCreationDraft] = useState<AdminCreationDraft>(
    createInitialAdminCreationDraft
  );
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadAdmins = useCallback(async () => {
    setIsLoadingAdmins(true);
    try {
      const admins = await fetchAdminUsersList(passkey);
      setAdminsList(admins);
    } catch (error: unknown) {
      notify('error', extractErrorMessage(error, 'Failed to load administrators'));
    } finally {
      setIsLoadingAdmins(false);
    }
  }, [passkey, notify]);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const resetCreationDraft = useCallback(() => {
    setCreationDraft(createInitialAdminCreationDraft());
    setIsPasswordVisible(false);
    setFormError(null);
  }, []);

  const openAddAdminModal = useCallback(() => {
    resetCreationDraft();
    setAddModalOpen(true);
  }, [resetCreationDraft]);

  const closeAddAdminModal = useCallback(() => {
    if (!isSubmitting) {
      setAddModalOpen(false);
    }
  }, [isSubmitting]);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((previous) => !previous);
  }, []);

  const handleCreateAdmin = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setFormError(null);

      const validation = validateAdminCreationInput(creationDraft);
      if (!validation.isValid) {
        setFormError(validation.errorMessage);
        return;
      }

      setIsSubmitting(true);
      try {
        await createAdminUserRecord(validation.payload, passkey);
        notify('success', `Admin "${validation.payload.username}" created successfully.`);
        setAddModalOpen(false);
        resetCreationDraft();
        void loadAdmins();
      } catch (error: unknown) {
        const message = extractErrorMessage(error, 'Failed to create admin');
        setFormError(message);
        notify('error', message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [creationDraft, passkey, notify, resetCreationDraft, loadAdmins]
  );

  const handleDeleteAdmin = useCallback(
    async (admin: AdminUserPublic) => {
      if (adminsList.length <= 1) {
        notify('error', 'Cannot delete the only remaining admin account.');
        return;
      }

      if (currentUser?.id === admin.id) {
        notify('error', 'You cannot delete your own active admin account while logged in.');
        return;
      }

      const isConfirmed = confirmDestructiveAction(
        `Are you sure you want to permanently delete admin account "${admin.name}" (@${admin.username})?`
      );
      if (!isConfirmed) {
        return;
      }

      setDeletingAdminId(admin.id);
      try {
        await deleteAdminUserRecord(admin.id, passkey);
        notify('success', `Admin "${admin.username}" has been removed.`);
        void loadAdmins();
      } catch (error: unknown) {
        notify('error', extractErrorMessage(error, 'Failed to delete admin account'));
      } finally {
        setDeletingAdminId(null);
      }
    },
    [adminsList.length, currentUser?.id, passkey, notify, loadAdmins]
  );

  return {
    adminsList,
    isLoadingAdmins,
    deletingAdminId,
    isAddModalOpen,
    creationDraft,
    setCreationDraft,
    isPasswordVisible,
    togglePasswordVisibility,
    formError,
    isSubmitting,
    loadAdmins,
    openAddAdminModal,
    closeAddAdminModal,
    handleCreateAdmin,
    handleDeleteAdmin,
  };
}

