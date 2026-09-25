/**
 * Sanitizes date strings that may contain raw HTML tags like <br> from legacy CMS fields.
 */
export const cleanDateStr = (str?: string): string => {
  return (str || '').replace(/<br\s*\/?>/gi, ' ').trim();
};
