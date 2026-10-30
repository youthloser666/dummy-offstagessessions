'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from '../admin.module.css';
import { AdminUserPublic } from '../types';

interface AdminLoginViewProps {
  onLoginSuccess: (data: { user: AdminUserPublic; passkey: string }) => void;
  notify?: (type: 'success' | 'error', message: string) => void;
}

export default function AdminLoginView({ onLoginSuccess, notify }: AdminLoginViewProps) {
  // Step state: 1 = Username & Text Password, 2 = Numeric PIN
  const [step, setStep] = useState<1 | 2>(1);

  // Form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 Challenge state
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [identifiedUser, setIdentifiedUser] = useState<{ username: string; name: string; role: string } | null>(null);
  const [pin, setPin] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCredentialsHint, setShowCredentialsHint] = useState(false);

  // Hidden input ref for native keyboard support on PIN
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus PIN input when entering step 2
  useEffect(() => {
    if (step === 2 && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [step]);

  // Handle Step 1: Submit Username & Text Password
  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setErrorMsg('Please enter your admin username.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your text password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 1,
          username: cleanUsername,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
      }

      // Progress to Step 2
      setChallengeToken(data.challengeToken);
      setIdentifiedUser(data.user);
      setPin('');
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
      if (notify) notify('error', err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Submit PIN
  const handleVerifyPin = async (pinToSubmit?: string) => {
    const finalPin = pinToSubmit || pin;
    setErrorMsg(null);

    if (!finalPin || finalPin.length < 4) {
      setErrorMsg('Please enter your numeric security PIN (at least 4 digits).');
      return;
    }

    if (!challengeToken) {
      setErrorMsg('Verification session timed out. Please enter your password again.');
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 2,
          challengeToken,
          pin: finalPin,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Incorrect PIN code.');
      }

      if (notify) notify('success', `Welcome back, ${data.user.name}`);
      onLoginSuccess({
        user: data.user,
        passkey: data.passkey,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect PIN code.');
      setPin(''); // Reset PIN on error
      if (notify) notify('error', err.message || 'Incorrect PIN code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Keypad button press
  const handleKeypadPress = (val: string) => {
    if (loading) return;

    if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
    } else if (val === 'clear') {
      setPin('');
    } else {
      if (pin.length < 6) {
        const nextPin = pin + val;
        setPin(nextPin);
        if (nextPin.length === 6) {
          handleVerifyPin(nextPin);
        }
      }
    }
  };

  // Handle native typing in hidden input for PIN
  const handlePinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(numericOnly);
    if (numericOnly.length === 6) {
      handleVerifyPin(numericOnly);
    }
  };

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
        {errorMsg && (
          <div className={styles.loginErrorBanner}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 1: Text Password Only                                       */}
        {/* ================================================================= */}
        {step === 1 && (
          <form onSubmit={handleSubmitStep1}>
            <div className={styles.loginStepTitle}>Sign In</div>
            <div className={styles.loginStepDesc}>Enter your administrator credentials</div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Admin Username</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  className={styles.loginInput}
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.loginInput}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.togglePassBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.loginSubmitBtn} disabled={loading}>
              {loading ? (
                <span>Checking...</span>
              ) : (
                <>
                  <span>Continue</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {/* ================================================================= */}
        {/* STEP 2: Numeric PIN Verification (Appears sequentially)          */}
        {/* ================================================================= */}
        {step === 2 && (
          <div>
            <div className={styles.loginStepTitle}>Security PIN</div>
            <div className={styles.loginStepDesc}>
              Enter numeric PIN for <strong>@{identifiedUser?.username || username}</strong>
            </div>

            {/* Hidden input to capture physical keyboard input */}
            <input
              ref={pinInputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={handlePinInputChange}
              style={{
                position: 'absolute',
                opacity: 0,
                pointerEvents: 'none',
                height: 0,
                width: 0,
              }}
              autoFocus
            />

            {/* 6-Slot Visual PIN Display */}
            <div
              className={styles.pinSlotsWrap}
              onClick={() => pinInputRef.current?.focus()}
              title="Click or type on keyboard"
              style={{ cursor: 'pointer' }}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const char = pin[index];
                const isCurrent = index === pin.length;
                return (
                  <div
                    key={index}
                    className={`${styles.pinSlot} ${char ? styles.pinSlotFilled : ''} ${
                      isCurrent ? styles.pinSlotActive : ''
                    }`}
                  >
                    {char ? '•' : ''}
                  </div>
                );
              })}
            </div>

            {/* On-screen Numeric Keypad */}
            <div className={styles.keypadGrid}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  className={styles.keypadBtn}
                  onClick={() => handleKeypadPress(digit)}
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                className={`${styles.keypadBtn} ${styles.keypadActionBtn}`}
                onClick={() => handleKeypadPress('clear')}
              >
                Clear
              </button>
              <button
                type="button"
                className={styles.keypadBtn}
                onClick={() => handleKeypadPress('0')}
              >
                0
              </button>
              <button
                type="button"
                className={`${styles.keypadBtn} ${styles.keypadActionBtn}`}
                onClick={() => handleKeypadPress('backspace')}
                aria-label="Backspace"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            </div>

            {/* Submit & Back buttons */}
            <button
              type="button"
              className={styles.loginSubmitBtn}
              onClick={() => handleVerifyPin()}
              disabled={loading || pin.length < 4}
            >
              {loading ? <span>Verifying PIN...</span> : <span>Verify &amp; Enter</span>}
            </button>

            <button
              type="button"
              className={styles.loginBackBtn}
              onClick={() => {
                setStep(1);
                setPin('');
                setErrorMsg(null);
              }}
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* Minimalist Credentials Hint */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowCredentialsHint(!showCredentialsHint)}
            style={{
              background: 'none',
              border: 'none',
              color: '#86868b',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            {showCredentialsHint ? 'Hide initial credentials' : 'Initial credentials hint'}
          </button>

          {showCredentialsHint && (
            <div className={styles.loginNoticeBox}>
              <div>Username: <span className={styles.loginNoticeCode}>admin</span></div>
              <div style={{ marginTop: '3px' }}>
                Password (1st): <span className={styles.loginNoticeCode}>offstageadmin2026</span>
              </div>
              <div style={{ marginTop: '3px' }}>
                PIN (2nd): <span className={styles.loginNoticeCode}>260899</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
