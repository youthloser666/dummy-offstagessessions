import type { AnalyticsData, DailyTrendPoint, Show } from '../types';

export function buildSevenDayTrafficTrend(analyticsData: AnalyticsData | null): DailyTrendPoint[] {
  if (analyticsData?.dailyTrend && analyticsData.dailyTrend.length === 7) {
    return analyticsData.dailyTrend;
  }

  return [
    { shortDay: 'Sat', label: '6d ago', views: 0, uniqueVisitors: 0 },
    { shortDay: 'Sun', label: '5d ago', views: 0, uniqueVisitors: 0 },
    { shortDay: 'Mon', label: '4d ago', views: 0, uniqueVisitors: 0 },
    { shortDay: 'Tue', label: '3d ago', views: 0, uniqueVisitors: 0 },
    { shortDay: 'Wed', label: '2d ago', views: 0, uniqueVisitors: 0 },
    { shortDay: 'Thu', label: 'Yesterday', views: 0, uniqueVisitors: 0 },
    {
      shortDay: 'Today',
      label: 'Today',
      views: analyticsData?.viewsToday || 0,
      uniqueVisitors: analyticsData?.uniqueVisitorsToday || 0,
    },
  ];
}

export function selectNextUpcomingShow(showsList: Show[]): Show | null {
  const upcomingShows = showsList.filter((show) => show.status === 'upcoming');
  return upcomingShows[0] || showsList[0] || null;
}

export function countShowsWithTicketLinks(showsList: Show[]): number {
  return showsList.filter((show) =>
    Boolean(show.ticketUrl || show.ticket_url || show.poshUrl || show.posh_url)
  ).length;
}

