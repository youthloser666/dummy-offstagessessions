import { ADMIN_PASSKEY_FALLBACK } from '../constants/defaults';
import { requestAdminJson } from './adminHttpClient';

export type AdminUploadFolder = 'shows' | 'media' | 'shop-banners' | 'offstage-sessions';

interface MediaUploadResponseEnvelope {
  success: boolean;
  url: string;
  publicId?: string;
  format?: string;
  optimized?: boolean;
  isOfflineFallback?: boolean;
  error?: string;
}

export async function uploadAdminMediaImage(
  file: File,
  folder: AdminUploadFolder,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await requestAdminJson<MediaUploadResponseEnvelope>('/api/upload', {
    method: 'POST',
    passkey,
    body: formData,
    fallbackErrorMessage: 'Upload failed',
  });

  if (!response.url) {
    throw new Error('Upload succeeded without returning a media URL.');
  }

  return response.url;
}

