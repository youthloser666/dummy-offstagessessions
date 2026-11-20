export function sanitizeLegacyDateString(value?: string): string {
  return (value || '').replace(/<br\s*\/?>/gi, ' ').trim();
}

export function formatInquiryTimestamp(isoDate?: string): string {
  if (!isoDate) {
    return 'Recent';
  }
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recent';
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatAnalyticsTime(isoDate?: string): string {
  if (!isoDate) {
    return 'Just now';
  }
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'Just now';
  }
  return parsed.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatAnalyticsShortDate(isoDate?: string): string {
  if (!isoDate) {
    return '';
  }
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return parsed.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

