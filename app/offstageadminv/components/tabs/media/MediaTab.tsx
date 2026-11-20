'use client';

import React from 'react';
import { useMediaArchivesManager } from '../../../hooks/useMediaArchivesManager';
import type { NotifyHandler } from '../../../types';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';
import { EditMediaModal } from '../../modals/EditMediaModal';
import { MediaCreateDrawer } from './MediaCreateDrawer';

interface MediaTabProps {
  passkey: string;
  notify: NotifyHandler;
  onMediaChange?: (count: number) => void;
}

export function MediaTab({ passkey, notify, onMediaChange }: MediaTabProps) {
  const {
    mediaList,
    isLoadingMedia,
    isCreateDrawerOpen,
    setCreateDrawerOpen,
    newMediaDraft,
    setNewMediaDraft,
    isCreatingThumbnailUploading,
    createThumbnailPreviewUrl,
    uploadNewMediaThumbnail,
    editingMedia,
    setEditingMedia,
    isEditingThumbnailUploading,
    editThumbnailPreviewUrl,
    uploadEditMediaThumbnail,
    loadMedia,
    handleCreateMedia,
    openEditMediaModal,
    closeEditMediaModal,
    handleUpdateMedia,
    handleDeleteMedia,
  } = useMediaArchivesManager({
    passkey,
    notify,
    onMediaCountChange: onMediaChange,
  });

  return (
    <div>
      <header className={shellStyles.pageHeader}>
        <div>
          <h1 className={shellStyles.pageTitle}>Media &amp; Recaps</h1>
          <p className={shellStyles.pageDesc}>
            Curate photography galleries, video recaps &amp; external event albums
          </p>
        </div>

        <div className={shellStyles.headerActions}>
          <button
            type="button"
            className={shellStyles.btnSecondary}
            onClick={() => void loadMedia()}
            disabled={isLoadingMedia}
          >
            Refresh
          </button>
          <button
            type="button"
            className={shellStyles.btnPrimary}
            onClick={() => setCreateDrawerOpen(!isCreateDrawerOpen)}
          >
            {isCreateDrawerOpen ? 'Close Form' : '+ Add Media Item'}
          </button>
        </div>
      </header>

      {isCreateDrawerOpen && (
        <MediaCreateDrawer
          draft={newMediaDraft}
          isUploadingThumbnail={isCreatingThumbnailUploading}
          thumbnailPreviewUrl={createThumbnailPreviewUrl}
          onChange={setNewMediaDraft}
          onUploadThumbnail={(file) => {
            void uploadNewMediaThumbnail(file);
          }}
          onSubmit={(event) => {
            void handleCreateMedia(event);
          }}
          onCancel={() => setCreateDrawerOpen(false)}
        />
      )}

      <div className={`${shellStyles.card} ${shellStyles.cardFlush}`}>
        <div className={shellStyles.tableWrapper}>
          <table className={shellStyles.table}>
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Title / Gallery</th>
                <th>Date</th>
                <th>Category</th>
                <th>Link</th>
                <th className={shellStyles.tableActionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingMedia ? (
                [1, 2, 3].map((rowIndex) => (
                  <tr key={rowIndex} className={shellStyles.tableRow}>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonThumbMedia}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarLg}`} />
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
                    <td className={shellStyles.tableActionsCell}>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                  </tr>
                ))
              ) : mediaList.length === 0 ? (
                <tr>
                  <td colSpan={6} className={shellStyles.tableEmptyCell}>
                    No media archives found. Click &apos;+ Add Media Item&apos; to publish one.
                  </td>
                </tr>
              ) : (
                mediaList.map((mediaItem) => {
                  const thumbSrc =
                    mediaItem.thumbnail ||
                    mediaItem.thumbnail_url ||
                    mediaItem.image ||
                    mediaItem.image_url ||
                    '/image/jackie_web.webp';
                  const galleryLink = mediaItem.facebook_url || mediaItem.facebookUrl;

                  return (
                    <tr key={mediaItem.id} className={shellStyles.tableRow}>
                      <td>
                        <img
                          src={thumbSrc}
                          alt={mediaItem.name}
                          className={overviewStyles.thumbMedia}
                        />
                      </td>
                      <td>
                        <div className={overviewStyles.cellPrimaryTitle}>{mediaItem.name}</div>
                      </td>
                      <td className={overviewStyles.cellSecondaryText}>{mediaItem.date}</td>
                      <td>
                        <span className={shellStyles.tagPill}>
                          {mediaItem.category || 'photo'}
                        </span>
                      </td>
                      <td>
                        {galleryLink ? (
                          <a
                            href={galleryLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={shellStyles.linkPill}
                          >
                            Open Album ↗
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
                            onClick={() => openEditMediaModal(mediaItem)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={shellStyles.btnDanger}
                            onClick={() => {
                              void handleDeleteMedia(mediaItem.id, mediaItem.name);
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

      <EditMediaModal
        editingMedia={editingMedia}
        onClose={closeEditMediaModal}
        onSubmit={(event) => {
          void handleUpdateMedia(event);
        }}
        onChange={setEditingMedia}
        onUploadThumbnail={(file) => {
          void uploadEditMediaThumbnail(file);
        }}
        isUploadingThumbnail={isEditingThumbnailUploading}
        thumbnailPreviewUrl={editThumbnailPreviewUrl}
      />
    </div>
  );
}

