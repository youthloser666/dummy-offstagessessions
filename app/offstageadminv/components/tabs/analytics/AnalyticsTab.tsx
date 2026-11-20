'use client';

import React from 'react';
import type { AnalyticsData } from '../../../types';
import { formatAnalyticsShortDate, formatAnalyticsTime } from '../../../utils/dateFormatters';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';

interface AnalyticsTabProps {
  analyticsData: AnalyticsData | null;
  isLoadingAnalytics: boolean;
  onRefreshAnalytics: () => void;
  onResetAnalytics: () => void;
}

export function AnalyticsTab({
  analyticsData,
  isLoadingAnalytics,
  onRefreshAnalytics,
  onResetAnalytics,
}: AnalyticsTabProps) {
  const topPages = analyticsData?.topPages || [];
  const trafficSources = analyticsData?.sources || [];
  const devices = analyticsData?.devices || [];
  const browsers = analyticsData?.browsers || [];
  const recentVisits = analyticsData?.recentVisits || [];
  const totalSourcesCount = Math.max(
    trafficSources.reduce((sum, item) => sum + item.count, 0),
    1
  );

  return (
    <div>
      <header className={shellStyles.pageHeader}>
        <div>
          <h1 className={shellStyles.pageTitle}>Traffic &amp; Analytics</h1>
          <p className={shellStyles.pageDesc}>
            First-party page view telemetry, visitor sources, devices &amp; live request logs
          </p>
        </div>

        <div className={shellStyles.headerActions}>
          <button
            type="button"
            className={shellStyles.btnSecondary}
            onClick={onRefreshAnalytics}
            disabled={isLoadingAnalytics}
          >
            {isLoadingAnalytics ? 'Refreshing...' : 'Refresh Analytics'}
          </button>
          <button
            type="button"
            className={shellStyles.btnDanger}
            onClick={onResetAnalytics}
            disabled={isLoadingAnalytics}
          >
            Reset Traffic Data
          </button>
        </div>
      </header>

      <section className={shellStyles.metricsGrid}>
        <div className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>All-Time Views</span>
          <span className={shellStyles.metricValue}>
            {analyticsData?.totalViews?.toLocaleString() || '0'}
          </span>
          <span className={shellStyles.metricSubtitle}>Cumulative tracked page views</span>
        </div>

        <div className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Unique Visitors</span>
          <span className={`${shellStyles.metricValue} ${shellStyles.metricValueLime}`}>
            {analyticsData?.uniqueVisitors?.toLocaleString() || '0'}
          </span>
          <span className={shellStyles.metricSubtitle}>Distinct anonymized visitor hashes</span>
        </div>

        <div className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Views Today</span>
          <span className={`${shellStyles.metricValue} ${shellStyles.metricValueSuccess}`}>
            {analyticsData?.viewsToday?.toLocaleString() || '0'}
          </span>
          <span className={shellStyles.metricSubtitle}>
            {analyticsData?.uniqueVisitorsToday?.toLocaleString() || '0'} unique visitors today
          </span>
        </div>

        <div className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Top Destination</span>
          <span className={`${shellStyles.metricValue} ${shellStyles.metricValueCompact}`}>
            {topPages[0]?.path || '/'}
          </span>
          <span className={shellStyles.metricSubtitle}>
            {topPages[0] ? `${topPages[0].count} hits (${topPages[0].percentage}%)` : 'No traffic yet'}
          </span>
        </div>
      </section>

      <div className={`${shellStyles.dashboardSplit} ${overviewStyles.sectionSpacedLg}`}>
        <div className={shellStyles.card}>
          <div className={shellStyles.cardHeader}>
            <h3 className={shellStyles.cardTitle}>Most Visited Routes</h3>
            <span className={overviewStyles.cellSecondaryText}>{topPages.length} tracked paths</span>
          </div>

          {topPages.length === 0 ? (
            <div className={overviewStyles.snapshotEmpty}>No route telemetry available yet.</div>
          ) : (
            <div className={overviewStyles.snapshotList}>
              {topPages.slice(0, 6).map((pageMetric) => (
                <div key={pageMetric.path} className={overviewStyles.analyticsBarRow}>
                  <span className={shellStyles.trafficPathBadge}>{pageMetric.path}</span>
                  <div className={shellStyles.analyticsBarContainer}>
                    <div
                      className={overviewStyles.analyticsBarFillPrimary}
                      style={{ width: `${Math.min(pageMetric.percentage || 0, 100)}%` }}
                    />
                  </div>
                  <span className={overviewStyles.analyticsCountText}>{pageMetric.count}</span>
                  <span className={overviewStyles.analyticsShareText}>
                    {pageMetric.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={shellStyles.card}>
          <div className={shellStyles.cardHeader}>
            <h3 className={shellStyles.cardTitle}>Acquisition &amp; Referrers</h3>
            <span className={overviewStyles.cellSecondaryText}>
              {trafficSources.length} origins
            </span>
          </div>

          {trafficSources.length === 0 ? (
            <div className={overviewStyles.snapshotEmpty}>No referrer telemetry recorded yet.</div>
          ) : (
            <div className={overviewStyles.snapshotList}>
              {trafficSources.slice(0, 6).map((sourceMetric) => {
                const percent =
                  sourceMetric.percentage ??
                  Math.round((sourceMetric.count / totalSourcesCount) * 100);

                return (
                  <div key={sourceMetric.source} className={overviewStyles.analyticsBarRow}>
                    <span className={shellStyles.sourceBadge}>{sourceMetric.source || 'Direct'}</span>
                    <div className={shellStyles.analyticsBarContainer}>
                      <div
                        className={`${shellStyles.analyticsBarFill} ${shellStyles.analyticsBarFillSuccess}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <span className={overviewStyles.analyticsCountText}>{sourceMetric.count}</span>
                    <span className={overviewStyles.analyticsShareText}>{percent}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={`${shellStyles.dashboardSplit} ${overviewStyles.sectionSpacedLg}`}>
        <div className={shellStyles.card}>
          <div className={shellStyles.cardHeader}>
            <h3 className={shellStyles.cardTitle}>Device Form Factors</h3>
          </div>

          {devices.length === 0 ? (
            <div className={overviewStyles.snapshotEmpty}>No device telemetry recorded yet.</div>
          ) : (
            <div className={overviewStyles.snapshotList}>
              {devices.map((deviceMetric) => (
                <div key={deviceMetric.device} className={overviewStyles.analyticsBarRow}>
                  <span className={shellStyles.tagPill}>{deviceMetric.device}</span>
                  <div className={shellStyles.analyticsBarContainer}>
                    <div
                      className={`${shellStyles.analyticsBarFill} ${shellStyles.analyticsBarFillInfo}`}
                      style={{ width: `${Math.min(deviceMetric.percentage || 0, 100)}%` }}
                    />
                  </div>
                  <span className={overviewStyles.analyticsCountText}>{deviceMetric.count}</span>
                  <span className={overviewStyles.analyticsShareText}>
                    {deviceMetric.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={shellStyles.card}>
          <div className={shellStyles.cardHeader}>
            <h3 className={shellStyles.cardTitle}>Browser Share</h3>
          </div>

          {browsers.length === 0 ? (
            <div className={overviewStyles.snapshotEmpty}>No browser telemetry recorded yet.</div>
          ) : (
            <div className={overviewStyles.snapshotList}>
              {browsers.slice(0, 5).map((browserMetric) => (
                <div key={browserMetric.browser} className={overviewStyles.analyticsBarRow}>
                  <span className={shellStyles.tagPill}>{browserMetric.browser}</span>
                  <div className={shellStyles.analyticsBarContainer}>
                    <div
                      className={`${shellStyles.analyticsBarFill} ${shellStyles.analyticsBarFillWarn}`}
                      style={{ width: `${Math.min(browserMetric.percentage || 0, 100)}%` }}
                    />
                  </div>
                  <span className={overviewStyles.analyticsCountText}>{browserMetric.count}</span>
                  <span className={overviewStyles.analyticsShareText}>
                    {browserMetric.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`${shellStyles.card} ${shellStyles.cardFlush}`}>
        <div className={`${shellStyles.cardHeader} ${shellStyles.cardHeaderBordered}`}>
          <div>
            <h3 className={shellStyles.cardTitle}>Recent Live Visits</h3>
            <p className={shellStyles.cardSubtitle}>Latest 20 recorded storefront &amp; show visits</p>
          </div>
        </div>

        <div className={shellStyles.tableWrapper}>
          <table className={shellStyles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Path</th>
                <th>Device / OS</th>
                <th>Browser</th>
                <th>Referrer</th>
              </tr>
            </thead>
            <tbody>
              {recentVisits.length === 0 ? (
                <tr>
                  <td colSpan={5} className={shellStyles.tableEmptyCell}>
                    No recent page views recorded.
                  </td>
                </tr>
              ) : (
                recentVisits.slice(0, 20).map((visit, index) => (
                  <tr key={visit.id ?? index} className={shellStyles.tableRow}>
                    <td className={overviewStyles.monoMuted}>
                      {formatAnalyticsShortDate(visit.created_at)}{' '}
                      {formatAnalyticsTime(visit.created_at)}
                    </td>
                    <td>
                      <span className={shellStyles.trafficPathBadge}>{visit.path || '/'}</span>
                    </td>
                    <td className={overviewStyles.cellSecondaryText}>
                      {visit.device || 'Desktop'}
                      {visit.os ? ` · ${visit.os}` : ''}
                    </td>
                    <td className={overviewStyles.cellSecondaryText}>{visit.browser || 'Unknown'}</td>
                    <td>
                      <span className={shellStyles.sourceBadge}>{visit.referrer || 'Direct'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

