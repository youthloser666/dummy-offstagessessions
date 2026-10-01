'use client';

import React from 'react';
import styles from '../../admin.module.css';
import { Show, MediaItem, Inquiry, AnalyticsData, TabType } from '../../types';
import { cleanDateStr } from '../../utils';

interface DashboardTabProps {
  showsList: Show[];
  mediaList: MediaItem[];
  inquiriesList: Inquiry[];
  analyticsData: AnalyticsData | null;
  connStatus: any;
  testingConn: boolean;
  checkConnection: () => void;
  loadShows: () => void;
  loadMedia: () => void;
  loadInquiries: () => void;
  loadAnalytics: () => void;
  setActiveTab: (tab: TabType) => void;
  setShowCreateDrawer: (open: boolean) => void;
  unreadInquiriesCount: number;
}

export default function DashboardTab({
  showsList,
  mediaList,
  inquiriesList,
  analyticsData,
  connStatus,
  testingConn,
  checkConnection,
  loadShows,
  loadMedia,
  loadInquiries,
  loadAnalytics,
  setActiveTab,
  setShowCreateDrawer,
  unreadInquiriesCount,
}: DashboardTabProps) {
  const upcomingShows = showsList.filter((s) => s.status === 'upcoming');
  const nextShow = upcomingShows[0] || showsList[0] || null;
  const ticketLinksCount = showsList.filter((s) => Boolean(s.ticketUrl || s.ticket_url || s.poshUrl || s.posh_url)).length;

  const handleRefreshAll = () => {
    loadShows();
    loadMedia();
    loadInquiries();
    loadAnalytics();
    checkConnection();
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageDesc}>
            Real-time overview of scheduled sessions, ticket links, and media archives.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={handleRefreshAll}
            className={styles.btnSecondary}
            title="Reload all dashboard data"
          >
            Refresh Data
          </button>
          <button
            onClick={() => {
              setActiveTab('shows');
              setShowCreateDrawer(true);
            }}
            className={styles.btnPrimary}
          >
            + New Show
          </button>
        </div>
      </div>

      {/* Cloud Services Connection Card */}
      <div className={styles.connectionCard}>
        <div className={styles.connectionItems}>
          <div className={styles.connectionItem}>
            <span
              className={`${styles.statusDot} ${
                connStatus?.supabase?.connected ? styles.dotConnected : styles.dotOffline
              }`}
            />
            <span>
              Supabase:{' '}
              {connStatus
                ? connStatus.supabase?.connected
                  ? `Connected (${connStatus.supabase.showsCount} shows in DB)`
                  : 'Disconnected'
                : 'Checking...'}
            </span>
          </div>

          <div className={styles.connectionItem}>
            <span
              className={`${styles.statusDot} ${
                connStatus?.cloudinary?.configured ? styles.dotConnected : styles.dotWarning
              }`}
            />
            <span>
              Cloudinary:{' '}
              {connStatus
                ? connStatus.cloudinary?.configured
                  ? `Connected (${connStatus.cloudinary.cloudName})`
                  : 'Fallback Active'
                : 'Checking...'}
            </span>
          </div>

          <div className={styles.connectionItem}>
            <span
              className={`${styles.statusDot} ${
                connStatus?.shopify?.connected ? styles.dotConnected : styles.dotWarning
              }`}
            />
            <span>
              Shopify:{' '}
              {connStatus
                ? connStatus.shopify?.connected
                  ? `Connected (${connStatus.shopify.productsCount} products)`
                  : 'Disconnected'
                : 'Checking...'}
            </span>
          </div>
        </div>

        <button
          onClick={checkConnection}
          disabled={testingConn}
          className={styles.btnSecondary}
          style={{ fontSize: 11, padding: '4px 10px' }}
        >
          {testingConn ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {/* Top Level KPIs */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Sessions</div>
          <div className={styles.metricValue}>{showsList.length}</div>
          <div className={styles.metricSubtitle}>
            {upcomingShows.length} Upcoming · {showsList.filter((s) => s.status === 'past').length} Past
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Next Upcoming</div>
          <div
            className={styles.metricValue}
            style={{ fontSize: 20, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {nextShow ? nextShow.name : 'None'}
          </div>
          <div className={styles.metricSubtitle}>
            {nextShow
              ? cleanDateStr(nextShow.date || nextShow.date_formatted || nextShow.dateCode || nextShow.date_code)
              : 'No dates scheduled'}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Media Galleries</div>
          <div className={styles.metricValue}>{mediaList.length}</div>
          <div className={styles.metricSubtitle}>Synced with Facebook Albums</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Active Ticketing</div>
          <div className={styles.metricValue}>{ticketLinksCount}</div>
          <div className={styles.metricSubtitle}>Active Ticket Outlets</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Tracked Emails</div>
          <div className={styles.metricValue}>{inquiriesList.length}</div>
          <div className={styles.metricSubtitle}>
            {unreadInquiriesCount > 0 ? (
              <span style={{ color: '#e2ff32', fontWeight: 600 }}>{unreadInquiriesCount} Unread</span>
            ) : (
              '0 Unread'
            )}{' '}
            · {inquiriesList.filter((i) => i.category === 'Booking').length} Bookings
          </div>
        </div>
      </div>

      {/* Real-time Traffic Activity Diagram */}
      <div className={styles.trafficChartCard}>
        <div className={styles.trafficChartHeader}>
          <div className={styles.trafficChartTitleGroup}>
            <span className={styles.trafficLiveDot} />
            <div>
              <h3 className={styles.cardTitle}>Traffic &amp; Visitor Activity Diagram</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#86868b' }}>
                Real-time 7-day page views and unique audience volume
              </p>
            </div>
          </div>

          <div className={styles.trafficChartStats}>
            <div className={styles.trafficStatBadge}>
              <span className={styles.trafficStatLabel}>Today</span>
              <span className={styles.trafficStatVal} style={{ color: '#e2ff32' }}>
                {analyticsData ? (analyticsData.viewsToday || 0).toLocaleString() : '—'} views
              </span>
            </div>
            <div className={styles.trafficStatBadge}>
              <span className={styles.trafficStatLabel}>7-Day Volume</span>
              <span className={styles.trafficStatVal}>
                {analyticsData?.dailyTrend
                  ? analyticsData.dailyTrend.reduce((acc: number, d: any) => acc + (d.views || 0), 0).toLocaleString()
                  : analyticsData?.totalViews?.toLocaleString() || '—'}{' '}
                views
              </span>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${styles.btnSecondary} ${styles.trafficChartFullBtn}`}
              style={{ fontSize: 11, padding: '5px 10px' }}
            >
              Full Analytics →
            </button>
          </div>
        </div>

        <div className={styles.trafficChartBody}>
          {/* 7-Day Interactive Columns */}
          {(() => {
            const trend = analyticsData?.dailyTrend && analyticsData.dailyTrend.length === 7
              ? analyticsData.dailyTrend
              : [
                  { shortDay: 'Sat', label: '6d ago', views: 0, uniqueVisitors: 0 },
                  { shortDay: 'Sun', label: '5d ago', views: 0, uniqueVisitors: 0 },
                  { shortDay: 'Mon', label: '4d ago', views: 0, uniqueVisitors: 0 },
                  { shortDay: 'Tue', label: '3d ago', views: 0, uniqueVisitors: 0 },
                  { shortDay: 'Wed', label: '2d ago', views: 0, uniqueVisitors: 0 },
                  { shortDay: 'Thu', label: 'Yesterday', views: 0, uniqueVisitors: 0 },
                  { shortDay: 'Today', label: 'Today', views: analyticsData?.viewsToday || 0, uniqueVisitors: analyticsData?.uniqueVisitorsToday || 0 },
                ];

            const maxViews = Math.max(...trend.map((d: any) => d.views || 0), 5);

            return (
              <>
                <div className={styles.trafficBarsContainer}>
                  {trend.map((d: any, idx: number) => {
                    const isToday = idx === trend.length - 1;
                    const heightPct = Math.max(Math.round(((d.views || 0) / maxViews) * 100), (d.views || 0) > 0 ? 8 : 2);

                    return (
                      <div key={d.date || idx} className={styles.trafficBarCol}>
                        <div className={styles.trafficBarTooltip}>
                          <strong>{d.label || d.shortDay}</strong>: {d.views || 0} views ({d.uniqueVisitors || 0} unique)
                        </div>

                        <div className={styles.trafficBarTrack}>
                          <div
                            className={styles.trafficBar}
                            style={{
                              height: `${heightPct}%`,
                              background: isToday
                                ? 'linear-gradient(180deg, #e2ff32 0%, rgba(226, 255, 50, 0.45) 100%)'
                                : undefined,
                            }}
                          >
                            {(d.uniqueVisitors || 0) > 0 && (
                              <div
                                className={styles.trafficBarUnique}
                                style={{
                                  height: `${Math.min(Math.round(((d.uniqueVisitors || 0) / Math.max(d.views || 1, 1)) * 100), 100)}%`,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.trafficBarLabels}>
                  {trend.map((d: any, idx: number) => {
                    const isToday = idx === trend.length - 1;
                    return (
                      <div key={idx} className={`${styles.trafficDayLabel} ${isToday ? styles.trafficDayLabelActive : ''}`}>
                        <span>{d.shortDay}</span>
                        <div style={{ fontSize: 9, opacity: 0.65 }}>{d.views || 0}v</div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.trafficLegend}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className={styles.legendDot} style={{ background: '#e2ff32' }} />
                    <span>Total Page Views</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className={styles.legendDot} style={{ background: '#55f385' }} />
                    <span>Unique Audience</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Next Show Spotlight */}
      {nextShow && (
        <div className={styles.spotlightCard}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={nextShow.poster || nextShow.poster_url || nextShow.posterUrl || '/image/tobehonest_web.webp'}
            alt={nextShow.name}
            className={styles.spotlightPoster}
          />
          <div className={styles.spotlightBody}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <span className={styles.spotlightTag}>Headline Spotlight</span>
              <span
                className={`${styles.statusBadge} ${
                  nextShow.status === 'upcoming' ? styles.statusUpcoming : styles.statusPast
                }`}
              >
                {nextShow.status === 'upcoming' ? 'Upcoming' : 'Past Event'}
              </span>
              {nextShow.featured && (
                <span className={styles.tagPill} style={{ color: '#e2ff32', borderColor: 'rgba(226, 255, 50, 0.3)' }}>
                  Featured
                </span>
              )}
            </div>

            <h2 className={styles.spotlightTitle}>{nextShow.name}</h2>
            <p className={styles.spotlightMeta}>
              {cleanDateStr(nextShow.date || nextShow.date_formatted || nextShow.dateCode || nextShow.date_code)} · {nextShow.venue} {nextShow.time ? `· ${nextShow.time}` : ''}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {(nextShow.posh_url || nextShow.poshUrl || nextShow.ticket_url || nextShow.ticketUrl) && (
                <a
                  href={nextShow.posh_url || nextShow.poshUrl || nextShow.ticket_url || nextShow.ticketUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.linkPill} ${styles.linkPosh}`}
                >
                  Get Tickets ↗
                </a>
              )}
              <button
                onClick={() => {
                  setActiveTab('shows');
                }}
                className={styles.btnSecondary}
                style={{ padding: '4px 10px', fontSize: 12 }}
              >
                Manage Show Details →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Overviews: Upcoming Shows & Recent Media */}
      <div className={styles.dashboardSplit}>
        {/* Shows Snapshot */}
        <div className={styles.card} style={{ marginBottom: 0 }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Scheduled Sessions</h3>
            <button
              onClick={() => setActiveTab('shows')}
              className={styles.btnSecondary}
              style={{ fontSize: 11, padding: '4px 8px' }}
            >
              View All ({showsList.length}) →
            </button>
          </div>

          <div className={styles.miniList}>
            {showsList.slice(0, 4).map((show, idx) => (
              <div key={show.id || idx} className={styles.miniItem}>
                <div className={styles.miniItemLeft}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={show.poster || show.poster_url || show.posterUrl || '/image/tobehonest_web.webp'}
                    alt={show.name}
                    className={styles.miniItemThumb}
                  />
                  <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <div className={styles.miniItemTitle}>{show.name}</div>
                    <div className={styles.miniItemMeta}>
                      {cleanDateStr(show.date || show.date_formatted || show.dateCode || show.date_code)} · {show.venue}
                    </div>
                  </div>
                </div>

                <span
                  className={`${styles.statusBadge} ${
                    show.status === 'upcoming' ? styles.statusUpcoming : styles.statusPast
                  }`}
                  style={{ fontSize: 10, padding: '2px 6px' }}
                >
                  {show.status === 'upcoming' ? 'Upcoming' : 'Past'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Media Archives Snapshot */}
        <div className={styles.card} style={{ marginBottom: 0 }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Media Archives</h3>
            <button
              onClick={() => setActiveTab('media')}
              className={styles.btnSecondary}
              style={{ fontSize: 11, padding: '4px 8px' }}
            >
              View All ({mediaList.length}) →
            </button>
          </div>

          <div className={styles.miniList}>
            {mediaList.slice(0, 4).map((item, idx) => (
              <div key={item.id || idx} className={styles.miniItem}>
                <div className={styles.miniItemLeft}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail || item.image || item.thumbnail_url || '/image/jackie_web.webp'}
                    alt={item.name}
                    className={styles.miniItemThumb}
                  />
                  <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <div className={styles.miniItemTitle}>{item.name}</div>
                    <div className={styles.miniItemMeta}>{cleanDateStr(item.date)}</div>
                  </div>
                </div>

                <a
                  href={item.facebookUrl || item.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.linkPill}
                  style={{ fontSize: 10, padding: '2px 6px' }}
                >
                  Facebook ↗
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Inquiries Snapshot */}
        <div className={styles.card} style={{ marginBottom: 0 }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Inquiries</h3>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={styles.btnSecondary}
              style={{ fontSize: 11, padding: '4px 8px' }}
            >
              View All ({inquiriesList.length}) →
            </button>
          </div>

          <div className={styles.miniList}>
            {inquiriesList.length === 0 ? (
              <div style={{ color: '#86868b', fontSize: 12, padding: '16px 0', textAlign: 'center' }}>
                No inquiries received yet
              </div>
            ) : (
              inquiriesList.slice(0, 4).map((inq, idx) => (
                <div key={inq.id || idx} className={styles.miniItem}>
                  <div className={styles.miniItemLeft}>
                    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <div className={styles.miniItemTitle}>
                        {inq.subject || 'No Subject'}
                      </div>
                      <div className={styles.miniItemMeta}>
                        {inq.email || 'Anonymous'} · {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`${styles.statusBadge} ${
                      inq.status === 'unread'
                        ? styles.statusUnread
                        : inq.status === 'replied'
                        ? styles.statusReplied
                        : styles.statusRead
                    }`}
                    style={{ fontSize: 10, padding: '2px 6px' }}
                  >
                    {inq.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
