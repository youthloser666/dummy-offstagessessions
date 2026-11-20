import { useState, useCallback, useMemo, useRef } from 'react';
import { DEFAULT_SOCIAL_FORM } from '../constants/defaults';
import { AdminApiError } from '../services/adminHttpClient';
import {
  fetchConnectionDiagnostics,
  fetchInquiriesList,
  fetchMediaList,
  fetchShopifyProductsList,
  fetchShowsList,
  fetchSocialChannelsConfig,
  fetchTrafficAnalytics,
  deleteInquiryRecord,
  resetTrafficAnalytics,
  saveSocialChannelsConfig,
  updateInquiryStatus,
} from '../services/consoleClientService';
import { confirmDestructiveAction } from '../utils/browserActions';
import { extractErrorMessage } from '../utils/errorHelpers';
import type {
  AnalyticsData,
  Inquiry,
  InquiryFilterCriterion,
  MediaItem,
  NotifyHandler,
  ServiceConnectionDiagnostics,
  Show,
  SocialForm,
} from '../types';

export interface UseConsoleOverviewDataOptions {
  passkey: string;
  notify: NotifyHandler;
}

export function useConsoleOverviewData({
  passkey,
  notify,
}: UseConsoleOverviewDataOptions) {
  const passkeyRef = useRef(passkey);
  passkeyRef.current = passkey;

  const [inquiriesList, setInquiriesList] = useState<Inquiry[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState<boolean>(true);
  const [inquiryFilter, setInquiryFilter] = useState<InquiryFilterCriterion>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const [showsList, setShowsList] = useState<Show[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [storeProductsCount, setStoreProductsCount] = useState<number>(0);

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);

  const [socialForm, setSocialForm] = useState<SocialForm>(DEFAULT_SOCIAL_FORM);
  const [isLoadingSocials, setIsLoadingSocials] = useState<boolean>(false);
  const [isSavingSocials, setIsSavingSocials] = useState<boolean>(false);
  const [isSocialTableMissing, setIsSocialTableMissing] = useState<boolean>(false);

  const [connectionDiagnostics, setConnectionDiagnostics] =
    useState<ServiceConnectionDiagnostics | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);

  // Generation counters prevent out-of-order responses from overwriting fresher reloads
  const analyticsRequestIdRef = useRef(0);
  const inquiriesRequestIdRef = useRef(0);
  const connectionRequestIdRef = useRef(0);

  const checkConnection = useCallback(async () => {
    const requestId = ++connectionRequestIdRef.current;
    setIsTestingConnection(true);
    try {
      const diagnostics = await fetchConnectionDiagnostics();
      if (requestId === connectionRequestIdRef.current) {
        setConnectionDiagnostics(diagnostics);
      }
    } catch (error: unknown) {
      console.error('Failed to check connection:', error);
    } finally {
      if (requestId === connectionRequestIdRef.current) {
        setIsTestingConnection(false);
      }
    }
  }, []);

  const loadShows = useCallback(async () => {
    try {
      const shows = await fetchShowsList();
      setShowsList(shows);
    } catch (error: unknown) {
      console.error('Failed to load shows:', error);
    }
  }, []);

  const loadMedia = useCallback(async () => {
    try {
      const mediaItems = await fetchMediaList();
      setMediaList(mediaItems);
    } catch (error: unknown) {
      console.error('Failed to load media:', error);
    }
  }, []);

  const loadStoreCount = useCallback(async () => {
    try {
      const products = await fetchShopifyProductsList();
      setStoreProductsCount(products.length);
    } catch {
      // Silent overview count failure preserves console usability
    }
  }, []);

  const loadInquiries = useCallback(async (passkeyOverride?: string) => {
    const requestId = ++inquiriesRequestIdRef.current;
    setIsLoadingInquiries(true);
    try {
      const activePasskey = passkeyOverride ?? passkeyRef.current;
      const inquiries = await fetchInquiriesList(activePasskey);
      if (requestId === inquiriesRequestIdRef.current) {
        setInquiriesList(inquiries);
      }
    } catch (error: unknown) {
      console.error('Failed to load inquiries:', error);
    } finally {
      if (requestId === inquiriesRequestIdRef.current) {
        setIsLoadingInquiries(false);
      }
    }
  }, []);

  const loadAnalytics = useCallback(async (passkeyOverride?: string) => {
    const requestId = ++analyticsRequestIdRef.current;
    setIsLoadingAnalytics(true);
    try {
      const activePasskey = passkeyOverride ?? passkeyRef.current;
      const analytics = await fetchTrafficAnalytics(activePasskey);
      if (requestId === analyticsRequestIdRef.current) {
        setAnalyticsData(analytics);
      }
    } catch (error: unknown) {
      console.error('Failed to load analytics:', error);
    } finally {
      if (requestId === analyticsRequestIdRef.current) {
        setIsLoadingAnalytics(false);
      }
    }
  }, []);

  const loadSocials = useCallback(async () => {
    setIsLoadingSocials(true);
    try {
      const socialConfig = await fetchSocialChannelsConfig();
      setSocialForm((previous) => ({ ...previous, ...socialConfig }));
    } catch (error: unknown) {
      console.error('Failed to load social links:', error);
    } finally {
      setIsLoadingSocials(false);
    }
  }, []);

  const loadConsoleOverview = useCallback(
    (resolvedPasskey?: string) => {
      if (resolvedPasskey) {
        passkeyRef.current = resolvedPasskey;
      }
      void loadShows();
      void loadMedia();
      void loadInquiries(resolvedPasskey);
      void loadAnalytics(resolvedPasskey);
      void loadSocials();
      void loadStoreCount();
      void checkConnection();
    },
    [
      loadShows,
      loadMedia,
      loadInquiries,
      loadAnalytics,
      loadSocials,
      loadStoreCount,
      checkConnection,
    ]
  );

  const handleUpdateInquiryStatus = useCallback(
    async (id: string | number, nextStatus: string) => {
      try {
        await updateInquiryStatus(id, nextStatus, passkeyRef.current);
        notify('success', `Status updated to ${nextStatus}`);
        void loadInquiries();
      } catch (error: unknown) {
        notify('error', extractErrorMessage(error, 'Failed to update status'));
      }
    },
    [notify, loadInquiries]
  );

  const handleDeleteInquiry = useCallback(
    async (id: string | number) => {
      const isConfirmed = confirmDestructiveAction(
        'Delete this inquiry record? This action cannot be undone.'
      );
      if (!isConfirmed) {
        return;
      }
      try {
        await deleteInquiryRecord(id, passkeyRef.current);
        notify('success', 'Inquiry deleted');
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
        void loadInquiries();
      } catch (error: unknown) {
        notify('error', extractErrorMessage(error, 'Failed to delete'));
      }
    },
    [notify, selectedInquiry, loadInquiries]
  );

  const handleResetAnalytics = useCallback(async () => {
    const isConfirmed = confirmDestructiveAction(
      'RESET ALL TRAFFIC ANALYTICS?\n\nThis will permanently delete all visitor records, page view counts, and live streams from Supabase. Are you sure?'
    );
    if (!isConfirmed) {
      return;
    }
    setIsLoadingAnalytics(true);
    try {
      await resetTrafficAnalytics(passkeyRef.current);
      notify('success', 'All site traffic analytics have been reset');
      await loadAnalytics();
    } catch (error: unknown) {
      notify('error', extractErrorMessage(error, 'Failed to reset analytics'));
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [notify, loadAnalytics]);

  const handleSaveSocials = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsSavingSocials(true);
      try {
        await saveSocialChannelsConfig(socialForm, passkeyRef.current);
        setIsSocialTableMissing(false);
        notify('success', 'Social media channels saved successfully!');
      } catch (error: unknown) {
        if (error instanceof AdminApiError && error.isTableMissing) {
          setIsSocialTableMissing(true);
        }
        notify('error', extractErrorMessage(error, 'Failed to update social channels'));
      } finally {
        setIsSavingSocials(false);
      }
    },
    [socialForm, notify]
  );

  const unreadInquiriesCount = useMemo(
    () => inquiriesList.filter((inquiry) => inquiry.status === 'unread').length,
    [inquiriesList]
  );

  return {
    inquiriesList,
    isLoadingInquiries,
    inquiryFilter,
    setInquiryFilter,
    selectedInquiry,
    setSelectedInquiry,
    unreadInquiriesCount,
    showsList,
    mediaList,
    storeProductsCount,
    analyticsData,
    isLoadingAnalytics,
    socialForm,
    setSocialForm,
    isLoadingSocials,
    isSavingSocials,
    isSocialTableMissing,
    connectionDiagnostics,
    isTestingConnection,
    checkConnection,
    loadShows,
    loadMedia,
    loadInquiries,
    loadAnalytics,
    loadSocials,
    loadConsoleOverview,
    handleUpdateInquiryStatus,
    handleDeleteInquiry,
    handleResetAnalytics,
    handleSaveSocials,
  };
}
