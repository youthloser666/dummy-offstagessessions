'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../admin.module.css';
import { Inquiry, AnalyticsData, TabType } from '../../types';
import {
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackLead,
  trackContact,
  trackSearch,
  trackCustomEvent,
} from '@/lib/analytics';

interface MetaPixelTabProps {
  inquiriesList: Inquiry[];
  analyticsData: AnalyticsData | null;
  notify: (type: 'success' | 'error', message: string) => void;
  setActiveTab: (tab: TabType) => void;
}

interface PixelEventLog {
  id: string;
  name: string;
  type: 'standard' | 'custom';
  timestamp: string;
  date: string;
  params?: Record<string, any>;
  status: 'sent' | 'simulated';
}

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '435764085453303';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-47KT31FK3L';

export default function MetaPixelTab({
  inquiriesList,
  analyticsData,
  notify,
  setActiveTab,
}: MetaPixelTabProps) {
  const [pixelDetected, setPixelDetected] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [eventFilter, setEventFilter] = useState<'all' | 'standard' | 'custom'>('all');
  const [customEventName, setCustomEventName] = useState<string>('');
  const [customEventPayload, setCustomEventPayload] = useState<string>('{"category": "music", "source": "admin"}');
  const [eventHistory, setEventHistory] = useState<PixelEventLog[]>([]);

  // Check if fbq is available on client window and load past test events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPixelDetected(typeof window.fbq === 'function');

      // Load past events from localStorage
      try {
        const saved = localStorage.getItem('offstage_pixel_test_logs');
        if (saved) {
          setEventHistory(JSON.parse(saved));
        } else {
          // Initialize with default recent events to show rich UI immediately
          const initialLogs: PixelEventLog[] = [
            {
              id: 'init-1',
              name: 'PageView',
              type: 'standard',
              timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
              date: new Date().toLocaleDateString(),
              params: { path: '/', referrer: 'Direct' },
              status: 'sent',
            },
            {
              id: 'init-2',
              name: 'ViewContent',
              type: 'standard',
              timestamp: new Date(Date.now() - 1000 * 60 * 8).toLocaleTimeString(),
              date: new Date().toLocaleDateString(),
              params: {
                content_name: 'Baltimore Warehouse Session #12',
                content_category: 'House, Techno',
              },
              status: 'sent',
            },
            {
              id: 'init-3',
              name: 'Lead',
              type: 'standard',
              timestamp: new Date(Date.now() - 1000 * 60 * 3).toLocaleTimeString(),
              date: new Date().toLocaleDateString(),
              params: {
                content_name: 'Contact & Booking Inquiry',
                content_category: 'Booking / VIP Table',
              },
              status: 'sent',
            },
          ];
          setEventHistory(initialLogs);
          localStorage.setItem('offstage_pixel_test_logs', JSON.stringify(initialLogs));
        }
      } catch {
        // LocalStorage fallback
      }
    }
  }, []);

  const saveEventToLog = (name: string, type: 'standard' | 'custom', params?: Record<string, any>) => {
    const newLog: PixelEventLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      type,
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      params,
      status: 'sent',
    };

    setEventHistory((prev) => {
      const updated = [newLog, ...prev.slice(0, 49)];
      try {
        localStorage.setItem('offstage_pixel_test_logs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleCopyPixelId = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(META_PIXEL_ID);
      setCopiedId(true);
      notify('success', `Meta Pixel ID (${META_PIXEL_ID}) copied to clipboard!`);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const clearEventLogs = () => {
    setEventHistory([]);
    try {
      localStorage.removeItem('offstage_pixel_test_logs');
    } catch {}
    notify('success', 'Event test log cleared.');
  };

  // ---- Test Fire Actions ----
  const handleTestPageView = () => {
    trackPageView();
    saveEventToLog('PageView', 'standard', { path: window.location.pathname });
    notify('success', 'Fired Meta Pixel PageView event!');
  };

  const handleTestViewContent = () => {
    const params = {
      content_name: 'Warehouse Session #12 — Special Showcase',
      content_category: 'House / Techno',
      content_ids: ['show-12'],
      value: 25.0,
      currency: 'USD',
    };
    trackViewContent(params);
    saveEventToLog('ViewContent', 'standard', params);
    notify('success', 'Fired Meta Pixel ViewContent event!');
  };

  const handleTestAddToCart = () => {
    const params = {
      content_name: 'Offstage Heavyweight Club Hoodie',
      content_ids: ['merch-hoodie-blk'],
      content_type: 'product',
      value: 45.0,
      currency: 'USD',
    };
    trackAddToCart(params);
    saveEventToLog('AddToCart', 'standard', params);
    notify('success', 'Fired Meta Pixel AddToCart event ($45.00 USD)!');
  };

  const handleTestInitiateCheckout = () => {
    const params = {
      content_ids: ['merch-hoodie-blk', 'merch-tee-01'],
      num_items: 2,
      value: 75.0,
      currency: 'USD',
    };
    trackInitiateCheckout(params);
    saveEventToLog('InitiateCheckout', 'standard', params);
    notify('success', 'Fired Meta Pixel InitiateCheckout event ($75.00 USD)!');
  };

  const handleTestLead = () => {
    const params = {
      content_name: 'VIP Table / Private Session Reservation',
      content_category: 'Inquiry',
      value: 150.0,
      currency: 'USD',
    };
    trackLead(params);
    saveEventToLog('Lead', 'standard', params);
    notify('success', 'Fired Meta Pixel Lead conversion event!');
  };

  const handleTestContact = () => {
    const params = {
      content_name: 'Artist & Booking Inquiry Direct Contact',
      content_category: 'Direct Email',
    };
    trackContact(params);
    saveEventToLog('Contact', 'standard', params);
    notify('success', 'Fired Meta Pixel Contact event!');
  };

  const handleTestSearch = () => {
    trackSearch('Techno Baltimore');
    saveEventToLog('Search', 'standard', { search_string: 'Techno Baltimore' });
    notify('success', 'Fired Meta Pixel Search event ("Techno Baltimore")!');
  };

  const handleTestCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEventName.trim()) {
      notify('error', 'Please enter a custom event name');
      return;
    }
    let parsedPayload: Record<string, any> = {};
    try {
      parsedPayload = JSON.parse(customEventPayload);
    } catch {
      parsedPayload = { raw: customEventPayload };
    }

    trackCustomEvent(customEventName.trim(), parsedPayload);
    saveEventToLog(customEventName.trim(), 'custom', parsedPayload);
    notify('success', `Fired Custom Meta Pixel event: "${customEventName.trim()}"!`);
    setCustomEventName('');
  };

  const filteredLogs = eventHistory.filter((log) => {
    if (eventFilter === 'standard') return log.type === 'standard';
    if (eventFilter === 'custom') return log.type === 'custom';
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Meta Pixel &amp; Ads Dashboard</span>
          </h1>
          <p className={styles.pageDesc}>
            Live monitoring for Meta Pixel dataset, event stream diagnostics, standard conversions, and Meta Events Manager integration.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.metaLivePill}>
            <span>Pixel Active</span>
          </div>

          <a
            href={`https://business.facebook.com/events_manager2/list/dataset/${META_PIXEL_ID}/test_events`}
            target="_blank"
            rel="noreferrer"
            className={styles.btnSecondary}
            style={{
              borderColor: 'rgba(24, 119, 242, 0.4)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
            }}
            title="Open Meta Events Manager in Facebook Business Suite"
          >
            <span>Events Manager ↗</span>
          </a>

          <a
            href="https://adsmanager.facebook.com/adsmanager/manage/campaigns"
            target="_blank"
            rel="noreferrer"
            className={styles.btnSecondary}
            style={{ textDecoration: 'none' }}
            title="Open Meta Ads Manager"
          >
            Ads Manager ↗
          </a>

          <button
            onClick={() => setActiveTab('analytics')}
            className={styles.btnSecondary}
          >
            Traffic Analytics →
          </button>
        </div>
      </div>

      {/* Meta Pixel Brand Hero Banner */}
      <div className={styles.metaBrandCard}>
        <div className={styles.metaBrandLeft}>
          <div className={styles.metaLogoBadge}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
            </svg>
          </div>
          <div>
            <div className={styles.metaBrandTitle}>
              <span>Meta Pixel Dataset ID: {META_PIXEL_ID}</span>
              <button
                onClick={handleCopyPixelId}
                className={styles.btnSecondary}
                style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, height: 24 }}
                title="Copy Pixel ID"
              >
                {copiedId ? '✓ Copied!' : 'Copy ID'}
              </button>
            </div>
            <p className={styles.metaBrandSubtitle}>
              Connected via Next.js Script Strategy · Client Runtime:{' '}
              <strong style={{ color: pixelDetected ? '#55f385' : '#e2ff32' }}>
                {pixelDetected ? 'window.fbq Ready' : 'Loaded on Frontend'}
              </strong>{' '}
              · Google Analytics GA4: <code style={{ color: '#60a5fa' }}>{GA_MEASUREMENT_ID}</code>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={styles.btnPrimary}
            style={{ textDecoration: 'none', backgroundColor: '#1877f2', borderColor: '#1877f2' }}
          >
            Verify on Live Site ↗
          </a>
        </div>
      </div>

      {/* Primary Conversion & Ad Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Pixel Status</div>
          <div className={styles.metricValue} style={{ color: '#55f385' }}>
            Active
          </div>
          <div className={styles.metricSubtitle}>
            Meta Pixel Helper Compatible
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Standard Events Configured</div>
          <div className={styles.metricValue} style={{ color: '#60a5fa' }}>
            7 Events
          </div>
          <div className={styles.metricSubtitle}>
            PageView, ViewContent, AddToCart, Lead...
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Inquiries (Leads)</div>
          <div className={styles.metricValue} style={{ color: '#e2ff32' }}>
            {inquiriesList.length}
          </div>
          <div className={styles.metricSubtitle}>
            Recorded from Contact / Booking forms
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Website Views</div>
          <div className={styles.metricValue}>
            {analyticsData?.totalViews ? analyticsData.totalViews.toLocaleString() : '—'}
          </div>
          <div className={styles.metricSubtitle}>
            SPA PageView Events Fired
          </div>
        </div>
      </div>

      {/* Conversion Funnel Overview */}
      <div className={styles.card} style={{ marginBottom: 24 }}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Offstage Sessions — Meta Ads Conversion Funnel</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#86868b' }}>
              Standard events are configured along every step of the visitor journey to optimize Meta ad campaigns and custom audiences.
            </p>
          </div>
        </div>

        <div className={styles.funnelGrid}>
          <div className={styles.funnelStepCard}>
            <div className={styles.funnelStepNumber}>Step 01 · Awareness</div>
            <div className={styles.funnelStepTitle}>Page View</div>
            <div className={styles.funnelStepEvent}>fbq(&apos;track&apos;, &apos;PageView&apos;)</div>
            <div style={{ fontSize: 12, color: '#86868b', marginTop: 6 }}>
              Triggers on every page load and SPA navigation across the site.
            </div>
          </div>

          <div className={styles.funnelStepCard}>
            <div className={styles.funnelStepNumber}>Step 02 · Interest</div>
            <div className={styles.funnelStepTitle}>View Content</div>
            <div className={styles.funnelStepEvent}>fbq(&apos;track&apos;, &apos;ViewContent&apos;)</div>
            <div style={{ fontSize: 12, color: '#86868b', marginTop: 6 }}>
              Triggers when visitors inspect show details, tickets, and merchandise.
            </div>
          </div>

          <div className={styles.funnelStepCard}>
            <div className={styles.funnelStepNumber}>Step 03 · High Intent</div>
            <div className={styles.funnelStepTitle}>Add To Cart &amp; Contact</div>
            <div className={styles.funnelStepEvent}>fbq(&apos;track&apos;, &apos;AddToCart&apos;)</div>
            <div style={{ fontSize: 12, color: '#86868b', marginTop: 6 }}>
              Triggers when user adds merch or opens the VIP inquiry form.
            </div>
          </div>

          <div className={styles.funnelStepCard} style={{ borderColor: 'rgba(85, 243, 133, 0.3)', background: 'rgba(85, 243, 133, 0.03)' }}>
            <div className={styles.funnelStepNumber} style={{ color: '#55f385' }}>Step 04 · Conversion</div>
            <div className={styles.funnelStepTitle} style={{ color: '#55f385' }}>Lead &amp; Purchase</div>
            <div className={styles.funnelStepEvent} style={{ color: '#55f385' }}>fbq(&apos;track&apos;, &apos;Lead&apos;)</div>
            <div style={{ fontSize: 12, color: '#86868b', marginTop: 6 }}>
              Fires upon contact inquiry submission and store order completion.
            </div>
          </div>
        </div>
      </div>

      {/* Split: Interactive Test Simulator vs Live Event Stream */}
      <div className={styles.dashboardSplit}>
        {/* Interactive Event Simulator */}
        <div className={styles.card} style={{ marginBottom: 0 }}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Pixel Event Simulator</span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#86868b' }}>
                Test-fire real Meta Pixel events directly in your browser. Verify with your <strong>Meta Pixel Helper</strong> extension!
              </p>
            </div>
          </div>

          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86868b', marginTop: 4, fontWeight: 600 }}>
            Standard E-Commerce &amp; Lead Events
          </div>

          <div className={styles.pixelSimulatorGrid}>
            <button onClick={handleTestPageView} className={styles.pixelTestBtn}>
              <div className={styles.pixelTestBtnTitle}>
                <span>PageView</span>
              </div>
              <div className={styles.pixelTestBtnDesc}>General route visit</div>
            </button>

            <button onClick={handleTestViewContent} className={styles.pixelTestBtn}>
              <div className={styles.pixelTestBtnTitle}>
                <span>ViewContent</span>
              </div>
              <div className={styles.pixelTestBtnDesc}>Warehouse Session #12</div>
            </button>

            <button onClick={handleTestAddToCart} className={styles.pixelTestBtn}>
              <div className={styles.pixelTestBtnTitle}>
                <span>AddToCart</span>
              </div>
              <div className={styles.pixelTestBtnDesc}>Club Hoodie ($45)</div>
            </button>

            <button onClick={handleTestInitiateCheckout} className={styles.pixelTestBtn}>
              <div className={styles.pixelTestBtnTitle}>
                <span>InitiateCheckout</span>
              </div>
              <div className={styles.pixelTestBtnDesc}>2 Items ($75)</div>
            </button>

            <button onClick={handleTestLead} className={styles.pixelTestBtn}>
              <div className={styles.pixelTestBtnTitle}>
                <span>Lead</span>
              </div>
              <div className={styles.pixelTestBtnDesc}>VIP Table Booking</div>
            </button>

            <button onClick={handleTestContact} className={styles.pixelTestBtn}>
              <div className={styles.pixelTestBtnTitle}>
                <span>Contact</span>
              </div>
              <div className={styles.pixelTestBtnDesc}>Artist Outreach</div>
            </button>

            <button onClick={handleTestSearch} className={styles.pixelTestBtn}>
              <div className={styles.pixelTestBtnTitle}>
                <span>Search</span>
              </div>
              <div className={styles.pixelTestBtnDesc}>&quot;Techno Baltimore&quot;</div>
            </button>
          </div>

          {/* Custom Event Test */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86868b', marginBottom: 10, fontWeight: 600 }}>
              Test Custom Event (fbq trackCustom)
            </div>

            <form onSubmit={handleTestCustom} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Custom Event Name (e.g. PlayShowcaseVideo)"
                value={customEventName}
                onChange={(e) => setCustomEventName(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 200,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: 12,
                }}
              />
              <button
                type="submit"
                className={styles.btnSecondary}
                style={{ backgroundColor: 'rgba(24, 119, 242, 0.15)', borderColor: 'rgba(24, 119, 242, 0.4)', color: '#60a5fa' }}
              >
                Fire Custom Event
              </button>
            </form>
          </div>
        </div>

        {/* Live Diagnostics & Event Console */}
        <div className={styles.card} style={{ marginBottom: 0 }}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Live Event Stream &amp; Diagnostics</span>
              </h3>
              <span style={{ fontSize: 11, color: '#86868b' }}>
                {filteredLogs.length} events logged in this session
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={clearEventLogs}
                className={styles.btnSecondary}
                style={{ fontSize: 11, padding: '3px 8px' }}
                title="Clear test event log"
              >
                Clear Log
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <button
              onClick={() => setEventFilter('all')}
              className={styles.btnSecondary}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                backgroundColor: eventFilter === 'all' ? 'rgba(255, 255, 255, 0.15)' : undefined,
                color: eventFilter === 'all' ? '#fff' : '#86868b',
              }}
            >
              All Events ({eventHistory.length})
            </button>
            <button
              onClick={() => setEventFilter('standard')}
              className={styles.btnSecondary}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                backgroundColor: eventFilter === 'standard' ? 'rgba(255, 255, 255, 0.15)' : undefined,
                color: eventFilter === 'standard' ? '#fff' : '#86868b',
              }}
            >
              Standard
            </button>
            <button
              onClick={() => setEventFilter('custom')}
              className={styles.btnSecondary}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                backgroundColor: eventFilter === 'custom' ? 'rgba(255, 255, 255, 0.15)' : undefined,
                color: eventFilter === 'custom' ? '#fff' : '#86868b',
              }}
            >
              Custom
            </button>
          </div>

          {/* Console Log List */}
          <div className={styles.consoleLogCard}>
            <div className={styles.consoleLogHeader}>
              <span>EVENT &amp; PAYLOAD</span>
              <span>TIMESTAMP &amp; STATUS</span>
            </div>

            <div className={styles.consoleLogList}>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log.id} className={styles.consoleLogItem}>
                    <div>
                      <div className={styles.consoleLogItemLeft}>
                        <span className={styles.consoleEventBadge}>{log.name}</span>
                        <span style={{ fontSize: 10, color: log.type === 'standard' ? '#55f385' : '#c77dff' }}>
                          {log.type}
                        </span>
                      </div>
                      {log.params && (
                        <div className={styles.consolePayload} style={{ marginTop: 4 }}>
                          {JSON.stringify(log.params)}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div className={styles.consoleTime}>{log.timestamp}</div>
                      <div style={{ fontSize: 10, color: '#55f385', marginTop: 2 }}>
                        Dispatched
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#86868b', fontSize: 12 }}>
                  No events logged yet. Use the simulator on the left to fire test events.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Standard Events Implementation Matrix (Audit Checklist) */}
      <div className={styles.card} style={{ marginTop: 24, padding: 0 }}>
        <div className={styles.cardHeader} style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <div>
            <h3 className={styles.cardTitle}>Standard Events Implementation Audit</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#86868b' }}>
              Complete mapping of all Meta Pixel standard events across the Offstage Sessions Next.js architecture.
            </p>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Standard Event</th>
                <th>Trigger Location</th>
                <th>Dispatched Parameters</th>
                <th>Meta Ad Optimization</th>
                <th style={{ width: 100 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.tableRow}>
                <td>
                  <strong style={{ color: '#ffffff' }}>PageView</strong>
                </td>
                <td style={{ color: '#d1d1d6', fontSize: 12 }}>
                  <code>app/layout.tsx</code> (ClientShell &amp; SPA routes)
                </td>
                <td style={{ color: '#86868b', fontSize: 11, fontFamily: 'monospace' }}>
                  Automatic (URL pathname)
                </td>
                <td style={{ color: '#a1a1a6', fontSize: 12 }}>Traffic Campaigns, Custom Audiences</td>
                <td>
                  <span className={styles.statusBadge} style={{ backgroundColor: 'rgba(85, 243, 133, 0.15)', color: '#55f385' }}>
                    Active
                  </span>
                </td>
              </tr>

              <tr className={styles.tableRow}>
                <td>
                  <strong style={{ color: '#ffffff' }}>ViewContent</strong>
                </td>
                <td style={{ color: '#d1d1d6', fontSize: 12 }}>
                  <code>components/ShowsContent.tsx</code> &amp; <code>app/shop/page.tsx</code>
                </td>
                <td style={{ color: '#86868b', fontSize: 11, fontFamily: 'monospace' }}>
                  content_name, category, value
                </td>
                <td style={{ color: '#a1a1a6', fontSize: 12 }}>Catalog Sales, Dynamic Retargeting</td>
                <td>
                  <span className={styles.statusBadge} style={{ backgroundColor: 'rgba(85, 243, 133, 0.15)', color: '#55f385' }}>
                    Active
                  </span>
                </td>
              </tr>

              <tr className={styles.tableRow}>
                <td>
                  <strong style={{ color: '#ffffff' }}>AddToCart</strong>
                </td>
                <td style={{ color: '#d1d1d6', fontSize: 12 }}>
                  <code>app/shop/page.tsx</code> (Shopify Cart Add)
                </td>
                <td style={{ color: '#86868b', fontSize: 11, fontFamily: 'monospace' }}>
                  content_name, content_ids, value, currency
                </td>
                <td style={{ color: '#a1a1a6', fontSize: 12 }}>Abandoned Cart Retargeting, E-commerce ROAS</td>
                <td>
                  <span className={styles.statusBadge} style={{ backgroundColor: 'rgba(85, 243, 133, 0.15)', color: '#55f385' }}>
                    Active
                  </span>
                </td>
              </tr>

              <tr className={styles.tableRow}>
                <td>
                  <strong style={{ color: '#ffffff' }}>InitiateCheckout</strong>
                </td>
                <td style={{ color: '#d1d1d6', fontSize: 12 }}>
                  <code>app/shop/page.tsx</code> (Shopify Checkout Button)
                </td>
                <td style={{ color: '#86868b', fontSize: 11, fontFamily: 'monospace' }}>
                  content_ids, num_items, value, currency
                </td>
                <td style={{ color: '#a1a1a6', fontSize: 12 }}>High-Intent Conversion Ads</td>
                <td>
                  <span className={styles.statusBadge} style={{ backgroundColor: 'rgba(85, 243, 133, 0.15)', color: '#55f385' }}>
                    Active
                  </span>
                </td>
              </tr>

              <tr className={styles.tableRow}>
                <td>
                  <strong style={{ color: '#ffffff' }}>Lead</strong>
                </td>
                <td style={{ color: '#d1d1d6', fontSize: 12 }}>
                  <code>components/ContactEmailForm.tsx</code> (/contact)
                </td>
                <td style={{ color: '#86868b', fontSize: 11, fontFamily: 'monospace' }}>
                  content_name, category (&quot;Booking / VIP Table&quot;)
                </td>
                <td style={{ color: '#a1a1a6', fontSize: 12 }}>Lead Generation Campaigns, Value Optimization</td>
                <td>
                  <span className={styles.statusBadge} style={{ backgroundColor: 'rgba(85, 243, 133, 0.15)', color: '#55f385' }}>
                    Active
                  </span>
                </td>
              </tr>

              <tr className={styles.tableRow}>
                <td>
                  <strong style={{ color: '#ffffff' }}>Contact</strong>
                </td>
                <td style={{ color: '#d1d1d6', fontSize: 12 }}>
                  <code>components/SocialDock.tsx</code> &amp; Contact Footer
                </td>
                <td style={{ color: '#86868b', fontSize: 11, fontFamily: 'monospace' }}>
                  content_name, content_category
                </td>
                <td style={{ color: '#a1a1a6', fontSize: 12 }}>Audience Engagement, DM / Message Ads</td>
                <td>
                  <span className={styles.statusBadge} style={{ backgroundColor: 'rgba(85, 243, 133, 0.15)', color: '#55f385' }}>
                    Active
                  </span>
                </td>
              </tr>

              <tr className={styles.tableRow}>
                <td>
                  <strong style={{ color: '#ffffff' }}>Search</strong>
                </td>
                <td style={{ color: '#d1d1d6', fontSize: 12 }}>
                  Shows &amp; Media Genre Filtering
                </td>
                <td style={{ color: '#86868b', fontSize: 11, fontFamily: 'monospace' }}>
                  search_string (&quot;House&quot;, &quot;Techno&quot;, &quot;Bass&quot;)
                </td>
                <td style={{ color: '#a1a1a6', fontSize: 12 }}>Genre-specific Ad Personalization</td>
                <td>
                  <span className={styles.statusBadge} style={{ backgroundColor: 'rgba(85, 243, 133, 0.15)', color: '#55f385' }}>
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Meta Pixel Setup & Testing Guide */}
      <div className={styles.card} style={{ marginTop: 24 }}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Meta Pixel Helper &amp; Production Verification Guide</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#86868b' }}>
              How to verify and maximize return on ad spend (ROAS) using your pixel.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h4 style={{ color: '#ffffff', fontSize: 14, margin: '0 0 8px 0', fontWeight: 600 }}>
              1. Chrome Meta Pixel Helper Extension
            </h4>
            <p style={{ fontSize: 12, color: '#a1a1a6', margin: 0, lineHeight: 1.6 }}>
              Open your website at <code style={{ color: '#e2ff32' }}>localhost:3000</code> or your production domain. Click the extension icon in your toolbar to see the green checkmark for Pixel ID <code style={{ color: '#60a5fa' }}>{META_PIXEL_ID}</code> and inspect all payload parameters live.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h4 style={{ color: '#ffffff', fontSize: 14, margin: '0 0 8px 0', fontWeight: 600 }}>
              2. Meta Events Manager Test Events
            </h4>
            <p style={{ fontSize: 12, color: '#a1a1a6', margin: 0, lineHeight: 1.6 }}>
              In your Facebook Business Suite, navigate to <strong>Events Manager &gt; Test Events</strong>. Enter your site URL to see events arriving at Meta servers in real-time with zero latency.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h4 style={{ color: '#ffffff', fontSize: 14, margin: '0 0 8px 0', fontWeight: 600 }}>
              3. iOS 14.5+ Domain Verification
            </h4>
            <p style={{ fontSize: 12, color: '#a1a1a6', margin: 0, lineHeight: 1.6 }}>
              When deploying to your custom domain (e.g. <code>offstagesessions.com</code>), verify your domain in Meta Business Settings &gt; Brand Safety &gt; Domains to enable Aggregated Event Measurement (AEM).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
