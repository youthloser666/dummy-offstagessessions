'use client';

import React from 'react';
import { usePixelEventSimulator } from '../../../hooks/usePixelEventSimulator';
import type { AnalyticsData, NotifyHandler } from '../../../types';
import metaStyles from '../../../styles/adminMetaPixel.module.css';
import shellStyles from '../../../styles/adminShell.module.css';
import { PixelAuditMatrix } from './PixelAuditMatrix';
import { PixelEventConsole } from './PixelEventConsole';
import { PixelEventSimulator } from './PixelEventSimulator';

interface MetaPixelTabProps {
  analyticsData?: AnalyticsData | null;
  notify: NotifyHandler;
}

export function MetaPixelTab({ analyticsData, notify }: MetaPixelTabProps) {
  const simulator = usePixelEventSimulator(notify);

  return (
    <div>
      <header className={shellStyles.pageHeader}>
        <div>
          <h1 className={shellStyles.pageTitle}>Meta Pixel &amp; Conversion Events</h1>
          <p className={shellStyles.pageDesc}>
            Inspect tracking integration, dispatch test conversion events &amp; audit funnel tags
          </p>
        </div>
      </header>

      <div className={`${shellStyles.card} ${metaStyles.pixelHeaderCard}`}>
        <div className={metaStyles.pixelHeaderTop}>
          <div className={metaStyles.pixelIdentityCluster}>
            <div className={metaStyles.pixelLogoBadge} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
              </svg>
            </div>

            <div className={metaStyles.pixelTitleGroup}>
              <h3 className={metaStyles.pixelHeading}>Offstage Sessions Pixel Property</h3>
              <div className={metaStyles.pixelIdBar}>
                <code className={metaStyles.pixelIdCode}>ID: {simulator.pixelId}</code>
                <button
                  type="button"
                  className={shellStyles.btnEdit}
                  onClick={() => {
                    void simulator.handleCopyPixelId();
                  }}
                >
                  {simulator.hasCopiedPixelId ? 'Copied' : 'Copy ID'}
                </button>
              </div>
            </div>
          </div>

          <div className={metaStyles.pixelStatusCluster}>
            <span
              className={
                simulator.isFbqLoaded ? metaStyles.pixelLiveBadge : metaStyles.pixelSimBadge
              }
            >
              <span className={metaStyles.pixelStatusDot} />
              {simulator.isFbqLoaded
                ? 'fbq() Loaded & Active'
                : 'fbq() Blocked / Local Mode'}
            </span>
            <span className={metaStyles.pixelGaMeta}>
              GA4 Property: {simulator.gaMeasurementId} &middot;{' '}
              {analyticsData?.totalViews?.toLocaleString() || '0'} PageViews Recorded
            </span>
          </div>
        </div>
      </div>

      <div className={metaStyles.pixelMainGrid}>
        <PixelEventSimulator
          customEventName={simulator.customEventName}
          customEventPayload={simulator.customEventPayload}
          onCustomEventNameChange={simulator.setCustomEventName}
          onCustomEventPayloadChange={simulator.setCustomEventPayload}
          onFireStandardEvent={simulator.handleFireStandardEvent}
          onFireCustomEvent={simulator.handleFireCustomEvent}
        />

        <PixelEventConsole
          filteredEventLogs={simulator.filteredEventLogs}
          totalLogsCount={simulator.eventLogs.length}
          eventFilter={simulator.eventFilter}
          onFilterChange={simulator.setEventFilter}
          onClearLogs={simulator.handleClearEventLogs}
        />
      </div>

      <PixelAuditMatrix />
    </div>
  );
}
