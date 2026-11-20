'use client';

import React from 'react';
import { useAdminLoginFlow } from '../../hooks/useAdminLoginFlow';
import styles from '../../styles/adminAuth.module.css';
import type { AdminUserPublic, NotifyHandler } from '../../types';
import CredentialsStepForm from './CredentialsStepForm';
import PinVerificationStep from './PinVerificationStep';

interface AdminLoginViewProps {
  onLoginSuccess: (payload: { user: AdminUserPublic; passkey: string }) => void;
  notify?: NotifyHandler;
}

export default function AdminLoginView({ onLoginSuccess, notify }: AdminLoginViewProps) {
  const {
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
  } = useAdminLoginFlow({ onLoginSuccess, notify });

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        {/* Brand Header */}
        <div className={styles.loginHeader}>
          <div className={styles.loginLogoWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Offstage" className={styles.loginLogoImg} />
          </div>
          <div className={styles.loginBrandSubtitle}>Control Console</div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className={styles.loginErrorBanner}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 1 ? (
          <CredentialsStepForm
            username={username}
            onUsernameChange={setUsername}
            password={password}
            onPasswordChange={setPassword}
            isPasswordVisible={isPasswordVisible}
            onTogglePasswordVisibility={togglePasswordVisibility}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitCredentialsStep}
          />
        ) : (
          <PinVerificationStep
            usernameDisplay={identifiedUser?.username || username}
            pin={pin}
            isSubmitting={isSubmitting}
            pinInputRef={pinInputRef}
            onFocusPinInput={focusPinInput}
            onPinInputChange={handlePinInputChange}
            onKeypadPress={handleKeypadPress}
            onVerifyPin={() => {
              void handleVerifyPinStep();
            }}
            onReturnToCredentials={handleReturnToCredentialsStep}
          />
        )}
      </div>
    </div>
  );
}

