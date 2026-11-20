'use client';

import React from 'react';
import type { Inquiry, MediaItem, Show, TabType } from '../../../types';
import { sanitizeLegacyDateString } from '../../../utils/dateFormatters';
import { getInquiryCategoryClass } from '../../../utils/statusClasses';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';

interface OverviewSnapshotsProps {
  showsList: Show[];
  mediaList: MediaItem[];
  inquiriesList: Inquiry[];
  onNavigateTab: (tab: TabType) => void;
}

export function OverviewSnapshots({
  showsList,
  mediaList,
  inquiriesList,
  onNavigateTab,
}: OverviewSnapshotsProps) {
  return (
    <div className={overviewStyles.snapshotsGrid}>
      {/* Scheduled Sessions Snapshot */}
      <div className={shellStyles.card}>
        <div className={shellStyles.cardHeader}>
          <h3 className={shellStyles.cardTitle}>Scheduled Sessions</h3>
          <button
            type="button"
            className={shellStyles.btnEdit}
            onClick={() => onNavigateTab('shows')}
          >
            View All
          </button>
        </div>

        {showsList.length === 0 ? (
          <div className={overviewStyles.snapshotEmpty}>No shows published yet.</div>
        ) : (
          <div className={overviewStyles.snapshotList}>
            {showsList.slice(0, 4).map((show) => (
              <div key={show.id} className={overviewStyles.snapshotItem}>
                <div className={overviewStyles.snapshotItemLeft}>
                  <img
                    src={
                      show.poster || show.posterUrl || show.poster_url || '/image/tobehonest_web.webp'
                    }
                    alt={show.name}
                    className={overviewStyles.snapshotThumbPoster}
                  />
                  <div className={overviewStyles.snapshotTextMeta}>
                    <div className={overviewStyles.snapshotTitle}>{show.name}</div>
                    <div className={overviewStyles.snapshotSub}>
                      {sanitizeLegacyDateString(
                        show.dateFormatted || show.date_formatted || show.date
                      )}{' '}
                      &middot; {show.venue}
                    </div>
                  </div>
                </div>
                <span
                  className={`${shellStyles.statusBadge} ${
                    show.status === 'upcoming'
                      ? shellStyles.statusBadgeActive
                      : shellStyles.statusBadgeLime
                  }`}
                >
                  {show.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Archives Snapshot */}
      <div className={shellStyles.card}>
        <div className={shellStyles.cardHeader}>
          <h3 className={shellStyles.cardTitle}>Media Archives</h3>
          <button
            type="button"
            className={shellStyles.btnEdit}
            onClick={() => onNavigateTab('media')}
          >
            View All
          </button>
        </div>

        {mediaList.length === 0 ? (
          <div className={overviewStyles.snapshotEmpty}>No media items archived yet.</div>
        ) : (
          <div className={overviewStyles.snapshotList}>
            {mediaList.slice(0, 4).map((media) => (
              <div key={media.id} className={overviewStyles.snapshotItem}>
                <div className={overviewStyles.snapshotItemLeft}>
                  <img
                    src={
                      media.thumbnail ||
                      media.thumbnail_url ||
                      media.image ||
                      media.image_url ||
                      '/image/jackie_web.webp'
                    }
                    alt={media.name}
                    className={overviewStyles.snapshotThumbMedia}
                  />
                  <div className={overviewStyles.snapshotTextMeta}>
                    <div className={overviewStyles.snapshotTitle}>{media.name}</div>
                    <div className={overviewStyles.snapshotSub}>
                      {media.date} &middot; {media.category || 'photo'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Inquiries Snapshot */}
      <div className={shellStyles.card}>
        <div className={shellStyles.cardHeader}>
          <h3 className={shellStyles.cardTitle}>Recent Inquiries</h3>
          <button
            type="button"
            className={shellStyles.btnEdit}
            onClick={() => onNavigateTab('inquiries')}
          >
            Inbox
          </button>
        </div>

        {inquiriesList.length === 0 ? (
          <div className={overviewStyles.snapshotEmpty}>Inbox is currently empty.</div>
        ) : (
          <div className={overviewStyles.snapshotList}>
            {inquiriesList.slice(0, 4).map((inquiry) => (
              <div key={inquiry.id} className={overviewStyles.snapshotItem}>
                <div className={overviewStyles.snapshotItemLeft}>
                  {inquiry.status === 'unread' && (
                    <span className={overviewStyles.snapshotUnreadDot} />
                  )}
                  <div className={overviewStyles.snapshotTextMeta}>
                    <div className={overviewStyles.snapshotTitle}>
                      {inquiry.name || inquiry.subject || 'Visitor'}
                    </div>
                    <div className={overviewStyles.snapshotSub}>
                      {inquiry.email || 'No email'}
                    </div>
                  </div>
                </div>
                <span
                  className={`${shellStyles.categoryTag} ${
                    shellStyles[getInquiryCategoryClass(inquiry.category)]
                  }`}
                >
                  {inquiry.category || 'General'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

