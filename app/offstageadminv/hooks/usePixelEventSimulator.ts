import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  trackAddToCart,
  trackContact,
  trackCustomEvent,
  trackInitiateCheckout,
  trackLead,
  trackPageView,
  trackSearch,
  trackViewContent,
} from '@/lib/analytics';
import { META_PIXEL_CONFIG } from '../constants/defaults';
import {
  clearStoredPixelEventLogs,
  readPixelEventLogs,
  writePixelEventLogs,
} from '../services/pixelEventStorageService';
import type { NotifyHandler, PixelEventFilter, PixelEventLogEntry } from '../types';
import { copyToClipboard } from '../utils/browserActions';
import { parseCustomPixelPayload } from '../utils/pixelPayloadParser';

export type SimulatableStandardPixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Lead'
  | 'Contact'
  | 'Search';

const DEFAULT_CUSTOM_PAYLOAD = '{"category": "music", "source": "admin"}';

export interface UsePixelEventSimulatorReturn {
  pixelId: string;
  gaMeasurementId: string;
  isFbqLoaded: boolean;
  hasCopiedPixelId: boolean;
  eventLogs: PixelEventLogEntry[];
  filteredEventLogs: PixelEventLogEntry[];
  eventFilter: PixelEventFilter;
  setEventFilter: (filter: PixelEventFilter) => void;
  customEventName: string;
  setCustomEventName: (value: string) => void;
  customEventPayload: string;
  setCustomEventPayload: (value: string) => void;
  handleCopyPixelId: () => Promise<void>;
  handleFireStandardEvent: (eventName: SimulatableStandardPixelEvent) => void;
  handleFireCustomEvent: (event: React.FormEvent) => void;
  handleClearEventLogs: () => void;
}

export function usePixelEventSimulator(notify: NotifyHandler): UsePixelEventSimulatorReturn {
  const [eventLogs, setEventLogs] = useState<PixelEventLogEntry[]>([]);
  const [eventFilter, setEventFilter] = useState<PixelEventFilter>('all');
  const [customEventName, setCustomEventName] = useState('');
  const [customEventPayload, setCustomEventPayload] = useState(DEFAULT_CUSTOM_PAYLOAD);
  const [hasCopiedPixelId, setHasCopiedPixelId] = useState(false);
  const [isFbqLoaded, setIsFbqLoaded] = useState(false);
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setEventLogs(readPixelEventLogs());
    setIsFbqLoaded(typeof window !== 'undefined' && typeof window.fbq === 'function');

    return () => {
      if (copyResetTimerRef.current !== null) {
        clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  const appendEventLog = useCallback(
    (name: string, type: 'standard' | 'custom', params?: Record<string, unknown>) => {
      const now = new Date();
      const status: PixelEventLogEntry['status'] =
        typeof window !== 'undefined' && typeof window.fbq === 'function' ? 'sent' : 'simulated';

      const newEntry: PixelEventLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        type,
        timestamp: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
        params,
        status,
      };

      setEventLogs((previousLogs) => {
        const updatedLogs = [newEntry, ...previousLogs];
        writePixelEventLogs(updatedLogs);
        return updatedLogs;
      });
    },
    []
  );

  const handleCopyPixelId = useCallback(async () => {
    const isCopied = await copyToClipboard(META_PIXEL_CONFIG.pixelId);
    if (!isCopied) {
      notify('error', 'Clipboard access is unavailable in this browser.');
      return;
    }

    setHasCopiedPixelId(true);
    notify('success', 'Copied Meta Pixel ID to clipboard');
    if (copyResetTimerRef.current !== null) {
      clearTimeout(copyResetTimerRef.current);
    }
    copyResetTimerRef.current = setTimeout(() => {
      setHasCopiedPixelId(false);
      copyResetTimerRef.current = null;
    }, 2000);
  }, [notify]);

  const handleFireStandardEvent = useCallback(
    (eventName: SimulatableStandardPixelEvent) => {
      switch (eventName) {
        case 'PageView': {
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
          trackPageView();
          appendEventLog('PageView', 'standard', { path: currentPath });
          notify('success', 'Fired Meta Pixel PageView event!');
          return;
        }
        case 'ViewContent': {
          const params = {
            content_name: 'Warehouse Session #12 — Special Showcase',
            content_category: 'House / Techno',
            content_ids: ['show-12'],
            value: 25.0,
            currency: 'USD',
          };
          trackViewContent(params);
          appendEventLog('ViewContent', 'standard', params);
          notify('success', 'Fired Meta Pixel ViewContent event!');
          return;
        }
        case 'AddToCart': {
          const params = {
            content_name: 'Offstage Heavyweight Club Hoodie',
            content_ids: ['merch-hoodie-blk'],
            content_type: 'product',
            value: 45.0,
            currency: 'USD',
          };
          trackAddToCart(params);
          appendEventLog('AddToCart', 'standard', params);
          notify('success', 'Fired Meta Pixel AddToCart event ($45.00 USD)!');
          return;
        }
        case 'InitiateCheckout': {
          const params = {
            content_ids: ['merch-hoodie-blk', 'merch-tee-01'],
            num_items: 2,
            value: 75.0,
            currency: 'USD',
          };
          trackInitiateCheckout(params);
          appendEventLog('InitiateCheckout', 'standard', params);
          notify('success', 'Fired Meta Pixel InitiateCheckout event ($75.00 USD)!');
          return;
        }
        case 'Lead': {
          const params = {
            content_name: 'VIP Table / Private Session Reservation',
            content_category: 'Inquiry',
            value: 150.0,
            currency: 'USD',
          };
          trackLead(params);
          appendEventLog('Lead', 'standard', params);
          notify('success', 'Fired Meta Pixel Lead conversion event!');
          return;
        }
        case 'Contact': {
          const params = {
            content_name: 'Artist & Booking Inquiry Direct Contact',
            content_category: 'Direct Email',
          };
          trackContact(params);
          appendEventLog('Contact', 'standard', params);
          notify('success', 'Fired Meta Pixel Contact event!');
          return;
        }
        case 'Search': {
          const searchString = 'Techno Baltimore';
          trackSearch(searchString);
          appendEventLog('Search', 'standard', { search_string: searchString });
          notify('success', 'Fired Meta Pixel Search event ("Techno Baltimore")!');
          return;
        }
      }
    },
    [appendEventLog, notify]
  );

  const handleFireCustomEvent = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const trimmedName = customEventName.trim();
      if (!trimmedName) {
        notify('error', 'Please enter a custom event name');
        return;
      }

      const parsedPayload = parseCustomPixelPayload(customEventPayload);
      trackCustomEvent(trimmedName, parsedPayload);
      appendEventLog(trimmedName, 'custom', parsedPayload);
      notify('success', `Fired Custom Meta Pixel event: "${trimmedName}"!`);
      setCustomEventName('');
    },
    [appendEventLog, customEventName, customEventPayload, notify]
  );

  const handleClearEventLogs = useCallback(() => {
    clearStoredPixelEventLogs();
    setEventLogs([]);
    notify('success', 'Cleared pixel event log history');
  }, [notify]);

  const filteredEventLogs = useMemo(() => {
    if (eventFilter === 'all') {
      return eventLogs;
    }
    return eventLogs.filter((entry) => entry.type === eventFilter);
  }, [eventFilter, eventLogs]);

  return {
    pixelId: META_PIXEL_CONFIG.pixelId,
    gaMeasurementId: META_PIXEL_CONFIG.gaMeasurementId,
    isFbqLoaded,
    hasCopiedPixelId,
    eventLogs,
    filteredEventLogs,
    eventFilter,
    setEventFilter,
    customEventName,
    setCustomEventName,
    customEventPayload,
    setCustomEventPayload,
    handleCopyPixelId,
    handleFireStandardEvent,
    handleFireCustomEvent,
    handleClearEventLogs,
  };
}

