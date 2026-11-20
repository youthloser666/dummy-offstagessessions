'use client';

import React from 'react';
import { useShowsManager } from '../../../hooks/useShowsManager';
import type { NotifyHandler } from '../../../types';
import { sanitizeLegacyDateString } from '../../../utils/dateFormatters';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';
import { EditShowModal } from '../../modals/EditShowModal';
import { ShowCreateDrawer } from './ShowCreateDrawer';

interface ShowsTabProps {
  passkey: string;
  notify: NotifyHandler;
  showCreateDrawer?: boolean;
  setShowCreateDrawer?: (open: boolean) => void;
  onShowsChange?: (count: number) => void;
}

export function ShowsTab({
  passkey,
  notify,
  showCreateDrawer,
  setShowCreateDrawer,
  onShowsChange,
}: ShowsTabProps) {
  const {
    showsList,
    isLoadingShows,
    isCreateDrawerOpen,
    setCreateDrawerOpen,
    newShowDraft,
    setNewShowDraft,
    isCreatingPosterUploading,
    createPosterPreviewUrl,
    uploadNewShowPoster,
    editingShow,
    setEditingShow,
    isEditingPosterUploading,
    editPosterPreviewUrl,
    uploadEditShowPoster,
    loadShows,
    handleCreateShow,
    openEditShowModal,
    closeEditShowModal,
    handleUpdateShow,
    handleDeleteShow,
  } = useShowsManager({
    passkey,
    notify,
    externalShowCreateDrawer: showCreateDrawer,
    setExternalShowCreateDrawer: setShowCreateDrawer,
    onShowsCountChange: onShowsChange,
  });

  return (
    <div>
      <header className={shellStyles.pageHeader}>
        <div>
          <h1 className={shellStyles.pageTitle}>Shows &amp; Schedule</h1>
          <p className={shellStyles.pageDesc}>
            Manage upcoming sessions, featured lineups, posters &amp; ticket links
          </p>
        </div>

        <div className={shellStyles.headerActions}>
          <button
            type="button"
            className={shellStyles.btnSecondary}
            onClick={() => void loadShows()}
            disabled={isLoadingShows}
          >
            Refresh
          </button>
          <button
            type="button"
            className={shellStyles.btnPrimary}
            onClick={() => setCreateDrawerOpen(!isCreateDrawerOpen)}
          >
            {isCreateDrawerOpen ? 'Close Form' : '+ Add New Show'}
          </button>
        </div>
      </header>

      {isCreateDrawerOpen && (
        <ShowCreateDrawer
          draft={newShowDraft}
          isUploadingPoster={isCreatingPosterUploading}
          posterPreviewUrl={createPosterPreviewUrl}
          onChange={setNewShowDraft}
          onUploadPoster={(file) => {
            void uploadNewShowPoster(file);
          }}
          onSubmit={(event) => {
            void handleCreateShow(event);
          }}
          onCancel={() => setCreateDrawerOpen(false)}
        />
      )}

      <div className={`${shellStyles.card} ${shellStyles.cardFlush}`}>
        <div className={shellStyles.tableWrapper}>
          <table className={shellStyles.table}>
            <thead>
              <tr>
                <th>Poster</th>
                <th>Event &amp; Venue</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th>Tickets</th>
                <th className={shellStyles.tableActionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingShows ? (
                [1, 2, 3].map((rowIndex) => (
                  <tr key={rowIndex} className={shellStyles.tableRow}>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonThumbShow}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarLg}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarMd}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                    <td className={shellStyles.tableActionsCell}>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                  </tr>
                ))
              ) : showsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className={shellStyles.tableEmptyCell}>
                    No shows found. Click &apos;+ Add New Show&apos; to schedule your first session.
                  </td>
                </tr>
              ) : (
                showsList.map((show) => {
                  const posterSrc =
                    show.poster ||
                    show.posterUrl ||
                    show.poster_url ||
                    '/image/tobehonest_web.webp';
                  const ticketHref =
                    show.posh_url || show.poshUrl || show.ticket_url || show.ticketUrl;
                  const formattedDate = sanitizeLegacyDateString(
                    show.dateFormatted || show.date_formatted || show.date
                  );

                  return (
                    <tr key={show.id} className={shellStyles.tableRow}>
                      <td>
                        <img
                          src={posterSrc}
                          alt={show.name}
                          className={overviewStyles.thumbShowPoster}
                        />
                      </td>
                      <td>
                        <div className={overviewStyles.cellPrimaryTitle}>
                          {show.name}
                          {show.featured && (
                            <span
                              className={`${shellStyles.tagPill} ${overviewStyles.inlineTagOffset}`}
                            >
                              Featured
                            </span>
                          )}
                        </div>
                        <div className={overviewStyles.cellPrimarySubtitle}>
                          {show.venue}
                          {show.subtitle ? ` · ${show.subtitle}` : ''}
                        </div>
                      </td>
                      <td>
                        <div className={overviewStyles.cellSecondaryText}>{formattedDate || 'TBA'}</div>
                        {show.time && (
                          <div className={overviewStyles.cellPrimarySubtitle}>{show.time}</div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`${shellStyles.statusBadge} ${
                            show.status === 'upcoming'
                              ? shellStyles.statusBadgeActive
                              : shellStyles.statusBadgeLime
                          }`}
                        >
                          {show.status || 'upcoming'}
                        </span>
                      </td>
                      <td>
                        {ticketHref ? (
                          <a
                            href={ticketHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={shellStyles.linkPill}
                          >
                            Tickets ↗
                          </a>
                        ) : (
                          <span className={overviewStyles.cellSecondaryText}>No Link</span>
                        )}
                      </td>
                      <td className={shellStyles.tableActionsCell}>
                        <div className={shellStyles.tableActionsRow}>
                          <button
                            type="button"
                            className={shellStyles.btnEdit}
                            onClick={() => openEditShowModal(show)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={shellStyles.btnDanger}
                            onClick={() => {
                              void handleDeleteShow(show.id, show.name);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditShowModal
        editingShow={editingShow}
        onClose={closeEditShowModal}
        onSubmit={(event) => {
          void handleUpdateShow(event);
        }}
        onChange={setEditingShow}
        onUploadPoster={(file) => {
          void uploadEditShowPoster(file);
        }}
        isUploadingPoster={isEditingPosterUploading}
        posterPreviewUrl={editPosterPreviewUrl}
      />
    </div>
  );
}
