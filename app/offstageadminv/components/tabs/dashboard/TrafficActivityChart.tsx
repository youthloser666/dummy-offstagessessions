'use client';

import React, { useState } from 'react';
import type { DailyTrendPoint } from '../../../types';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';

interface TrafficActivityChartProps {
  dailyTrend: DailyTrendPoint[];
  totalWeekViews: number;
  isLoadingAnalytics: boolean;
  onViewDetailedAnalytics: () => void;
}

export function TrafficActivityChart({
  dailyTrend,
  totalWeekViews,
  isLoadingAnalytics,
  onViewDetailedAnalytics,
}: TrafficActivityChartProps) {
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const peakViews = Math.max(...dailyTrend.map((point) => point.views), 1);

  return (
    <div className={shellStyles.card}>
      <div className={shellStyles.cardHeader}>
        <div>
          <h3 className={shellStyles.cardTitle}>Weekly Site Traffic (7 Days)</h3>
          <p className={shellStyles.cardSubtitle}>
            {isLoadingAnalytics
              ? 'Loading telemetry...'
              : `${totalWeekViews.toLocaleString()} views across last 7 days`}
          </p>
        </div>

        <button
          type="button"
          className={shellStyles.btnEdit}
          onClick={onViewDetailedAnalytics}
        >
          Full Report &rarr;
        </button>
      </div>

      <div className={overviewStyles.trafficChartBody}>
        <div className={overviewStyles.trafficChartCanvas}>
          {dailyTrend.map((dayPoint, index) => {
            const isToday = index === dailyTrend.length - 1 || dayPoint.shortDay === 'Today';
            const viewHeightPercent =
              dayPoint.views > 0 ? Math.max((dayPoint.views / peakViews) * 100, 6) : 4;
            const uniqueHeightPercent =
              dayPoint.uniqueVisitors > 0
                ? Math.max((dayPoint.uniqueVisitors / peakViews) * 100, 3)
                : 0;
            const isHovered = hoveredBarIndex === index;

            return (
              <div
                key={`${dayPoint.shortDay}-${index}`}
                className={overviewStyles.trafficBarColumn}
                onMouseEnter={() => setHoveredBarIndex(index)}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                {isHovered && (
                  <div className={overviewStyles.trafficTooltip}>
                    <div className={overviewStyles.trafficTooltipTitle}>
                      {dayPoint.label || dayPoint.shortDay}
                    </div>
                    <div>Views: {dayPoint.views.toLocaleString()}</div>
                    <div>Unique: {dayPoint.uniqueVisitors.toLocaleString()}</div>
                  </div>
                )}

                <div className={overviewStyles.trafficBarTrack}>
                  <div
                    className={`${overviewStyles.trafficBarFill} ${
                      isToday ? overviewStyles.trafficBarFillToday : ''
                    }`}
                    style={{ height: `${viewHeightPercent}%` }}
                  />
                  {uniqueHeightPercent > 0 && (
                    <div
                      className={overviewStyles.trafficUniqueOverlay}
                      style={{ height: `${uniqueHeightPercent}%` }}
                    />
                  )}
                </div>

                <span
                  className={`${overviewStyles.trafficBarLabel} ${
                    isToday ? overviewStyles.trafficBarLabelToday : ''
                  }`}
                >
                  {dayPoint.shortDay}
                </span>
              </div>
            );
          })}
        </div>

        <div className={overviewStyles.trafficLegendRow}>
          <span className={overviewStyles.trafficLegendItem}>
            <span className={`${overviewStyles.trafficLegendSwatch} ${overviewStyles.swatchViews}`} />
            Page Views
          </span>
          <span className={overviewStyles.trafficLegendItem}>
            <span className={`${overviewStyles.trafficLegendSwatch} ${overviewStyles.swatchUnique}`} />
            Unique Visitors
          </span>
          <span className={overviewStyles.trafficLegendItem}>
            <span className={`${overviewStyles.trafficLegendSwatch} ${overviewStyles.swatchToday}`} />
            Today
          </span>
        </div>
      </div>
    </div>
  );
}

