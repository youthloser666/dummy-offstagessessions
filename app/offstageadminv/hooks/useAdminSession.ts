import { useState, useEffect, useCallback, useRef } from 'react';
import { ADMIN_PASSKEY_FALLBACK } from '../constants/defaults';
import {
  checkAdminSession,
  logoutAdminSession,
} from '../services/consoleClientService';
import type { AdminUserPublic, NotifyHandler } from '../types';

export interface LoginCompletionPayload {
  user: AdminUserPublic;
  passkey: string;
}

export interface UseAdminSessionOptions {
  notify: NotifyHandler;
  onSessionAuthenticated?: (resolvedPasskey: string) => void;
}

export interface UseAdminSessionReturn {
  passkey: string;
  isAuthenticated: boolean | null;
  currentUser: AdminUserPublic | null;
  handleLoginSuccess: (payload: LoginCompletionPayload) => void;
  handleLogout: () => Promise<void>;
}

export function useAdminSession({
  notify,
  onSessionAuthenticated,
}: UseAdminSessionOptions): UseAdminSessionReturn {
  const [passkey, setPasskey] = useState<string>(ADMIN_PASSKEY_FALLBACK);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<AdminUserPublic | null>(null);

  // Store callback in a ref so session mount verification does not re-trigger when parent re-renders
  const onSessionAuthenticatedRef = useRef(onSessionAuthenticated);
  onSessionAuthenticatedRef.current = onSessionAuthenticated;

  useEffect(() => {
    const controller = new AbortController();

    const verifySession = async () => {
      try {
        const session = await checkAdminSession(controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        if (session.authenticated && session.user) {
          const resolvedPasskey = session.passkey || ADMIN_PASSKEY_FALLBACK;
          setIsAuthenticated(true);
          setCurrentUser(session.user);
          setPasskey(resolvedPasskey);
          onSessionAuthenticatedRef.current?.(resolvedPasskey);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setIsAuthenticated(false);
        }
      }
    };

    verifySession();
    return () => controller.abort();
  }, []);

  const handleLoginSuccess = useCallback((payload: LoginCompletionPayload) => {
    const resolvedPasskey = payload.passkey || ADMIN_PASSKEY_FALLBACK;
    setCurrentUser(payload.user);
    setPasskey(resolvedPasskey);
    setIsAuthenticated(true);
    onSessionAuthenticatedRef.current?.(resolvedPasskey);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logoutAdminSession();
    } catch {
      // Proceed with local session teardown even if cookie clear request fails
    }
    setCurrentUser(null);
    setPasskey(ADMIN_PASSKEY_FALLBACK);
    setIsAuthenticated(false);
    notify('success', 'Console session ended.');
  }, [notify]);

  return {
    passkey,
    isAuthenticated,
    currentUser,
    handleLoginSuccess,
    handleLogout,
  };
}
