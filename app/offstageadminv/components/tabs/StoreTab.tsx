'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../../admin.module.css';

interface ShopifyProductItem {
  id: string;
  shopifyId: string;
  name: string;
  handle: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  category: string;
  sizes: string[];
  availableForSale: boolean;
  badge?: string;
}

interface StoreTabProps {
  notify?: (type: 'success' | 'error', message: string) => void;
}

export default function StoreTab({ notify }: StoreTabProps) {
  const [products, setProducts] = useState<ShopifyProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_stock' | 'sold_out'>('all');

  const storeDomain =
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'z6sevy-0z.myshopify.com';
  const cleanStoreName = storeDomain.replace('.myshopify.com', '');
  const shopifyAdminUrl = `https://admin.shopify.com/store/${cleanStoreName}/products`;

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shopify/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        if (notify) notify('success', `Synced ${data.products.length} products from Shopify`);
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (err: any) {
      console.error('Error loading Shopify products:', err);
      if (notify) notify('error', err.message || 'Error loading store products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'in_stock') return p.availableForSale;
    if (filterStatus === 'sold_out') return !p.availableForSale;
    return true;
  });

  const inStockCount = products.filter((p) => p.availableForSale).length;
  const soldOutCount = products.filter((p) => !p.availableForSale).length;

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Shopify Store &amp; Merch</h1>
          <p className={styles.pageDesc}>
            Direct overview of merchandise, live inventory status, and Shopify Storefront integration.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={loadProducts}
            disabled={loading}
            className={styles.btnSecondary}
            title="Reload latest updates from Shopify"
          >
            {loading ? 'Syncing...' : 'Sync Store'}
          </button>

          <a
            href="/shop"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span>Preview Storefront</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>

          <a
            href={shopifyAdminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span>+ Add / Edit in Shopify</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div
        className={styles.card}
        style={{
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          background: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'rgba(226, 255, 50, 0.1)',
              border: '1px solid rgba(226, 255, 50, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e2ff32',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🛍️
          </div>
          <div>
            <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
              Automatic Real-Time Syncing
            </div>
            <div style={{ color: '#86868b', fontSize: 12, lineHeight: 1.4 }}>
              Any product added, edited, or stocked in your Shopify Admin appears on the <strong>/shop</strong> storefront automatically with zero rebuilds.
            </div>
          </div>
        </div>

        <a
          href={shopifyAdminUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#e2ff32',
            fontSize: 12,
            fontFamily: 'monospace',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            background: 'rgba(226, 255, 50, 0.08)',
            borderRadius: 6,
            border: '1px solid rgba(226, 255, 50, 0.25)',
            fontWeight: 600,
            transition: 'background 0.2s ease',
          }}
        >
          <span>Open Shopify Admin</span>
          <span>↗</span>
        </a>
      </div>

      {/* KPI Metrics Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Products</div>
          <div className={styles.metricValue}>{products.length}</div>
          <div className={styles.metricSubtitle}>Synced from Shopify Storefront</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>In Stock Items</div>
          <div className={styles.metricValue} style={{ color: inStockCount > 0 ? '#e2ff32' : '#ffffff' }}>
            {inStockCount}
          </div>
          <div className={styles.metricSubtitle}>Available for checkout</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Sold Out Items</div>
          <div className={styles.metricValue} style={{ color: soldOutCount > 0 ? '#ff453a' : '#86868b' }}>
            {soldOutCount}
          </div>
          <div className={styles.metricSubtitle}>Out of inventory</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Store Domain</div>
          <div
            className={styles.metricValue}
            style={{ fontSize: 14, wordBreak: 'break-all', fontFamily: 'monospace', color: '#ffffff' }}
          >
            {storeDomain}
          </div>
          <div className={styles.metricSubtitle}>GraphQL Storefront API v2024-07</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginTop: 28,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterStatus('all')}
            className={filterStatus === 'all' ? styles.btnPrimary : styles.btnSecondary}
            style={{ fontSize: 12, padding: '5px 14px' }}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilterStatus('in_stock')}
            className={filterStatus === 'in_stock' ? styles.btnPrimary : styles.btnSecondary}
            style={{ fontSize: 12, padding: '5px 14px' }}
          >
            In Stock ({inStockCount})
          </button>
          <button
            onClick={() => setFilterStatus('sold_out')}
            className={filterStatus === 'sold_out' ? styles.btnPrimary : styles.btnSecondary}
            style={{ fontSize: 12, padding: '5px 14px' }}
          >
            Sold Out ({soldOutCount})
          </button>
        </div>

        <div style={{ minWidth: 260 }}>
          <input
            type="text"
            placeholder="Search merchandise by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.formInput}
            style={{ padding: '8px 14px', fontSize: 12 }}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className={styles.card} style={{ padding: 0 }}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 72 }}>Preview</th>
                <th>Product Title &amp; Handle</th>
                <th>Category</th>
                <th>Price</th>
                <th>Variants / Sizes</th>
                <th>Status</th>
                <th style={{ width: 140, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map((n) => (
                  <tr key={n} className={styles.tableRow}>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 52, height: 52, borderRadius: 6 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 150, height: 16, marginBottom: 6 }} />
                      <div className="skeletonShimmer" style={{ width: 100, height: 12 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 80, height: 14 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 60, height: 16 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 90, height: 22, borderRadius: 12 }} />
                    </td>
                    <td>
                      <div className="skeletonShimmer" style={{ width: 70, height: 22, borderRadius: 12 }} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="skeletonShimmer" style={{ width: 90, height: 28, margin: '0 auto', borderRadius: 4 }} />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#86868b' }}>
                    {products.length === 0
                      ? 'No products found in your Shopify store. Click "+ Add / Edit in Shopify" above to add products.'
                      : 'No products matched your search filter.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const numericId = p.shopifyId ? p.shopifyId.split('/').pop() : '';
                  const editProductUrl = numericId
                    ? `https://admin.shopify.com/store/${cleanStoreName}/products/${numericId}`
                    : shopifyAdminUrl;

                  return (
                    <tr key={p.id} className={styles.tableRow}>
                      <td>
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 6,
                            overflow: 'hidden',
                            position: 'relative',
                            background: '#1a1a1a',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: 13, marginBottom: 2 }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#86868b', fontFamily: 'monospace' }}>
                          handle: {p.handle}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: '#a1a1a6' }}>
                          {p.category || 'Apparel'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#ffffff', fontFamily: 'monospace', fontSize: 13 }}>
                          ${p.price.toFixed(2)}{' '}
                          <span style={{ fontSize: 10, color: '#86868b' }}>{p.currency || 'USD'}</span>
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {p.sizes && p.sizes.length > 0 ? (
                            p.sizes.map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: 10,
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  color: '#cccccc',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: 11, color: '#86868b' }}>One Size</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {p.availableForSale ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 11,
                              color: '#e2ff32',
                              background: 'rgba(226, 255, 50, 0.12)',
                              padding: '3px 9px',
                              borderRadius: 10,
                              fontWeight: 600,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: '#e2ff32',
                                boxShadow: '0 0 6px #e2ff32',
                              }}
                            />
                            In Stock
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 11,
                              color: '#ff453a',
                              background: 'rgba(255, 69, 58, 0.12)',
                              padding: '3px 9px',
                              borderRadius: 10,
                              fontWeight: 600,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: '#ff453a',
                              }}
                            />
                            Sold Out
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <a
                          href={editProductUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnSecondary}
                          style={{
                            fontSize: 11,
                            padding: '4px 10px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                          title="Open product editor in Shopify Admin"
                        >
                          <span>Edit</span>
                          <span>↗</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
