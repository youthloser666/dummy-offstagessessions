import type { AdminCreationDraft } from '../types';

export interface ValidatedAdminCreationPayload {
  username: string;
  name: string;
  role: AdminCreationDraft['role'];
  password: string;
  pin: string;
}

export type AdminCreationValidationResult =
  | { isValid: true; payload: ValidatedAdminCreationPayload }
  | { isValid: false; errorMessage: string };

export function validateAdminCreationInput(
  draft: AdminCreationDraft
): AdminCreationValidationResult {
  const cleanUsername = draft.username.trim().toLowerCase();
  const cleanName = draft.name.trim();
  const cleanPin = draft.pin.trim();

  if (!cleanUsername || cleanUsername.length < 3) {
    return {
      isValid: false,
      errorMessage: 'Username must be at least 3 characters.',
    };
  }
  if (!cleanName) {
    return {
      isValid: false,
      errorMessage: 'Full name is required.',
    };
  }
  if (!draft.password || draft.password.length < 6) {
    return {
      isValid: false,
      errorMessage: 'Password must be at least 6 characters.',
    };
  }
  if (draft.password !== draft.confirmPassword) {
    return {
      isValid: false,
      errorMessage: 'Passwords do not match.',
    };
  }
  if (!/^\d{4,6}$/.test(cleanPin)) {
    return {
      isValid: false,
      errorMessage: 'Security PIN must be between 4 and 6 numeric digits (0-9).',
    };
  }
  if (cleanPin !== draft.confirmPin.trim()) {
    return {
      isValid: false,
      errorMessage: 'Numeric PINs do not match.',
    };
  }

  return {
    isValid: true,
    payload: {
      username: cleanUsername,
      name: cleanName,
      role: draft.role,
      password: draft.password,
      pin: cleanPin,
    },
  };
}

