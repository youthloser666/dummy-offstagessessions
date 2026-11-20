'use client';

import React from 'react';
import { META_PIXEL_STANDARD_EVENTS_MATRIX } from '../../../constants/defaults';
import metaStyles from '../../../styles/adminMetaPixel.module.css';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';

export function PixelAuditMatrix() {
  return (
    <div className={`${shellStyles.card} ${shellStyles.cardFlush}`}>
      <div className={`${shellStyles.cardHeader} ${shellStyles.cardHeaderBordered}`}>
        <div>
          <h3 className={shellStyles.cardTitle}>Tracked Events Implementation Audit</h3>
          <p className={shellStyles.cardSubtitle}>
            Standard Meta Pixel + Google Analytics 4 dual-mapped conversion points
          </p>
        </div>
      </div>

      <div className={shellStyles.tableWrapper}>
        <table className={shellStyles.table}>
          <thead>
            <tr>
              <th>Standard Event</th>
              <th>Trigger Code Location</th>
              <th>Tracked Parameters</th>
              <th>Ad Optimization Goal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {META_PIXEL_STANDARD_EVENTS_MATRIX.map((row) => (
              <tr key={row.eventName} className={shellStyles.tableRow}>
                <td className={overviewStyles.cellPrimaryTitle}>{row.eventName}</td>
                <td className={overviewStyles.cellSecondaryText}>
                  {row.triggerLocationPrefix}
                  {row.triggerCode && (
                    <code className={metaStyles.auditCodeTag}>{row.triggerCode}</code>
                  )}
                  {row.triggerSuffix}
                  {row.secondCode && (
                    <code className={metaStyles.auditCodeTag}>{row.secondCode}</code>
                  )}
                </td>
                <td className={overviewStyles.cellSecondaryText}>{row.parameters}</td>
                <td className={overviewStyles.cellSecondaryText}>{row.optimizationGoal}</td>
                <td>
                  <span className={`${shellStyles.statusBadge} ${shellStyles.statusBadgeActive}`}>
                    {row.statusLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={metaStyles.auditNoticeWell}>
        Events dispatched here invoke both <code className={metaStyles.auditCodeTag}>fbq()</code>{' '}
        (Meta Pixel) and <code className={metaStyles.auditCodeTag}>gtag()</code> (GA4). When testing
        locally with ad-blockers or in environments where the Meta Pixel script is blocked, test runs
        are recorded locally in browser storage cleanly as <code className={metaStyles.auditCodeTag}>LOCAL MOCK</code>.
      </div>
    </div>
  );
}

