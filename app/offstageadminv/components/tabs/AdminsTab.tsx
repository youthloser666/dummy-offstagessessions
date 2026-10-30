'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../admin.module.css';
import { AdminUserPublic, AdminRole } from '../../types';

interface AdminsTabProps {
  currentUser?: AdminUserPublic | null;
  passkey: string;
  notify: (type: 'success' | 'error', message: string) => void;
}

export default function AdminsTab({ currentUser, passkey, notify }: AdminsTabProps) {
  const [adminsList, setAdminsList] = useState<AdminUserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Password visibility toggles
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'x-admin-passkey': passkey,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.admins)) {
        setAdminsList(data.admins);
      } else {
        throw new Error(data.error || 'Failed to load admins');
      }
    } catch (err: any) {
      notify('error', err.message || 'Error loading admin users list');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUsername = newUsername.trim().toLowerCase();
    const cleanName = newName.trim();
    const cleanPin = newPin.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      setFormError('Username must be at least 3 characters.');
      return;
    }
    if (!cleanName) {
      setFormError('Full name is required.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (!/^\d{4,6}$/.test(cleanPin)) {
      setFormError('Security PIN must be between 4 and 6 numeric digits (0-9).');
      return;
    }
    if (cleanPin !== confirmPin.trim()) {
      setFormError('Numeric PINs do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({
          username: cleanUsername,
          name: cleanName,
          role: 'admin',
          password: newPassword,
          pin: cleanPin,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create admin user');
      }

      notify('success', `Admin "${cleanUsername}" created successfully.`);
      setShowAddModal(false);
      resetForm();
      loadAdmins();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create admin');
      notify('error', err.message || 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (admin: AdminUserPublic) => {
    if (adminsList.length <= 1) {
      notify('error', 'Cannot delete the only remaining admin account.');
      return;
    }

    if (currentUser?.id === admin.id) {
      notify('error', 'You cannot delete your own active admin account while logged in.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete admin account "${admin.name}" (@${admin.username})?`
    );
    if (!confirmed) return;

    setDeletingId(admin.id);
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(admin.id)}`, {
        method: 'DELETE',
        headers: {
          'x-admin-passkey': passkey,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete admin');
      }

      notify('success', `Admin "${admin.username}" has been removed.`);
      loadAdmins();
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete admin account');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setNewUsername('');
    setNewName('');
    setNewPassword('');
    setConfirmPassword('');
    setNewPin('');
    setConfirmPin('');
    setFormError(null);
  };

  return (
    <div>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Admin Access Control</h1>
          <p className={styles.pageDesc}>
            Manage authorized console administrators with two-factor authentication (primary text password + secondary numeric PIN).
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            + Add New Admin
          </button>
        </div>
      </div>

      {/* Standard KPI Metrics Cards */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Admins</div>
          <div className={styles.metricValue}>{adminsList.length}</div>
          <div className={styles.metricSubtitle} style={{ color: '#86868b' }}>
            Registered Console Accounts
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Security Protocol</div>
          <div className={styles.metricValue} style={{ fontSize: '18px' }}>Two-Step (2FA)</div>
          <div className={styles.metricSubtitle} style={{ color: '#86868b' }}>
            1st Text Password • 2nd Numeric PIN
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Active Session</div>
          <div className={styles.metricValue} style={{ fontSize: '18px' }}>
            @{currentUser?.username || 'admin'}
          </div>
          <div className={styles.metricSubtitle} style={{ color: '#86868b', textTransform: 'uppercase' }}>
            Access: Console Admin
          </div>
        </div>
      </div>

      {/* Admin Accounts List Section */}
      <div style={{ marginTop: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
            Registered Administrators ({adminsList.length})
          </h2>
          <button
            onClick={loadAdmins}
            className={styles.btnSecondary}
            style={{ fontSize: 11, padding: '4px 10px' }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#86868b', fontSize: '13px' }}>
            Loading administrators...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {adminsList.map((admin) => {
              const isSelf = currentUser?.id === admin.id || currentUser?.username === admin.username;
              return (
                <div key={admin.id} className={styles.adminUserCard}>
                  <div className={styles.adminUserLeft}>
                    <div className={styles.adminUserAvatar}>
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.adminUserName}>
                        <span>{admin.name}</span>
                        <span className={styles.roleBadge}>ADMIN</span>
                        {isSelf && (
                          <span
                            style={{
                              fontSize: '10px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: '#86868b',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <div className={styles.adminUserMeta}>
                        <span>@{admin.username}</span>
                        <span>•</span>
                        <span className={styles.statusBadgeActive}>
                          <span className={styles.statusDot} />
                          Active
                        </span>
                        <span>•</span>
                        <span>
                          Created:{' '}
                          {admin.created_at
                            ? new Date(admin.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Initial Setup'}
                        </span>
                        {admin.last_login_at && (
                          <>
                            <span>•</span>
                            <span>
                              Last login:{' '}
                              {new Date(admin.last_login_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.adminUserActions}>
                    <div className={styles.authBadge2fa}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Pass + PIN 2FA</span>
                    </div>

                    {!isSelf && adminsList.length > 1 && (
                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        disabled={deletingId === admin.id}
                        className={styles.btnDanger}
                      >
                        {deletingId === admin.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL: Add New Admin (Password + PIN)                                */}
      {/* =================================================================== */}
      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={() => !submitting && setShowAddModal(false)}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Add New Administrator</h3>
                <div style={{ fontSize: '12px', color: '#86868b', marginTop: '2px' }}>
                  Set up user identity, text password, and numeric PIN.
                </div>
              </div>
              <button
                className={styles.modalCloseBtn}
                onClick={() => !submitting && setShowAddModal(false)}
                disabled={submitting}
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className={styles.loginErrorBanner}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. Account Identity */}
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86868b', marginBottom: '8px', fontWeight: 600 }}>
                    1. Account Identity
                  </div>
                  <div className={styles.adminModalGrid2}>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.formLabel}>Username *</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="e.g. joshua"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.formLabel}>Full Name *</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="e.g. Joshua Rivera"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Text Password */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86868b', fontWeight: 600 }}>
                      2. Primary Text Password
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ background: 'none', border: 'none', color: '#86868b', fontSize: '11px', cursor: 'pointer' }}
                    >
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  <div className={styles.adminModalGrid2}>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.formLabel}>Password *</label>
                      <input
                        type={showPass ? 'text' : 'password'}
                        className={styles.formInput}
                        placeholder="Min 6 chars"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.formLabel}>Confirm Password *</label>
                      <input
                        type={showPass ? 'text' : 'password'}
                        className={styles.formInput}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Numeric PIN */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff', marginBottom: '8px', fontWeight: 600 }}>
                    3. Numeric Security PIN
                  </div>
                  <div className={styles.adminModalGrid2}>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.formLabel}>4-6 Digit PIN *</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        className={styles.formInput}
                        placeholder="e.g. 260899"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.formLabel}>Confirm PIN *</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        className={styles.formInput}
                        placeholder="Confirm PIN"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#86868b', marginTop: '4px' }}>
                    Only numbers 0-9. Entered as the second step during admin login.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
