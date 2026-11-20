import { useState, useCallback, useRef, useEffect } from 'react';
import type { NotificationState, NotifyHandler } from '../types';

export interface UseAdminNotificationReturn {
  notification: NotificationState | null;
  notify: NotifyHandler;
  clearNotification: () => void;
}

export function useAdminNotification(): UseAdminNotificationReturn {
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimeoutRef.current !== null) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
  }, []);

  const clearNotification = useCallback(() => {
    clearDismissTimer();
    setNotification(null);
  }, [clearDismissTimer]);

  const notify: NotifyHandler = useCallback(
    (type, message) => {
      clearDismissTimer();
      setNotification({ type, message });
      dismissTimeoutRef.current = setTimeout(() => {
        setNotification(null);
        dismissTimeoutRef.current = null;
      }, 4500);
    },
    [clearDismissTimer]
  );

  useEffect(() => clearDismissTimer, [clearDismissTimer]);

  return { notification, notify, clearNotification };
}

