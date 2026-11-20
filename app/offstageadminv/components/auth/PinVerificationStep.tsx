'use client';

import React from 'react';
import styles from '../../styles/adminAuth.module.css';

interface PinVerificationStepProps {
  usernameDisplay: string;
  pin: string;
  isSubmitting: boolean;
  pinInputRef: React.RefObject<HTMLInputElement>;
  onFocusPinInput: () => void;
  onPinInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeypadPress: (keyValue: string) => void;
  onVerifyPin: () => void;
  onReturnToCredentials: () => void;
}

const KEYPAD_DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const PIN_SLOT_INDICES = [0, 1, 2, 3, 4, 5];

export default function PinVerificationStep({
  usernameDisplay,
  pin,
  isSubmitting,
  pinInputRef,
  onFocusPinInput,
  onPinInputChange,
  onKeypadPress,
  onVerifyPin,
  onReturnToCredentials,
}: PinVerificationStepProps) {
  return (
    <div>
      <div className={styles.loginStepTitle}>Security PIN</div>
      <div className={styles.loginStepDesc}>
        Enter numeric PIN for <strong>@{usernameDisplay}</strong>
      </div>

      {/* Hidden input to capture physical keyboard input */}
      <input
        ref={pinInputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        value={pin}
        onChange={onPinInputChange}
        className={styles.hiddenPinInput}
        autoFocus
      />

      {/* 6-Slot Visual PIN Display */}
      <div
        className={styles.pinSlotsWrap}
        onClick={onFocusPinInput}
        title="Click or type on keyboard"
      >
        {PIN_SLOT_INDICES.map((slotIndex) => {
          const digit = pin[slotIndex];
          const isCurrentSlot = slotIndex === pin.length;
          return (
            <div
              key={slotIndex}
              className={`${styles.pinSlot} ${digit ? styles.pinSlotFilled : ''} ${
                isCurrentSlot ? styles.pinSlotActive : ''
              }`}
            >
              {digit ? '•' : ''}
            </div>
          );
        })}
      </div>

      {/* On-screen Numeric Keypad */}
      <div className={styles.keypadGrid}>
        {KEYPAD_DIGITS.map((digit) => (
          <button
            key={digit}
            type="button"
            className={styles.keypadBtn}
            onClick={() => onKeypadPress(digit)}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.keypadBtn} ${styles.keypadActionBtn}`}
          onClick={() => onKeypadPress('clear')}
        >
          Clear
        </button>
        <button
          type="button"
          className={styles.keypadBtn}
          onClick={() => onKeypadPress('0')}
        >
          0
        </button>
        <button
          type="button"
          className={`${styles.keypadBtn} ${styles.keypadActionBtn}`}
          onClick={() => onKeypadPress('backspace')}
          aria-label="Backspace"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        className={styles.loginSubmitBtn}
        onClick={onVerifyPin}
        disabled={isSubmitting || pin.length < 4}
      >
        {isSubmitting ? <span>Verifying PIN...</span> : <span>Verify &amp; Enter</span>}
      </button>

      <button
        type="button"
        className={styles.loginBackBtn}
        onClick={onReturnToCredentials}
      >
        ← Back to Sign In
      </button>
    </div>
  );
}
