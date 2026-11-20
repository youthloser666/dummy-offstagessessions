'use client';

import React from 'react';
import type { AdminCreationDraft, AdminRole } from '../../types';
import accessStyles from '../../styles/adminAccess.module.css';
import shellStyles from '../../styles/adminShell.module.css';

interface AddAdminModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  formError: string | null;
  draft: AdminCreationDraft;
  isPasswordVisible: boolean;
  onTogglePasswordVisibility: () => void;
  onDraftChange: (updatedDraft: AdminCreationDraft) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function AddAdminModal({
  isOpen,
  isSubmitting,
  formError,
  draft,
  isPasswordVisible,
  onTogglePasswordVisibility,
  onDraftChange,
  onClose,
  onSubmit,
}: AddAdminModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={shellStyles.modalBackdrop}
      data-lenis-prevent="true"
      onClick={onClose}
    >
      <div
        className={`${shellStyles.modalContent} ${accessStyles.addAdminModalContent}`}
        data-lenis-prevent="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={shellStyles.modalHeader}>
          <div>
            <h3 className={shellStyles.modalTitle}>Create New Administrator</h3>
            <p className={shellStyles.cardSubtitle}>
              Issue password &amp; mandatory 6-digit 2FA PIN credentials
            </p>
          </div>
          <button
            type="button"
            className={shellStyles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {formError && <div className={accessStyles.formErrorBanner}>{formError}</div>}

        <form onSubmit={onSubmit}>
          <div className={shellStyles.formGrid2}>
            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Username *</label>
              <input
                type="text"
                required
                className={shellStyles.formInput}
                placeholder="e.g. booking_lead"
                value={draft.username}
                onChange={(event) =>
                  onDraftChange({ ...draft, username: event.target.value })
                }
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Full / Display Name *</label>
              <input
                type="text"
                required
                className={shellStyles.formInput}
                placeholder="e.g. Elena Vance"
                value={draft.name}
                onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
              />
            </div>
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Access Role</label>
            <select
              className={shellStyles.formSelect}
              value={draft.role}
              onChange={(event) =>
                onDraftChange({ ...draft, role: event.target.value as AdminRole })
              }
            >
              <option value="admin">Admin (Standard Console Access)</option>
              <option value="manager">Manager (Operations)</option>
              <option value="superadmin">Superadmin (Owner Level)</option>
            </select>
          </div>

          <div className={shellStyles.formGrid2}>
            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Password (Min 6 chars) *</label>
              <div className={accessStyles.passwordInputWrap}>
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  required
                  minLength={6}
                  className={`${shellStyles.formInput} ${accessStyles.passwordInputWithToggle}`}
                  value={draft.password}
                  onChange={(event) =>
                    onDraftChange({ ...draft, password: event.target.value })
                  }
                />
                <button
                  type="button"
                  className={accessStyles.passwordToggleBtn}
                  onClick={onTogglePasswordVisibility}
                >
                  {isPasswordVisible ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Confirm Password *</label>
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                required
                className={shellStyles.formInput}
                value={draft.confirmPassword}
                onChange={(event) =>
                  onDraftChange({ ...draft, confirmPassword: event.target.value })
                }
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>6-Digit Security PIN *</label>
              <input
                type="password"
                required
                maxLength={6}
                inputMode="numeric"
                className={`${shellStyles.formInput} ${accessStyles.pinInputField}`}
                placeholder="••••••"
                value={draft.pin}
                onChange={(event) =>
                  onDraftChange({ ...draft, pin: event.target.value.replace(/\D/g, '') })
                }
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Confirm Security PIN *</label>
              <input
                type="password"
                required
                maxLength={6}
                inputMode="numeric"
                className={`${shellStyles.formInput} ${accessStyles.pinInputField}`}
                placeholder="••••••"
                value={draft.confirmPin}
                onChange={(event) =>
                  onDraftChange({
                    ...draft,
                    confirmPin: event.target.value.replace(/\D/g, ''),
                  })
                }
              />
            </div>
          </div>

          <div className={shellStyles.modalFooter}>
            <button
              type="button"
              className={shellStyles.btnSecondary}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={shellStyles.btnPrimary}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

