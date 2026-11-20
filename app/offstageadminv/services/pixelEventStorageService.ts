import type { PixelEventLogEntry } from '../types';

export const PIXEL_EVENT_LOGS_STORAGE_KEY = 'offstage_pixel_test_logs';
const MAX_STORED_PIXEL_LOGS = 50;

export function buildInitialPixelEventSeed(): PixelEventLogEntry[] {
  const todayLabel = new Date().toLocaleDateString();
  return [
    {
      id: 'init-1',
      name: 'PageView',
      type: 'standard',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
      date: todayLabel,
      params: { path: '/', referrer: 'Direct' },
      status: 'sent',
    },
    {
      id: 'init-2',
      name: 'ViewContent',
      type: 'standard',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toLocaleTimeString(),
      date: todayLabel,
      params: {
        content_name: 'Baltimore Warehouse Session #12',
        content_category: 'House, Techno',
      },
      status: 'sent',
    },
    {
      id: 'init-3',
      name: 'Lead',
      type: 'standard',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toLocaleTimeString(),
      date: todayLabel,
      params: {
        content_name: 'Contact & Booking Inquiry',
        content_category: 'Booking / VIP Table',
      },
      status: 'sent',
    },
  ];
}

export function readPixelEventLogs(): PixelEventLogEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const serialized = window.localStorage.getItem(PIXEL_EVENT_LOGS_STORAGE_KEY);
    if (serialized) {
      const parsed: unknown = JSON.parse(serialized);
      if (Array.isArray(parsed)) {
        return parsed as PixelEventLogEntry[];
      }
    }

    const seededLogs = buildInitialPixelEventSeed();
    window.localStorage.setItem(PIXEL_EVENT_LOGS_STORAGE_KEY, JSON.stringify(seededLogs));
    return seededLogs;
  } catch {
    return [];
  }
}

export function writePixelEventLogs(logs: PixelEventLogEntry[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const cappedLogs = logs.slice(0, MAX_STORED_PIXEL_LOGS);
    window.localStorage.setItem(PIXEL_EVENT_LOGS_STORAGE_KEY, JSON.stringify(cappedLogs));
  } catch {
    // Ignore storage quota or private browsing errors cleanly
  }
}

export function clearStoredPixelEventLogs(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(PIXEL_EVENT_LOGS_STORAGE_KEY);
  } catch {
    // Ignore storage errors cleanly
  }
}

