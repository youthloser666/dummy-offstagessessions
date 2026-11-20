'use client';

import React from 'react';
import styles from '../../styles/adminAuth.module.css';

interface CredentialsStepFormProps {
  username: string;
  onUsernameChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  isPasswordVisible: boolean;
  onTogglePasswordVisibility: () => void;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent) => void;
}

export default function CredentialsStepForm({
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  isPasswordVisible,
  onTogglePasswordVisibility,
  isSubmitting,
  onSubmit,
}: CredentialsStepFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className={styles.loginStepTitle}>Sign In</div>
      <div className={styles.loginStepDesc}>Enter your administrator credentials</div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Admin Username</label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <input
            type="text"
            className={styles.loginInput}
            placeholder="admin"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
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
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            className={styles.loginInput}
            placeholder="Enter password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className={styles.togglePassBtn}
            onClick={onTogglePasswordVisibility}
            aria-label="Toggle password visibility"
          >
            {isPasswordVisible ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <button type="submit" className={styles.loginSubmitBtn} disabled={isSubmitting}>
        {isSubmitting ? (
          <span>Checking...</span>
        ) : (
          <>
            <span>Continue</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

