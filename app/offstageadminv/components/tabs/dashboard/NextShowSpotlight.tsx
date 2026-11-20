'use client';

import React from 'react';
import type { Show } from '../../../types';
import { sanitizeLegacyDateString } from '../../../utils/dateFormatters';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';

interface NextShowSpotlightProps {
  nextShow: Show | null;
  onNavigateShows: () => void;
}

export function NextShowSpotlight({ nextShow, onNavigateShows }: NextShowSpotlightProps) {
  const posterSource =
    nextShow?.poster ||
    nextShow?.posterUrl ||
    nextShow?.poster_url ||
    '/image/tobehonest_web.webp';

  const parsedTags = nextShow
    ? Array.isArray(nextShow.tags)
      ? nextShow.tags
      : typeof nextShow.tags === 'string'
        ? nextShow.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []
    : [];

  return (
    <div className={shellStyles.card}>
      <div className={shellStyles.cardHeader}>
        <div>
          <h3 className={shellStyles.cardTitle}>Next Show Spotlight</h3>
          <p className={shellStyles.cardSubtitle}>Featured or earliest scheduled upcoming session</p>
        </div>

        <button type="button" className={shellStyles.btnEdit} onClick={onNavigateShows}>
          Manage &rarr;
        </button>
      </div>

      {nextShow ? (
        <div className={overviewStyles.spotlightContent}>
          <img
            src={posterSource}
            alt={nextShow.name}
            className={overviewStyles.spotlightPosterImg}
          />

          <div className={overviewStyles.spotlightMeta}>
            <div className={overviewStyles.spotlightHeadingRow}>
              <h4 className={overviewStyles.spotlightName}>{nextShow.name}</h4>
              <span
                className={`${shellStyles.statusBadge} ${
                  nextShow.status === 'upcoming'
                    ? shellStyles.statusBadgeActive
                    : shellStyles.statusBadgeLime
                }`}
              >
                {nextShow.status || 'upcoming'}
              </span>
            </div>

            {nextShow.subtitle && (
              <p className={overviewStyles.spotlightSubtitle}>{nextShow.subtitle}</p>
            )}

            <div className={overviewStyles.spotlightDetails}>
              <div>
                Date:{' '}
                <span className={overviewStyles.spotlightDetailValue}>
                  {sanitizeLegacyDateString(
                    nextShow.dateFormatted || nextShow.date_formatted || nextShow.date
                  ) || 'TBA'}
                </span>
              </div>
              <div>
                Venue:{' '}
                <span className={overviewStyles.spotlightDetailValue}>{nextShow.venue}</span>
              </div>
              {nextShow.time && (
                <div>
                  Time: <span className={overviewStyles.spotlightDetailValue}>{nextShow.time}</span>
                </div>
              )}
            </div>

            {parsedTags.length > 0 && (
              <div className={overviewStyles.spotlightTagsRow}>
                {parsedTags.slice(0, 4).map((tag) => (
                  <span key={tag} className={overviewStyles.spotlightTag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={overviewStyles.spotlightEmpty}>
          <p>No upcoming sessions scheduled yet.</p>
          <button type="button" className={shellStyles.btnPrimary} onClick={onNavigateShows}>
            Schedule First Session
          </button>
        </div>
      )}
    </div>
  );
}

