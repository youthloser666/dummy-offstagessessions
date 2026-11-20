import { ADMIN_PASSKEY_FALLBACK } from '../constants/defaults';
import { requestAdminJson } from './adminHttpClient';
import type {
  AdminRole,
  AdminUserPublic,
  AnalyticsData,
  IdentifiedAdminPreview,
  Inquiry,
  MediaFormDraft,
  MediaItem,
  ServiceConnectionDiagnostics,
  ShopBanner,
  ShopBannerFormDraft,
  ShopifyProductItem,
  Show,
  SocialForm,
} from '../types';

export interface AdminSessionCheckResponse {
  authenticated: boolean;
  user: AdminUserPublic | null;
  passkey?: string;
  error?: string;
}

export interface LoginCredentialsStepResponse {
  success: boolean;
  step: 2;
  challengeToken: string;
  user: IdentifiedAdminPreview;
}

export interface LoginPinStepResponse {
  success: boolean;
  sessionToken: string;
  user: AdminUserPublic;
  passkey: string;
}

export interface CreateShowPayload {
  name: string;
  subtitle?: string;
  date_code?: string;
  date_formatted?: string;
  event_date?: string;
  venue: string;
  time?: string;
  poster_url: string;
  tags: string[];
  featured?: boolean;
  month?: string;
  posh_url?: string;
  status: string;
}

export interface UpdateShowPayload extends Partial<CreateShowPayload> {
  id: string;
}

export interface UpdateMediaPayload extends Partial<MediaFormDraft> {
  id: string | number;
}

export interface UpdateShopBannerPayload extends Partial<ShopBannerFormDraft> {
  id: string;
}

export interface CreateAdminUserPayload {
  username: string;
  name: string;
  role: AdminRole;
  password: string;
  pin: string;
}

interface DataEnvelope<TData> {
  success: boolean;
  data: TData;
  message?: string;
}

interface MessageEnvelope {
  success: boolean;
  message?: string;
}

interface ShopifyProductsEnvelope {
  success: boolean;
  products: ShopifyProductItem[];
}

interface AdminUsersEnvelope {
  success: boolean;
  admins: AdminUserPublic[];
}

interface AdminUserCreatedEnvelope {
  success: boolean;
  message?: string;
  admin: AdminUserPublic;
}

export function checkAdminSession(signal?: AbortSignal): Promise<AdminSessionCheckResponse> {
  return requestAdminJson<AdminSessionCheckResponse>('/api/admin/auth/me', {
    signal,
    requireSuccessFlag: false,
    fallbackErrorMessage: 'Failed to verify console session.',
  });
}

export function submitLoginCredentialsStep(
  username: string,
  password: string
): Promise<LoginCredentialsStepResponse> {
  return requestAdminJson<LoginCredentialsStepResponse>('/api/admin/auth/login', {
    method: 'POST',
    body: { step: 1, username, password },
    fallbackErrorMessage: 'Authentication failed. Please verify your credentials.',
  });
}

export function submitLoginPinStep(
  challengeToken: string,
  pin: string
): Promise<LoginPinStepResponse> {
  return requestAdminJson<LoginPinStepResponse>('/api/admin/auth/login', {
    method: 'POST',
    body: { step: 2, challengeToken, pin },
    fallbackErrorMessage: 'Incorrect PIN code.',
  });
}

export function logoutAdminSession(): Promise<MessageEnvelope> {
  return requestAdminJson<MessageEnvelope>('/api/admin/auth/logout', {
    method: 'POST',
    fallbackErrorMessage: 'Failed to log out.',
  });
}

export function fetchConnectionDiagnostics(
  signal?: AbortSignal
): Promise<ServiceConnectionDiagnostics> {
  return requestAdminJson<ServiceConnectionDiagnostics>('/api/test-connection', {
    signal,
    requireSuccessFlag: false,
    fallbackErrorMessage: 'Failed to run connection diagnostics.',
  });
}

export async function fetchShowsList(signal?: AbortSignal): Promise<Show[]> {
  const response = await requestAdminJson<DataEnvelope<Show[]>>('/api/shows', {
    signal,
    fallbackErrorMessage: 'Failed to load shows list',
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createShowRecord(
  payload: CreateShowPayload,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<Show> {
  const response = await requestAdminJson<DataEnvelope<Show>>('/api/shows', {
    method: 'POST',
    passkey,
    body: payload,
    fallbackErrorMessage: 'Failed to add show',
  });
  return response.data;
}

export async function updateShowRecord(
  payload: UpdateShowPayload,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<Show> {
  const response = await requestAdminJson<DataEnvelope<Show>>('/api/shows', {
    method: 'PUT',
    passkey,
    body: payload,
    fallbackErrorMessage: 'Update failed',
  });
  return response.data;
}

export function deleteShowRecord(
  showId: string,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<MessageEnvelope> {
  return requestAdminJson<MessageEnvelope>(`/api/shows?id=${encodeURIComponent(showId)}`, {
    method: 'DELETE',
    passkey,
    fallbackErrorMessage: 'Delete failed',
  });
}

export async function fetchMediaList(signal?: AbortSignal): Promise<MediaItem[]> {
  const response = await requestAdminJson<DataEnvelope<MediaItem[]>>('/api/media', {
    signal,
    fallbackErrorMessage: 'Failed to load media archives',
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createMediaRecord(
  payload: MediaFormDraft,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<MediaItem> {
  const response = await requestAdminJson<DataEnvelope<MediaItem>>('/api/media', {
    method: 'POST',
    passkey,
    body: payload,
    fallbackErrorMessage: 'Failed to create media',
  });
  return response.data;
}

export async function updateMediaRecord(
  payload: UpdateMediaPayload,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<MediaItem> {
  const response = await requestAdminJson<DataEnvelope<MediaItem>>('/api/media', {
    method: 'PUT',
    passkey,
    body: payload,
    fallbackErrorMessage: 'Update failed',
  });
  return response.data;
}

export function deleteMediaRecord(
  mediaId: string | number,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<MessageEnvelope> {
  return requestAdminJson<MessageEnvelope>(`/api/media?id=${encodeURIComponent(String(mediaId))}`, {
    method: 'DELETE',
    passkey,
    fallbackErrorMessage: 'Delete failed',
  });
}

export async function fetchShopBannersList(signal?: AbortSignal): Promise<ShopBanner[]> {
  const response = await requestAdminJson<DataEnvelope<ShopBanner[]>>('/api/shop-banners', {
    signal,
    fallbackErrorMessage: 'Failed to load shop banners',
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createShopBannerRecord(
  payload: ShopBannerFormDraft,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<ShopBanner> {
  const response = await requestAdminJson<DataEnvelope<ShopBanner>>('/api/shop-banners', {
    method: 'POST',
    passkey,
    body: payload,
    fallbackErrorMessage: 'Failed to create shop banner',
  });
  return response.data;
}

export async function updateShopBannerRecord(
  payload: UpdateShopBannerPayload,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<ShopBanner> {
  const response = await requestAdminJson<DataEnvelope<ShopBanner>>('/api/shop-banners', {
    method: 'PUT',
    passkey,
    body: payload,
    fallbackErrorMessage: 'Failed to update banner',
  });
  return response.data;
}

export function deleteShopBannerRecord(
  bannerId: string,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<MessageEnvelope> {
  return requestAdminJson<MessageEnvelope>(
    `/api/shop-banners?id=${encodeURIComponent(bannerId)}`,
    {
      method: 'DELETE',
      passkey,
      fallbackErrorMessage: 'Failed to delete banner',
    }
  );
}

export async function fetchShopifyProductsList(
  signal?: AbortSignal
): Promise<ShopifyProductItem[]> {
  const response = await requestAdminJson<ShopifyProductsEnvelope>('/api/shopify/products', {
    signal,
    fallbackErrorMessage: 'Failed to load Shopify products',
  });
  return Array.isArray(response.products) ? response.products : [];
}

export async function fetchInquiriesList(
  passkey: string = ADMIN_PASSKEY_FALLBACK,
  signal?: AbortSignal
): Promise<Inquiry[]> {
  const response = await requestAdminJson<DataEnvelope<Inquiry[]>>('/api/contact', {
    passkey,
    signal,
    fallbackErrorMessage: 'Failed to load inquiries',
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function updateInquiryStatus(
  id: string | number,
  status: string,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<Inquiry> {
  const response = await requestAdminJson<DataEnvelope<Inquiry>>('/api/contact', {
    method: 'PATCH',
    passkey,
    body: { id, status },
    fallbackErrorMessage: 'Failed to update status',
  });
  return response.data;
}

export function deleteInquiryRecord(
  id: string | number,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<MessageEnvelope> {
  return requestAdminJson<MessageEnvelope>(`/api/contact?id=${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
    passkey,
    fallbackErrorMessage: 'Failed to delete',
  });
}

export async function fetchTrafficAnalytics(
  passkey: string = ADMIN_PASSKEY_FALLBACK,
  signal?: AbortSignal
): Promise<AnalyticsData> {
  const response = await requestAdminJson<DataEnvelope<AnalyticsData>>('/api/analytics', {
    passkey,
    signal,
    fallbackErrorMessage: 'Failed to load analytics',
  });
  return response.data;
}

export function resetTrafficAnalytics(
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<MessageEnvelope> {
  return requestAdminJson<MessageEnvelope>('/api/analytics', {
    method: 'DELETE',
    passkey,
    fallbackErrorMessage: 'Failed to reset analytics',
  });
}

export async function fetchSocialChannelsConfig(
  signal?: AbortSignal
): Promise<Partial<SocialForm>> {
  const response = await requestAdminJson<DataEnvelope<Partial<SocialForm>>>('/api/socials', {
    signal,
    fallbackErrorMessage: 'Failed to load social links',
  });
  return response.data || {};
}

export async function saveSocialChannelsConfig(
  socialForm: SocialForm,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<SocialForm> {
  const response = await requestAdminJson<DataEnvelope<SocialForm>>('/api/socials', {
    method: 'PUT',
    passkey,
    body: socialForm,
    fallbackErrorMessage: 'Failed to update social channels',
  });
  return response.data;
}

export async function fetchAdminUsersList(
  passkey: string = ADMIN_PASSKEY_FALLBACK,
  signal?: AbortSignal
): Promise<AdminUserPublic[]> {
  const response = await requestAdminJson<AdminUsersEnvelope>('/api/admin/users', {
    passkey,
    signal,
    fallbackErrorMessage: 'Failed to fetch admin accounts',
  });
  return Array.isArray(response.admins) ? response.admins : [];
}

export async function createAdminUserRecord(
  payload: CreateAdminUserPayload,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<AdminUserCreatedEnvelope> {
  return requestAdminJson<AdminUserCreatedEnvelope>('/api/admin/users', {
    method: 'POST',
    passkey,
    body: payload,
    fallbackErrorMessage: 'Failed to create admin user',
  });
}

export function deleteAdminUserRecord(
  adminId: string,
  passkey: string = ADMIN_PASSKEY_FALLBACK
): Promise<MessageEnvelope> {
  return requestAdminJson<MessageEnvelope>(
    `/api/admin/users?id=${encodeURIComponent(adminId)}`,
    {
      method: 'DELETE',
      passkey,
      fallbackErrorMessage: 'Failed to delete admin.',
    }
  );
}

