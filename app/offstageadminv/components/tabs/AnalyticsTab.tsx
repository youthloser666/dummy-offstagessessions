'use client';

import React from 'react';
import styles from '../../admin.module.css';
import { AnalyticsData } from '../../types';

interface AnalyticsTabProps {
  analyticsData: AnalyticsData | null;
  loadingAnalytics: boolean;
  loadAnalytics: () => void;
  handleResetAnalytics: () => void;
  notify: (type: 'success' | 'error', message: string) => void;
}

export default function AnalyticsTab({
  analyticsData,
  loadingAnalytics,
  loadAnalytics,
  handleResetAnalytics,
  notify,
}: AnalyticsTabProps) {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Site Traffic &amp; Visitor Analytics</h1>
          <p className={styles.pageDesc}>
            Live real-time monitoring of people visiting your website, page views, devices, and traffic origins.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: '#55f385',
              backgroundColor: 'rgba(85, 243, 133, 0.1)',
              padding: '6px 12px',
              borderRadius: 20,
              border: '1px solid rgba(85, 243, 133, 0.25)',
            }}
          >
            <span className={styles.trafficLiveDot} />
            <span>Tracking Active</span>
          </div>

          <button
            onClick={() => {
              loadAnalytics();
              notify('success', 'Traffic analytics refreshed');
            }}
            disabled={loadingAnalytics}
            className={styles.btnSecondary}
          >
            {loadingAnalytics ? 'Refreshing...' : 'Refresh Traffic'}
          </button>

          <button
            onClick={handleResetAnalytics}
            disabled={loadingAnalytics}
            className={styles.btnSecondary}
            style={{
              backgroundColor: 'rgba(255, 68, 68, 0.1)',
              borderColor: 'rgba(255, 68, 68, 0.3)',
              color: '#ff6b6b',
            }}
            title="Clear all visitor traffic history"
          >
            Reset Analytics
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={styles.btnPrimary}
            style={{ textDecoration: 'none' }}
          >
            Open Live Site ↗
          </a>
        </div>
      </div>

      {/* Primary Visitor KPI Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Page Views</div>
          <div className={styles.metricValue}>
            {analyticsData ? (analyticsData.totalViews || 0).toLocaleString() : '—'}
          </div>
          <div className={styles.metricSubtitle}>
            {analyticsData?.hasData ? 'Past 30 days traffic' : 'Awaiting first visits'}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Unique Visitors</div>
          <div className={styles.metricValue} style={{ color: '#e2ff32' }}>
            {analyticsData ? (analyticsData.uniqueVisitors || 0).toLocaleString() : '—'}
          </div>
          <div className={styles.metricSubtitle} style={{ color: '#e2ff32' }}>
            Distinct audience visitors
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Today&apos;s Traffic</div>
          <div className={styles.metricValue}>
            {analyticsData ? (analyticsData.viewsToday || 0).toLocaleString() : '—'}
          </div>
          <div className={styles.metricSubtitle}>
            {analyticsData ? `${analyticsData.uniqueVisitorsToday || 0} unique today` : 'Live daily count'}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Top Visited Route</div>
          <div
            className={styles.metricValue}
            style={{ fontSize: 20, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {analyticsData?.topPages?.[0]?.path || '/'}
          </div>
          <div className={styles.metricSubtitle}>
            {analyticsData?.topPages?.[0]
              ? `${analyticsData.topPages[0].count} views (${analyticsData.topPages[0].percentage}%)`
              : 'No visits yet'}
          </div>
        </div>
      </div>

      {/* Split: Top Pages vs Device Breakdown */}
      <div className={styles.dashboardSplit}>
        {/* Top Pages Visited */}
        <div className={styles.card} style={{ marginBottom: 0 }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Top Visited Pages</h3>
            <span style={{ fontSize: 11, color: '#86868b' }}>By view count</span>
          </div>

          {analyticsData?.topPages && analyticsData.topPages.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {analyticsData.topPages.map((p: any, idx: number) => (
                <div key={p.path || idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className={styles.trafficPathBadge}>{p.path}</span>
                    <span style={{ fontSize: 12, color: '#ffffff', fontWeight: 600 }}>
                      {p.count} views <span style={{ color: '#86868b', fontWeight: 400 }}>({p.percentage}%)</span>
                    </span>
                  </div>
                  <div className={styles.analyticsBarContainer}>
                    <div
                      className={styles.analyticsBarFill}
                      style={{
                        width: `${Math.max(p.percentage, 4)}%`,
                        background: idx === 0 ? 'linear-gradient(90deg, #55f385, #e2ff32)' : '#e2ff32',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#86868b', fontSize: 13 }}>
              <p style={{ margin: '0 0 8px 0', color: '#ffffff', fontWeight: 500 }}>No page traffic logged yet</p>
              <p style={{ margin: 0, fontSize: 12 }}>
                Visits to your landing page, /shows, /media, etc. will automatically appear here once visitors browse.
              </p>
            </div>
          )}
        </div>

        {/* Devices, Browsers & Traffic Sources */}
        <div className={styles.card} style={{ marginBottom: 0 }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Device &amp; Audience Sources</h3>
            <span style={{ fontSize: 11, color: '#86868b' }}>Browser breakdown</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Device Types */}
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86868b', marginBottom: 10, fontWeight: 600 }}>
                Device Types
              </div>
              {(analyticsData?.devices || [
                { device: 'desktop', count: 0, percentage: 0 },
                { device: 'mobile', count: 0, percentage: 0 },
                { device: 'tablet', count: 0, percentage: 0 },
              ]).map((dev: any) => (
                <div key={dev.device} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#fff', marginBottom: 4 }}>
                    <span style={{ textTransform: 'capitalize' }}>
                      {dev.device === 'desktop' ? '💻 Desktop' : dev.device === 'mobile' ? '📱 Mobile' : '📟 Tablet'}
                    </span>
                    <strong>{dev.count} ({dev.percentage}%)</strong>
                  </div>
                  <div className={styles.analyticsBarContainer}>
                    <div
                      className={styles.analyticsBarFill}
                      style={{
                        width: `${Math.max(dev.percentage, dev.count > 0 ? 4 : 0)}%`,
                        background: dev.device === 'mobile' ? '#64b5f6' : dev.device === 'desktop' ? '#55f385' : '#c77dff',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Sources / Referrers */}
            {analyticsData?.sources && analyticsData.sources.length > 0 && (
              <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86868b', marginBottom: 8, fontWeight: 600 }}>
                  Traffic Sources
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {analyticsData.sources.map((s: any) => (
                    <span key={s.source} className={styles.sourceBadge}>
                      {s.source} · {s.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Operating Systems */}
            {analyticsData?.osBreakdown && analyticsData.osBreakdown.length > 0 && (
              <div style={{ paddingTop: 8 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86868b', marginBottom: 8, fontWeight: 600 }}>
                  Platforms
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {analyticsData.osBreakdown.map((item: any) => (
                    <span key={item.os} className={styles.tagPill}>
                      {item.os}: {item.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Real-Time Visitor Stream */}
      <div className={styles.card} style={{ marginTop: 24, padding: 0 }}>
        <div className={styles.cardHeader} style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <div>
            <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={styles.trafficLiveDot} />
              Live Visitor Activity Stream
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#86868b' }}>
              Most recent real-time audience page navigations across the website.
            </p>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 140 }}>Timestamp</th>
                <th>Visited Route</th>
                <th>Device</th>
                <th>Browser &amp; OS</th>
                <th>Source / Referrer</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData?.recentVisits && analyticsData.recentVisits.length > 0 ? (
                analyticsData.recentVisits.map((visit: any, idx: number) => (
                  <tr key={visit.id || idx} className={styles.tableRow}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: '#a1a1a6' }}>
                      {visit.created_at
                        ? new Date(visit.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : 'Just now'}
                      <div style={{ fontSize: 10, color: '#666' }}>
                        {visit.created_at ? new Date(visit.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                      </div>
                    </td>
                    <td>
                      <span className={styles.trafficPathBadge}>{visit.path || '/'}</span>
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          textTransform: 'capitalize',
                          backgroundColor:
                            visit.device === 'mobile'
                              ? 'rgba(100, 181, 246, 0.15)'
                              : 'rgba(85, 243, 133, 0.15)',
                          color: visit.device === 'mobile' ? '#64b5f6' : '#55f385',
                        }}
                      >
                        {visit.device === 'mobile' ? '📱 Mobile' : '💻 Desktop'}
                      </span>
                    </td>
                    <td style={{ color: '#d1d1d6', fontSize: 12 }}>
                      {visit.browser || 'Browser'} · {visit.os || 'OS'}
                    </td>
                    <td style={{ color: '#86868b', fontSize: 12 }}>
                      {visit.referrer && visit.referrer !== 'Direct' ? (
                        <span style={{ color: '#e2ff32' }}>{visit.referrer}</span>
                      ) : (
                        'Direct / Bookmark'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px 0', color: '#86868b' }}>
                    <p style={{ margin: '0 0 6px 0', color: '#fff', fontWeight: 500 }}>No live traffic recorded yet</p>
                    <p style={{ margin: 0, fontSize: 12 }}>
                      Visit the website at{' '}
                      <a href="/" target="_blank" style={{ color: '#e2ff32', textDecoration: 'underline' }}>
                        localhost:3000 /
                      </a>{' '}
                      to test and verify the live visitor stream.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
