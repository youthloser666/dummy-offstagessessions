import { useState, useEffect, useRef, useCallback } from 'react';
import {
  submitLoginCredentialsStep,
  submitLoginPinStep,
} from '../services/consoleClientService';
import { extractErrorMessage } from '../utils/errorHelpers';
import type {
  AdminUserPublic,
  IdentifiedAdminPreview,
  NotifyHandler,
} from '../types';

export interface UseAdminLoginFlowOptions {
  onLoginSuccess: (payload: { user: AdminUserPublic; passkey: string }) => void;
  notify?: NotifyHandler;
}

export interface UseAdminLoginFlowReturn {
  step: 1 | 2;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isPasswordVisible: boolean;
  togglePasswordVisibility: () => void;
  identifiedUser: IdentifiedAdminPreview | null;
  pin: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  pinInputRef: React.RefObject<HTMLInputElement>;
  focusPinInput: () => void;
  handleSubmitCredentialsStep: (event: React.FormEvent) => Promise<void>;
  handleVerifyPinStep: (pinOverride?: string) => Promise<void>;
  handleKeypadPress: (keyValue: string) => void;
  handlePinInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleReturnToCredentialsStep: () => void;
}

export function useAdminLoginFlow({
  onLoginSuccess,
  notify,
}: UseAdminLoginFlowOptions): UseAdminLoginFlowReturn {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  // Server issues a short-lived HMAC challenge token after Step 1 password verification;
  // it expires on timeout or invalid PIN, requiring re-submission of Step 1 credentials.
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [identifiedUser, setIdentifiedUser] = useState<IdentifiedAdminPreview | null>(null);
  const [pin, setPin] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 2 && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [step]);

  const focusPinInput = useCallback(() => {
    pinInputRef.current?.focus();
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((previous) => !previous);
  }, []);

  const handleSubmitCredentialsStep = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setErrorMessage(null);

      const cleanUsername = username.trim();
      if (!cleanUsername) {
        setErrorMessage('Please enter your admin username.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your text password.');
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await submitLoginCredentialsStep(cleanUsername, password);
        setChallengeToken(response.challengeToken);
        setIdentifiedUser(response.user);
        setPin('');
        setStep(2);
      } catch (error: unknown) {
        const message = extractErrorMessage(
          error,
          'Authentication failed. Please verify your credentials.'
        );
        setErrorMessage(message);
        notify?.('error', message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [username, password, notify]
  );

  const handleVerifyPinStep = useCallback(
    async (pinOverride?: string) => {
      const submittedPin = pinOverride ?? pin;
      setErrorMessage(null);

      if (!submittedPin || submittedPin.length < 4) {
        setErrorMessage('Please enter your numeric security PIN (at least 4 digits).');
        return;
      }

      if (!challengeToken) {
        setErrorMessage('Verification session timed out. Please enter your password again.');
        setStep(1);
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await submitLoginPinStep(challengeToken, submittedPin);
        notify?.('success', `Welcome back, ${response.user.name}`);
        onLoginSuccess({
          user: response.user,
          passkey: response.passkey,
        });
      } catch (error: unknown) {
        const message = extractErrorMessage(error, 'Incorrect PIN code.');
        setErrorMessage(message);
        setPin('');
        notify?.('error', message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [pin, challengeToken, notify, onLoginSuccess]
  );

  const handleKeypadPress = useCallback(
    (keyValue: string) => {
      if (isSubmitting) {
        return;
      }
      if (keyValue === 'backspace') {
        setPin((previous) => previous.slice(0, -1));
        return;
      }
      if (keyValue === 'clear') {
        setPin('');
        return;
      }
      if (pin.length < 6) {
        const nextPin = pin + keyValue;
        setPin(nextPin);
        if (nextPin.length === 6) {
          void handleVerifyPinStep(nextPin);
        }
      }
    },
    [isSubmitting, pin, handleVerifyPinStep]
  );

  const handlePinInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const numericOnly = event.target.value.replace(/\D/g, '').slice(0, 6);
      setPin(numericOnly);
      if (numericOnly.length === 6) {
        void handleVerifyPinStep(numericOnly);
      }
    },
    [handleVerifyPinStep]
  );

  const handleReturnToCredentialsStep = useCallback(() => {
    setStep(1);
    setPin('');
    setErrorMessage(null);
  }, []);

  return {
    step,
    username,
    setUsername,
    password,
    setPassword,
    isPasswordVisible,
    togglePasswordVisibility,
    identifiedUser,
    pin,
    isSubmitting,
    errorMessage,
    pinInputRef,
    focusPinInput,
    handleSubmitCredentialsStep,
    handleVerifyPinStep,
    handleKeypadPress,
    handlePinInputChange,
    handleReturnToCredentialsStep,
  };
}
