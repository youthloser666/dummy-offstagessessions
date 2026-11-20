'use client';

import React, { useMemo } from 'react';
import type {
  AnalyticsData,
  Inquiry,
  MediaItem,
  ServiceConnectionDiagnostics,
  Show,
  TabType,
} from '../../../types';
import {
  buildSevenDayTrafficTrend,
  countShowsWithTicketLinks,
  selectNextUpcomingShow,
} from '../../../utils/dashboardFormatters';
import shellStyles from '../../../styles/adminShell.module.css';
import { ConnectionStatusCard } from './ConnectionStatusCard';
import { NextShowSpotlight } from './NextShowSpotlight';
import { OverviewSnapshots } from './OverviewSnapshots';
import { TrafficActivityChart } from './TrafficActivityChart';

interface DashboardTabProps {
  showsList: Show[];
  mediaList: MediaItem[];
  inquiriesList: Inquiry[];
  unreadInquiriesCount: number;
  storeProductsCount: number;
  analyticsData: AnalyticsData | null;
  isLoadingAnalytics: boolean;
  connectionDiagnostics: ServiceConnectionDiagnostics | null;
  isTestingConnection: boolean;
  onTestConnection: () => void;
  onNavigateTab: (tab: TabType) => void;
  onQuickCreateShow: () => void;
}

export function DashboardTab({
  showsList,
  mediaList,
  inquiriesList,
  unreadInquiriesCount,
  storeProductsCount,
  analyticsData,
  isLoadingAnalytics,
  connectionDiagnostics,
  isTestingConnection,
  onTestConnection,
  onNavigateTab,
  onQuickCreateShow,
}: DashboardTabProps) {
  const dailyTrend = useMemo(
    () => buildSevenDayTrafficTrend(analyticsData),
    [analyticsData]
  );

  const totalWeekViews = useMemo(
    () => dailyTrend.reduce((sum, day) => sum + day.views, 0),
    [dailyTrend]
  );

  const ticketedShowsCount = useMemo(
    () => countShowsWithTicketLinks(showsList),
    [showsList]
  );

  const nextShow = useMemo(
    () => selectNextUpcomingShow(showsList),
    [showsList]
  );

  return (
    <div>
      <header className={shellStyles.pageHeader}>
        <div>
          <h1 className={shellStyles.pageTitle}>Dashboard Overview</h1>
          <p className={shellStyles.pageDesc}>
            Real-time operational health, upcoming schedule, traffic telemetry &amp; recent inbox activity
          </p>
        </div>

        <div className={shellStyles.headerActions}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={shellStyles.btnSecondary}
          >
            View Live Website ↗
          </a>
          <button
            type="button"
            className={shellStyles.btnPrimary}
            onClick={onQuickCreateShow}
          >
            + Create New Show
          </button>
        </div>
      </header>

      <section className={shellStyles.metricsGrid}>
        <div className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Shows &amp; Events</span>
          <span className={shellStyles.metricValue}>{showsList.length}</span>
          <span className={`${shellStyles.metricSubtitle} ${shellStyles.metricSubtitleLime}`}>
            {ticketedShowsCount} active with ticket links
          </span>
        </div>

        <div className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Unread Inquiries</span>
          <span className={`${shellStyles.metricValue} ${shellStyles.metricValueLime}`}>
            {unreadInquiriesCount}
          </span>
          <span className={shellStyles.metricSubtitle}>
            {inquiriesList.length} total messages received
          </span>
        </div>

        <div className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Visitors Today</span>
          <span className={`${shellStyles.metricValue} ${shellStyles.metricValueSuccess}`}>
            {analyticsData?.viewsToday?.toLocaleString() || '0'}
          </span>
          <span className={shellStyles.metricSubtitle}>
            {analyticsData?.totalViews?.toLocaleString() || '0'} all-time views (
            {analyticsData?.uniqueVisitors?.toLocaleString() || '0'} unique)
          </span>
        </div>

        <div className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Shopify &amp; Media</span>
          <span className={`${shellStyles.metricValue} ${shellStyles.metricValueInfo}`}>
            {storeProductsCount}
          </span>
          <span className={shellStyles.metricSubtitle}>
            Products synced &middot; {mediaList.length} media archives
          </span>
        </div>
      </section>

      <ConnectionStatusCard
        diagnostics={connectionDiagnostics}
        isTesting={isTestingConnection}
        onRefresh={onTestConnection}
      />

      <div className={shellStyles.dashboardSplit}>
        <TrafficActivityChart
          dailyTrend={dailyTrend}
          totalWeekViews={totalWeekViews}
          isLoadingAnalytics={isLoadingAnalytics}
          onViewDetailedAnalytics={() => onNavigateTab('analytics')}
        />

        <NextShowSpotlight
          nextShow={nextShow}
          onNavigateShows={() => onNavigateTab('shows')}
        />
      </div>

      <OverviewSnapshots
        showsList={showsList}
        mediaList={mediaList}
        inquiriesList={inquiriesList}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}

