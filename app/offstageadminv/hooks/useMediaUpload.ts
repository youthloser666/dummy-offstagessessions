import { useState, useCallback, useRef } from 'react';
import {
  uploadAdminMediaImage,
  type AdminUploadFolder,
} from '../services/adminMediaUploadService';
import { extractErrorMessage } from '../utils/errorHelpers';
import type { NotifyHandler } from '../types';

export interface UseMediaUploadOptions {
  folder: AdminUploadFolder;
  passkey: string;
  notify?: NotifyHandler;
  successMessage: string;
  failureMessage: string;
  onUploaded?: (uploadedUrl: string) => void;
}

export interface UseMediaUploadReturn {
  isUploading: boolean;
  previewUrl: string | null;
  setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
  uploadFile: (file: File) => Promise<string | null>;
}

export function useMediaUpload({
  folder,
  passkey,
  notify,
  successMessage,
  failureMessage,
  onUploaded,
}: UseMediaUploadOptions): UseMediaUploadReturn {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onUploadedRef = useRef(onUploaded);
  onUploadedRef.current = onUploaded;

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      if (!file) {
        return null;
      }
      setIsUploading(true);
      try {
        const uploadedUrl = await uploadAdminMediaImage(file, folder, passkey);
        setPreviewUrl(uploadedUrl);
        onUploadedRef.current?.(uploadedUrl);
        notify?.('success', successMessage);
        return uploadedUrl;
      } catch (error: unknown) {
        notify?.('error', extractErrorMessage(error, failureMessage));
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [folder, passkey, notify, successMessage, failureMessage]
  );

  return {
    isUploading,
    previewUrl,
    setPreviewUrl,
    uploadFile,
  };
}

