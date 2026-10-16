// =============================================================
// Offstage Sessions — Analytics Helpers
// Meta Pixel (fbq) + Google Analytics 4 (gtag)
// =============================================================

// ---- Type declarations for global window objects ----

type FbqStandard =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'Schedule';

interface FbqFunction {
  (action: 'track', event: FbqStandard, params?: Record<string, unknown>): void;
  (action: 'trackCustom', event: string, params?: Record<string, unknown>): void;
  (action: 'init', pixelId: string): void;
}

declare global {
  interface Window {
    fbq: FbqFunction;
    gtag: (...args: unknown[]) => void;
  }
}

// ---- Safe callers ----

function fbq(action: 'track', event: FbqStandard, params?: Record<string, unknown>): void;
function fbq(action: 'trackCustom', event: string, params?: Record<string, unknown>): void;
function fbq(action: string, event: string, params?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (params) {
      window.fbq(action as 'track', event as FbqStandard, params);
    } else {
      window.fbq(action as 'track', event as FbqStandard);
    }
  }
}

function gtag(...args: unknown[]): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

// =============================================================
// META PIXEL EVENTS
// =============================================================

/** Track a page view (called automatically on route change) */
export function trackPageView() {
  fbq('track', 'PageView');
}

/** Track when a user views content (show detail, media detail, etc.) */
export function trackViewContent(params: {
  content_name: string;
  content_category?: string;
  content_type?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
}) {
  fbq('track', 'ViewContent', params);
  gtag('event', 'view_item', {
    item_name: params.content_name,
    item_category: params.content_category,
    items: params.content_ids?.map((id) => ({ item_id: id })),
    value: params.value,
    currency: params.currency || 'USD',
  });
}

/** Track when a product is added to cart */
export function trackAddToCart(params: {
  content_name: string;
  content_ids: string[];
  content_type?: string;
  value: number;
  currency?: string;
}) {
  fbq('track', 'AddToCart', {
    ...params,
    currency: params.currency || 'USD',
  });
  gtag('event', 'add_to_cart', {
    currency: params.currency || 'USD',
    value: params.value,
    items: params.content_ids.map((id) => ({
      item_id: id,
      item_name: params.content_name,
      price: params.value,
    })),
  });
}

/** Track when checkout is initiated */
export function trackInitiateCheckout(params: {
  content_ids?: string[];
  num_items?: number;
  value?: number;
  currency?: string;
}) {
  fbq('track', 'InitiateCheckout', {
    ...params,
    currency: params.currency || 'USD',
  });
  gtag('event', 'begin_checkout', {
    currency: params.currency || 'USD',
    value: params.value,
    items: params.content_ids?.map((id) => ({ item_id: id })),
  });
}

/** Track a completed purchase */
export function trackPurchase(params: {
  content_ids: string[];
  content_name?: string;
  num_items?: number;
  value: number;
  currency?: string;
}) {
  fbq('track', 'Purchase', {
    ...params,
    currency: params.currency || 'USD',
  });
  gtag('event', 'purchase', {
    currency: params.currency || 'USD',
    value: params.value,
    items: params.content_ids.map((id) => ({
      item_id: id,
      item_name: params.content_name,
      price: params.value,
    })),
  });
}

/** Track a lead (contact form submission, inquiry, etc.) */
export function trackLead(params?: {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}) {
  fbq('track', 'Lead', params);
  gtag('event', 'generate_lead', {
    value: params?.value,
    currency: params?.currency || 'USD',
  });
}

/** Track a contact event */
export function trackContact(params?: {
  content_name?: string;
  content_category?: string;
}) {
  fbq('track', 'Contact', params);
  gtag('event', 'contact', params);
}

/** Track a search action */
export function trackSearch(searchString: string) {
  fbq('track', 'Search', { search_string: searchString });
  gtag('event', 'search', { search_term: searchString });
}

// =============================================================
// META PIXEL — CUSTOM EVENTS (non-standard)
// =============================================================

/** Track custom events (e.g., "PlayVideo", "ClickSocialLink") */
export function trackCustomEvent(eventName: string, params?: Record<string, unknown>) {
  fbq('trackCustom', eventName, params);
  gtag('event', eventName, params);
}
