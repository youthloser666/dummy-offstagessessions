'use client';

import React from 'react';
import type { ServiceConnectionDiagnostics } from '../../../types';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';

interface ConnectionStatusCardProps {
  diagnostics: ServiceConnectionDiagnostics | null;
  isTesting: boolean;
  onRefresh: () => void;
}

interface ServicePillItem {
  key: string;
  label: string;
  isConfigured?: boolean;
  isConnected?: boolean;
  detail?: string;
}

export function ConnectionStatusCard({
  diagnostics,
  isTesting,
  onRefresh,
}: ConnectionStatusCardProps) {
  const servicePills: ServicePillItem[] = diagnostics
    ? [
        {
          key: 'supabase',
          label: 'Supabase DB',
          isConfigured: diagnostics.supabase.configured,
          isConnected: diagnostics.supabase.connected,
          detail: diagnostics.supabase.message,
        },
        {
          key: 'cloudinary',
          label: 'Cloudinary CDN',
          isConfigured: diagnostics.cloudinary.configured,
          isConnected: diagnostics.cloudinary.connected,
          detail: diagnostics.cloudinary.cloudName || diagnostics.cloudinary.message,
        },
        {
          key: 'shopify',
          label: 'Shopify Store',
          isConfigured: diagnostics.shopify.configured,
          isConnected: diagnostics.shopify.connected,
          detail:
            diagnostics.shopify.productsCount !== undefined
              ? `${diagnostics.shopify.productsCount} products`
              : diagnostics.shopify.message,
        },
        {
          key: 'metapixel',
          label: 'Meta Pixel',
          isConfigured: diagnostics.metaPixel.configured,
          isConnected: diagnostics.metaPixel.connected,
          detail: diagnostics.metaPixel.pixelId || diagnostics.metaPixel.message,
        },
        {
          key: 'ga4',
          label: 'Google Analytics',
          isConfigured: diagnostics.ga4.configured,
          isConnected: diagnostics.ga4.connected,
          detail: diagnostics.ga4.measurementId || diagnostics.ga4.message,
        },
      ]
    : [
        { key: 'supabase', label: 'Supabase DB' },
        { key: 'cloudinary', label: 'Cloudinary CDN' },
        { key: 'shopify', label: 'Shopify Store' },
        { key: 'metapixel', label: 'Meta Pixel' },
        { key: 'ga4', label: 'Google Analytics' },
      ];

  const getDotClassName = (pill: ServicePillItem): string => {
    if (pill.isConnected === undefined) {
      return overviewStyles.connectionDotNeutral;
    }
    if (pill.isConnected) {
      return overviewStyles.connectionDotOk;
    }
    return overviewStyles.connectionDotErr;
  };

  return (
    <div className={`${shellStyles.card} ${overviewStyles.connectionCard}`}>
      <div className={shellStyles.cardHeader}>
        <div>
          <h3 className={shellStyles.cardTitle}>Infrastructure &amp; API Integrations</h3>
          <p className={shellStyles.cardSubtitle}>
            Live connectivity across database, CDN media uploads, merch sync &amp; telemetry
          </p>
        </div>

        <button
          type="button"
          className={shellStyles.btnSecondary}
          onClick={onRefresh}
          disabled={isTesting}
        >
          {isTesting ? 'Checking...' : 'Test Connections'}
        </button>
      </div>

      <div className={overviewStyles.connectionPillsRow}>
        {servicePills.map((pill) => (
          <div key={pill.key} className={overviewStyles.connectionPill} title={pill.detail}>
            <span className={`${overviewStyles.connectionDot} ${getDotClassName(pill)}`} />
            <span className={overviewStyles.connectionServiceLabel}>{pill.label}</span>
            {pill.detail && (
              <span className={overviewStyles.connectionServiceDetail}>{pill.detail}</span>
            )}
          </div>
        ))}
      </div>

      {diagnostics && (
        <div
          className={
            diagnostics.status === 'all_connected'
              ? overviewStyles.connectionBannerOk
              : overviewStyles.connectionBannerWarn
          }
        >
          {diagnostics.status === 'all_connected'
            ? 'All external integrations are configured and responding normally.'
            : 'One or more integrations require attention or environment configuration.'}
        </div>
      )}
    </div>
  );
}

