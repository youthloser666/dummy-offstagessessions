'use client';

import React from 'react';
import type { PixelEventFilter, PixelEventLogEntry } from '../../../types';
import metaStyles from '../../../styles/adminMetaPixel.module.css';
import shellStyles from '../../../styles/adminShell.module.css';

interface PixelEventConsoleProps {
  filteredEventLogs: PixelEventLogEntry[];
  totalLogsCount: number;
  eventFilter: PixelEventFilter;
  onFilterChange: (filter: PixelEventFilter) => void;
  onClearLogs: () => void;
}

const FILTER_OPTIONS: { value: PixelEventFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'standard', label: 'Standard' },
  { value: 'custom', label: 'Custom' },
];

export function PixelEventConsole({
  filteredEventLogs,
  totalLogsCount,
  eventFilter,
  onFilterChange,
  onClearLogs,
}: PixelEventConsoleProps) {
  return (
    <div className={shellStyles.card}>
      <div className={shellStyles.cardHeader}>
        <div>
          <h3 className={shellStyles.cardTitle}>Pixel Activity Log ({totalLogsCount})</h3>
          <p className={shellStyles.cardSubtitle}>Local browser dispatch inspector</p>
        </div>

        <div className={metaStyles.consoleFilterGroup}>
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${metaStyles.consoleFilterBtn} ${
                eventFilter === option.value ? metaStyles.consoleFilterBtnActive : ''
              }`}
              onClick={() => onFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
          <button
            type="button"
            className={shellStyles.btnDanger}
            onClick={onClearLogs}
            disabled={totalLogsCount === 0}
          >
            Clear
          </button>
        </div>
      </div>

      {filteredEventLogs.length === 0 ? (
        <div className={metaStyles.consoleEmptyState}>
          No events match this filter yet. Trigger a test event on the left to inspect its payload.
        </div>
      ) : (
        <div className={metaStyles.consoleLogList} data-lenis-prevent="true">
          {filteredEventLogs.map((entry) => (
            <div key={entry.id} className={metaStyles.consoleLogEntry}>
              <div className={metaStyles.consoleLogHeader}>
                <div className={metaStyles.consoleLogIdentity}>
                  <span className={metaStyles.consoleEventName}>{entry.name}</span>
                  <span className={shellStyles.tagPill}>{entry.type}</span>
                  <span
                    className={`${shellStyles.statusBadge} ${
                      entry.status === 'sent'
                        ? shellStyles.statusBadgeActive
                        : shellStyles.statusBadgeWarning
                    }`}
                  >
                    {entry.status === 'sent' ? 'DISPATCHED' : 'LOCAL MOCK'}
                  </span>
                </div>
                <span className={metaStyles.consoleTimestamp}>{entry.timestamp}</span>
              </div>

              {entry.params && Object.keys(entry.params).length > 0 && (
                <pre className={metaStyles.consolePayloadPre}>
                  {JSON.stringify(entry.params, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

