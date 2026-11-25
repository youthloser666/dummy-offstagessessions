const DEFAULT_SITE_URL = 'https://offstagesessions.com';

/**
 * Resolves the canonical public base URL for metadata, sitemap.xml, and robots.txt.
 */
export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');

  const raw = (configured || DEFAULT_SITE_URL).trim();
  const normalized = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
  return normalized.replace(/\/+$/, '');
}
