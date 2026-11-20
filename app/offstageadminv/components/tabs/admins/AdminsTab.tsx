'use client';

import React from 'react';
import { useAdminUsersManager } from '../../../hooks/useAdminUsersManager';
import type { AdminUserPublic, NotifyHandler } from '../../../types';
import { formatInquiryTimestamp } from '../../../utils/dateFormatters';
import accessStyles from '../../../styles/adminAccess.module.css';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';
import { AddAdminModal } from '../../modals/AddAdminModal';

interface AdminsTabProps {
  currentUser: AdminUserPublic | null;
  passkey: string;
  notify: NotifyHandler;
}

export function AdminsTab({ currentUser, passkey, notify }: AdminsTabProps) {
  const {
    adminsList,
    isLoadingAdmins,
    deletingAdminId,
    isAddModalOpen,
    creationDraft,
    setCreationDraft,
    isPasswordVisible,
    togglePasswordVisibility,
    formError,
    isSubmitting,
    loadAdmins,
    openAddAdminModal,
    closeAddAdminModal,
    handleCreateAdmin,
    handleDeleteAdmin,
  } = useAdminUsersManager({ currentUser, passkey, notify });

  return (
    <div>
      <header className={shellStyles.pageHeader}>
        <div>
          <h1 className={shellStyles.pageTitle}>Admin Access &amp; Security</h1>
          <p className={shellStyles.pageDesc}>
            Manage authenticated console accounts, role privileges &amp; mandatory 6-digit PIN 2FA
          </p>
        </div>

        <div className={shellStyles.headerActions}>
          <button
            type="button"
            className={shellStyles.btnSecondary}
            onClick={() => {
              void loadAdmins();
            }}
            disabled={isLoadingAdmins}
          >
            Refresh
          </button>
          <button
            type="button"
            className={shellStyles.btnPrimary}
            onClick={openAddAdminModal}
          >
            + Add Administrator
          </button>
        </div>
      </header>

      <div className={`${shellStyles.card} ${shellStyles.cardFlush}`}>
        <div className={shellStyles.tableWrapper}>
          <table className={shellStyles.table}>
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th className={shellStyles.tableActionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingAdmins ? (
                [1, 2].map((rowIndex) => (
                  <tr key={rowIndex} className={shellStyles.tableRow}>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarMd}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarMd}`} />
                    </td>
                    <td className={shellStyles.tableActionsCell}>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                  </tr>
                ))
              ) : adminsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className={shellStyles.tableEmptyCell}>
                    No administrators configured.
                  </td>
                </tr>
              ) : (
                adminsList.map((adminUser) => {
                  const isCurrentSessionUser = adminUser.id === currentUser?.id;
                  const isProtectedSuperadmin = adminUser.role === 'superadmin';
                  const canDeleteAccount = !isCurrentSessionUser && !isProtectedSuperadmin;

                  return (
                    <tr key={adminUser.id} className={shellStyles.tableRow}>
                      <td>
                        <div className={overviewStyles.cellPrimaryTitle}>
                          {adminUser.name}
                          {isCurrentSessionUser && (
                            <span className={accessStyles.selfAccountTag}>YOU</span>
                          )}
                        </div>
                        <div className={overviewStyles.cellPrimarySubtitle}>
                          Created {formatInquiryTimestamp(adminUser.created_at)}
                        </div>
                      </td>
                      <td className={overviewStyles.codeText}>@{adminUser.username}</td>
                      <td>
                        <span
                          className={`${shellStyles.statusBadge} ${
                            isProtectedSuperadmin
                              ? accessStyles.roleBadgeOwner
                              : accessStyles.roleBadgeAdmin
                          }`}
                        >
                          {adminUser.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${shellStyles.statusBadge} ${
                            adminUser.status === 'active'
                              ? shellStyles.statusBadgeActive
                              : shellStyles.statusBadgeDanger
                          }`}
                        >
                          {adminUser.status}
                        </span>
                      </td>
                      <td className={overviewStyles.cellSecondaryText}>
                        {adminUser.last_login_at
                          ? formatInquiryTimestamp(adminUser.last_login_at)
                          : 'Never signed in'}
                      </td>
                      <td className={shellStyles.tableActionsCell}>
                        {canDeleteAccount ? (
                          <button
                            type="button"
                            className={shellStyles.btnDanger}
                            disabled={deletingAdminId === adminUser.id}
                            onClick={() => {
                              void handleDeleteAdmin(adminUser);
                            }}
                          >
                            {deletingAdminId === adminUser.id ? 'Removing...' : 'Revoke Access'}
                          </button>
                        ) : (
                          <span className={accessStyles.protectedAccountNote}>
                            {isCurrentSessionUser ? 'Active Session' : 'Protected Owner'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={accessStyles.securityGuidelinesWell}>
        <h4 className={accessStyles.securityGuidelinesHeading}>Authentication Security Policies</h4>
        <ul className={accessStyles.securityGuidelinesList}>
          <li>
            All accounts require two-step authentication: username + password verification followed
            by a cryptographic 6-digit numeric PIN challenge.
          </li>
          <li>
            Passwords and PINs are salted with per-user scrypt hashes and never stored or
            returned in plaintext.
          </li>
          <li>
            Superadmin owner accounts and your currently active session cannot be revoked from this
            console table.
          </li>
        </ul>
      </div>

      <AddAdminModal
        isOpen={isAddModalOpen}
        isSubmitting={isSubmitting}
        formError={formError}
        draft={creationDraft}
        isPasswordVisible={isPasswordVisible}
        onTogglePasswordVisibility={togglePasswordVisibility}
        onDraftChange={setCreationDraft}
        onClose={closeAddAdminModal}
        onSubmit={(event) => {
          void handleCreateAdmin(event);
        }}
      />
    </div>
  );
}

