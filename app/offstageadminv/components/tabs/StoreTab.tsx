'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '../../admin.module.css';
import { ShopBanner } from '../../types';
import EditBannerModal from '../modals/EditBannerModal';

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
  passkey?: string;
  notify?: (type: 'success' | 'error', message: string) => void;
}

export default function StoreTab({ passkey = 'offstage-session-admin-2026', notify }: StoreTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'banners' | 'products'>('banners');

  // =========================================================================
  // BANNERS STATE & CRUD
  // =========================================================================
  const [banners, setBanners] = useState<ShopBanner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState<boolean>(true);
  const [showCreateBannerDrawer, setShowCreateBannerDrawer] = useState<boolean>(false);

  // New banner form state
  const [newBanner, setNewBanner] = useState({
    title: '',
    category: '',
    price: '',
    image_url: '',
    mobile_image_url: '',
    link_url: '/shop',
    button_text: '',
    display_order: 1,
    active: true,
    hide_title: false,
    hide_price: false,
    hide_button: false,
  });

  const [bannerUploading, setBannerUploading] = useState<boolean>(false);
  const [bannerUploadPreview, setBannerUploadPreview] = useState<string | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [mobileBannerUploading, setMobileBannerUploading] = useState<boolean>(false);
  const [mobileBannerUploadPreview, setMobileBannerUploadPreview] = useState<string | null>(null);
  const mobileBannerFileInputRef = useRef<HTMLInputElement>(null);

  // Edit banner modal state
  const [editingBanner, setEditingBanner] = useState<ShopBanner | null>(null);
  const [editBannerUploading, setEditBannerUploading] = useState<boolean>(false);
  const [editBannerPreview, setEditBannerPreview] = useState<string | null>(null);
  const [editMobileBannerUploading, setEditMobileBannerUploading] = useState<boolean>(false);
  const [editMobileBannerPreview, setEditMobileBannerPreview] = useState<string | null>(null);

  // =========================================================================
  // SHOPIFY PRODUCTS STATE
  // =========================================================================
  const [products, setProducts] = useState<ShopifyProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_stock' | 'sold_out'>('all');

  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'z6sevy-0z.myshopify.com';
  const cleanStoreName = storeDomain.replace('.myshopify.com', '');
  const shopifyAdminUrl = `https://admin.shopify.com/store/${cleanStoreName}/products`;

  // =========================================================================
  // LOADERS
  // =========================================================================
  const loadBanners = async () => {
    setLoadingBanners(true);
    try {
      const res = await fetch('/api/shop-banners');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBanners(data.data);
      }
    } catch (err: any) {
      console.error('Failed to load shop banners:', err);
      if (notify) notify('error', 'Failed to load shop banners');
    } finally {
      setLoadingBanners(false);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/shopify/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (err: any) {
      console.error('Error loading Shopify products:', err);
      if (notify) notify('error', err.message || 'Error loading store products');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadBanners();
    loadProducts();
  }, []);

  // =========================================================================
  // BANNER HANDLERS (CREATE, UPDATE, DELETE, TOGGLE)
  // =========================================================================
  const handleBannerFileUpload = async (file: File) => {
    if (!file) return;
    setBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'shop-banners');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-passkey': passkey },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setNewBanner((prev) => ({ ...prev, image_url: data.url }));
      setBannerUploadPreview(data.url);
      if (notify) notify('success', 'Banner image uploaded successfully (Optimized WebP)');
    } catch (err: any) {
      if (notify) notify('error', err.message || 'Failed to upload banner image');
    } finally {
      setBannerUploading(false);
    }
  };

  const handleEditBannerUpload = async (file: File) => {
    if (!file || !editingBanner) return;
    setEditBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'shop-banners');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-passkey': passkey },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setEditingBanner((prev) => (prev ? { ...prev, image_url: data.url } : null));
      setEditBannerPreview(data.url);
      if (notify) notify('success', 'New banner image uploaded');
    } catch (err: any) {
      if (notify) notify('error', err.message || 'Failed to upload image');
    } finally {
      setEditBannerUploading(false);
    }
  };

  const handleMobileBannerFileUpload = async (file: File) => {
    if (!file) return;
    setMobileBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'shop-banners');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-passkey': passkey },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setNewBanner((prev) => ({ ...prev, mobile_image_url: data.url }));
      setMobileBannerUploadPreview(data.url);
      if (notify) notify('success', 'Mobile banner image uploaded successfully (Optimized WebP)');
    } catch (err: any) {
      if (notify) notify('error', err.message || 'Failed to upload mobile banner image');
    } finally {
      setMobileBannerUploading(false);
    }
  };

  const handleEditMobileBannerUpload = async (file: File) => {
    if (!file || !editingBanner) return;
    setEditMobileBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'shop-banners');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-passkey': passkey },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setEditingBanner((prev) => (prev ? { ...prev, mobile_image_url: data.url } : null));
      setEditMobileBannerPreview(data.url);
      if (notify) notify('success', 'New mobile banner image uploaded');
    } catch (err: any) {
      if (notify) notify('error', err.message || 'Failed to upload mobile banner image');
    } finally {
      setEditMobileBannerUploading(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.hide_title && !newBanner.title.trim()) {
      if (notify) notify('error', 'Please provide a banner title.');
      return;
    }
    
    const desktopImg = newBanner.image_url.trim();
    const mobileImg = newBanner.mobile_image_url.trim();
    if (!desktopImg && !mobileImg) {
      if (notify) notify('error', 'Please upload or provide at least one banner image (Desktop or Mobile).');
      return;
    }

    const bannerPayload = {
      ...newBanner,
      image_url: desktopImg,
      mobile_image_url: mobileImg,
    };

    try {
      const res = await fetch('/api/shop-banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(bannerPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create shop banner');
      }

      if (notify) notify('success', `Banner "${newBanner.title || 'Slide'}" created successfully!`);
      setNewBanner({
        title: '',
        category: '',
        price: '',
        image_url: '',
        mobile_image_url: '',
        link_url: '/shop',
        button_text: '',
        display_order: banners.length + 1,
        active: true,
        hide_title: false,
        hide_price: false,
        hide_button: false,
      });
      setBannerUploadPreview(null);
      setMobileBannerUploadPreview(null);
      setShowCreateBannerDrawer(false);
      loadBanners();
    } catch (err: any) {
      if (notify) notify('error', err.message || 'Error creating banner');
    }
  };

  const handleUpdateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    const desktopImg = (editingBanner.image_url || '').trim();
    const mobileImg = (editingBanner.mobile_image_url || '').trim();
    if (!desktopImg && !mobileImg) {
      if (notify) notify('error', 'Please upload or provide at least one banner image (Desktop or Mobile).');
      return;
    }

    const bannerPayload = {
      ...editingBanner,
      image_url: desktopImg,
      mobile_image_url: mobileImg,
    };

    try {
      const res = await fetch('/api/shop-banners', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(bannerPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update shop banner');
      }

      if (notify) notify('success', `Banner "${editingBanner.title}" updated successfully!`);
      setEditingBanner(null);
      setEditBannerPreview(null);
      setEditMobileBannerPreview(null);
      loadBanners();
    } catch (err: any) {
      if (notify) notify('error', err.message || 'Error updating banner');
    }
  };

  const handleDeleteBanner = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the banner "${title}"?`)) return;

    try {
      const res = await fetch(`/api/shop-banners?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': passkey },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete banner');
      }

      if (notify) notify('success', `Banner "${title}" deleted.`);
      loadBanners();
    } catch (err: any) {
      if (notify) notify('error', err.message || 'Error deleting banner');
    }
  };

  const handleToggleActiveBanner = async (banner: ShopBanner) => {
    try {
      const updatedActive = !banner.active;
      const res = await fetch('/api/shop-banners', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ id: banner.id, active: updatedActive }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle status');
      }

      if (notify) notify('success', `Banner "${banner.title}" is now ${updatedActive ? 'Active' : 'Hidden'}`);
      loadBanners();
    } catch (err: any) {
      if (notify) notify('error', err.message || 'Failed to toggle banner status');
    }
  };

  // =========================================================================
  // PRODUCTS FILTER
  // =========================================================================
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
  const activeBannersCount = banners.filter((b) => b.active !== false).length;

  return (
    <div>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Shopify Store &amp; Hero Banners</h1>
          <p className={styles.pageDesc}>
            Manage merchandise items, inventory stock status, and custom hero carousel banners for /shop.
          </p>
        </div>

        <div className={styles.headerActions}>
          {activeSubTab === 'banners' ? (
            <>
              <button
                onClick={loadBanners}
                disabled={loadingBanners}
                className={styles.btnSecondary}
                title="Reload shop banners"
              >
                {loadingBanners ? 'Refreshing...' : 'Refresh Banners'}
              </button>

              <button
                onClick={() => setShowCreateBannerDrawer(!showCreateBannerDrawer)}
                className={styles.btnPrimary}
              >
                {showCreateBannerDrawer ? 'Cancel' : '+ New Banner'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={loadProducts}
                disabled={loadingProducts}
                className={styles.btnSecondary}
                title="Reload latest updates from Shopify"
              >
                {loadingProducts ? 'Syncing...' : 'Sync Store'}
              </button>

              <a
                href={shopifyAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnPrimary}
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>+ Edit in Shopify</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </>
          )}

          <a
            href="/shop"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span>Live Shop ↗</span>
          </a>
        </div>
      </div>

      {/* Subtab Switcher */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 16 }}>
        <button
          onClick={() => setActiveSubTab('banners')}
          className={activeSubTab === 'banners' ? styles.btnPrimary : styles.btnSecondary}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '8px 18px' }}
        >
          <span>🖼️ Shop Hero Banners</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: activeSubTab === 'banners' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.1)',
              padding: '2px 7px',
              borderRadius: 10,
            }}
          >
            {banners.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('products')}
          className={activeSubTab === 'products' ? styles.btnPrimary : styles.btnSecondary}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '8px 18px' }}
        >
          <span>👕 Shopify Products</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: activeSubTab === 'products' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.1)',
              padding: '2px 7px',
              borderRadius: 10,
            }}
          >
            {products.length}
          </span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* VIEW 1: HERO BANNERS MANAGEMENT (CRUD)                                */}
      {/* ===================================================================== */}
      {activeSubTab === 'banners' && (
        <div>
          {/* Quick Metrics */}
          <div className={styles.metricsGrid} style={{ marginBottom: 20 }}>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Total Shop Banners</div>
              <div className={styles.metricValue}>{banners.length}</div>
              <div className={styles.metricSubtitle}>{activeBannersCount} currently active in carousel</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Active Slide Ratio</div>
              <div className={styles.metricValue} style={{ color: '#55f385' }}>
                {banners.length > 0 ? `${Math.round((activeBannersCount / banners.length) * 100)}%` : '0%'}
              </div>
              <div className={styles.metricSubtitle}>Displayed on /shop header</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Autoplay Transition</div>
              <div className={styles.metricValue} style={{ color: '#e2ff32' }}>
                4.8s
              </div>
              <div className={styles.metricSubtitle}>With indicator dots &amp; controls</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Shopify Integration</div>
              <div className={styles.metricValue} style={{ fontSize: 18, color: '#60a5fa' }}>
                Active
              </div>
              <div className={styles.metricSubtitle}>{cleanStoreName}.myshopify.com</div>
            </div>
          </div>

          {/* Collapsible New Banner Creation Drawer */}
          {showCreateBannerDrawer && (
            <div className={styles.card} style={{ marginBottom: 24, border: '1px solid rgba(226, 255, 50, 0.25)' }}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>+ Create New Shop Hero Banner</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#86868b' }}>
                    Upload banner image, set headline text, and link destination.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowCreateBannerDrawer(false)}
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleCreateBanner}>
                {/* DUAL ASSET UPLOAD: DESKTOP & MOBILE DIVIDED */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                  marginBottom: 20,
                }}>
                  {/* BOX 1: DESKTOP BANNER */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 8,
                    padding: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 16 }}>🖥️</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#ffffff' }}>Banner Khusus Desktop</div>
                          <div style={{ fontSize: 10, color: '#86868b' }}>Tampil di PC / Laptop (&gt; 768px)</div>
                        </div>
                      </div>
                      {(bannerUploadPreview || newBanner.image_url) && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewBanner({ ...newBanner, image_url: '' });
                            setBannerUploadPreview(null);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ff453a',
                            fontSize: 10,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div
                      className={styles.dropzoneContainer}
                      onClick={() => bannerFileInputRef.current?.click()}
                      style={{ minHeight: 140 }}
                    >
                      <input
                        ref={bannerFileInputRef}
                        type="file"
                        accept="image/*"
                        className={styles.hiddenFileInput}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBannerFileUpload(file);
                        }}
                      />

                      {bannerUploading ? (
                        <div className={styles.dropzonePrompt}>
                          <span>Uploading &amp; converting to WebP...</span>
                        </div>
                      ) : bannerUploadPreview || newBanner.image_url ? (
                        <div className={styles.dropzonePreview}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={bannerUploadPreview || newBanner.image_url}
                            alt="Desktop Banner preview"
                            className={styles.dropzonePreviewImg}
                            style={{ maxHeight: 140, objectFit: 'cover', width: '100%', borderRadius: 6 }}
                          />
                          <div className={styles.dropzoneOverlay}>Click to change desktop photo</div>
                        </div>
                      ) : (
                        <div className={styles.dropzonePrompt}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 4, opacity: 0.7 }}>
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                          </svg>
                          <span>Upload Desktop (Landscape 16:9)</span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <input
                        type="url"
                        className={styles.formInput}
                        placeholder="Or paste Desktop image URL"
                        value={newBanner.image_url}
                        onChange={(e) => {
                          setNewBanner({ ...newBanner, image_url: e.target.value });
                          setBannerUploadPreview(e.target.value);
                        }}
                      />
                    </div>
                  </div>

                  {/* BOX 2: MOBILE BANNER */}
                  <div style={{
                    background: 'rgba(226, 255, 50, 0.02)',
                    border: '1px solid rgba(226, 255, 50, 0.3)',
                    borderRadius: 8,
                    padding: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 16 }}>📱</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#e2ff32' }}>Banner Khusus Mobile</div>
                          <div style={{ fontSize: 10, color: '#86868b' }}>Tampil di Layar HP (&le; 768px)</div>
                        </div>
                      </div>
                      {(mobileBannerUploadPreview || newBanner.mobile_image_url) && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewBanner({ ...newBanner, mobile_image_url: '' });
                            setMobileBannerUploadPreview(null);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ff453a',
                            fontSize: 10,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div
                      className={styles.dropzoneContainer}
                      onClick={() => mobileBannerFileInputRef.current?.click()}
                      style={{ minHeight: 140 }}
                    >
                      <input
                        ref={mobileBannerFileInputRef}
                        type="file"
                        accept="image/*"
                        className={styles.hiddenFileInput}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMobileBannerFileUpload(file);
                        }}
                      />

                      {mobileBannerUploading ? (
                        <div className={styles.dropzonePrompt}>
                          <span>Uploading mobile WebP...</span>
                        </div>
                      ) : mobileBannerUploadPreview || newBanner.mobile_image_url ? (
                        <div className={styles.dropzonePreview}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mobileBannerUploadPreview || newBanner.mobile_image_url}
                            alt="Mobile Banner preview"
                            className={styles.dropzonePreviewImg}
                            style={{ maxHeight: 140, objectFit: 'cover', width: '100%', borderRadius: 6 }}
                          />
                          <div className={styles.dropzoneOverlay}>Click to change mobile photo</div>
                        </div>
                      ) : (
                        <div className={styles.dropzonePrompt}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 4, opacity: 0.7 }}>
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                            <line x1="12" y1="18" x2="12.01" y2="18" />
                          </svg>
                          <span>Upload Mobile (Portrait 9:16)</span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <input
                        type="url"
                        className={styles.formInput}
                        placeholder="Or paste Mobile image URL"
                        value={newBanner.mobile_image_url}
                        onChange={(e) => {
                          setNewBanner({ ...newBanner, mobile_image_url: e.target.value });
                          setMobileBannerUploadPreview(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Conditionally rendered detail fields */}
                {!newBanner.hide_title && (
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Banner Title *</label>
                      <input
                        type="text"
                        required={!newBanner.hide_title}
                        className={styles.formInput}
                        placeholder="e.g. THE STRAPBACK"
                        value={newBanner.title}
                        onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Category / Eyebrow</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="e.g. APPAREL, LIMITED DROP"
                        value={newBanner.category}
                        onChange={(e) => setNewBanner({ ...newBanner, category: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {(!newBanner.hide_price || !newBanner.hide_button) && (
                  <div className={styles.formRow}>
                    {!newBanner.hide_price && (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Price / Tagline</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          placeholder="e.g. $25.00 or Official Merch"
                          value={newBanner.price}
                          onChange={(e) => setNewBanner({ ...newBanner, price: e.target.value })}
                        />
                      </div>
                    )}

                    {!newBanner.hide_button && (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>CTA Button Text</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          placeholder="e.g. SHOP NOW"
                          value={newBanner.button_text}
                          onChange={(e) => setNewBanner({ ...newBanner, button_text: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Destination Link URL</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. /shop or product link"
                      value={newBanner.link_url}
                      onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Display Order</label>
                    <input
                      type="number"
                      min="1"
                      className={styles.formInput}
                      value={newBanner.display_order}
                      onChange={(e) => setNewBanner({ ...newBanner, display_order: parseInt(e.target.value, 10) || 1 })}
                    />
                  </div>
                </div>

                {/* Banner Overlay Checkboxes below Display Order */}
                <div style={{ marginTop: 10, marginBottom: 14, padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 6, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#86868b', marginBottom: 10 }}>
                    Banner Text Overlay Options
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#f5f5f7' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(newBanner.hide_title)}
                        onChange={(e) => setNewBanner({ ...newBanner, hide_title: e.target.checked })}
                        style={{ accentColor: '#e2ff32', width: 16, height: 16 }}
                      />
                      <span>Remove Banner Title &amp; Category</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#f5f5f7' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(newBanner.hide_price)}
                        onChange={(e) => setNewBanner({ ...newBanner, hide_price: e.target.checked })}
                        style={{ accentColor: '#e2ff32', width: 16, height: 16 }}
                      />
                      <span>Remove Price / Tagline</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#f5f5f7' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(newBanner.hide_button)}
                        onChange={(e) => setNewBanner({ ...newBanner, hide_button: e.target.checked })}
                        style={{ accentColor: '#e2ff32', width: 16, height: 16 }}
                      />
                      <span>Remove Shop Button</span>
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup} style={{ marginTop: 4, marginBottom: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#f5f5f7' }}>
                    <input
                      type="checkbox"
                      checked={newBanner.active}
                      onChange={(e) => setNewBanner({ ...newBanner, active: e.target.checked })}
                      style={{ accentColor: '#e2ff32', width: 16, height: 16 }}
                    />
                    <span>Active (Immediately visible on /shop carousel)</span>
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setShowCreateBannerDrawer(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bannerUploading}
                    className={styles.btnPrimary}
                  >
                    {bannerUploading ? 'Uploading...' : 'Publish Banner Slide'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Banners List / Table */}
          <div className={styles.card} style={{ padding: 0 }}>
            <div className={styles.cardHeader} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <h3 className={styles.cardTitle}>Hero Banner Slides</h3>
                <span style={{ fontSize: 11, color: '#86868b' }}>
                  Slides rotate automatically in the order defined below
                </span>
              </div>
              <button
                onClick={() => setShowCreateBannerDrawer(true)}
                className={styles.btnSecondary}
                style={{ fontSize: 11 }}
              >
                + Add Slide
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Order</th>
                    <th style={{ width: 100 }}>Preview</th>
                    <th>Banner Title &amp; Category</th>
                    <th>Price / Tagline</th>
                    <th>Destination Link</th>
                    <th style={{ width: 110 }}>Status</th>
                    <th style={{ width: 150, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBanners ? (
                    [1, 2, 3].map((n) => (
                      <tr key={n} className={styles.tableRow}>
                        <td><div className="skeletonShimmer" style={{ width: 24, height: 16 }} /></td>
                        <td><div className="skeletonShimmer" style={{ width: 80, height: 50, borderRadius: 4 }} /></td>
                        <td><div className="skeletonShimmer" style={{ width: 140, height: 18 }} /></td>
                        <td><div className="skeletonShimmer" style={{ width: 60, height: 16 }} /></td>
                        <td><div className="skeletonShimmer" style={{ width: 90, height: 16 }} /></td>
                        <td><div className="skeletonShimmer" style={{ width: 60, height: 20 }} /></td>
                        <td><div className="skeletonShimmer" style={{ width: 100, height: 26 }} /></td>
                      </tr>
                    ))
                  ) : banners.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: '#86868b' }}>
                        <p style={{ margin: '0 0 8px 0', color: '#ffffff', fontWeight: 600 }}>No banners created yet</p>
                        <p style={{ margin: 0, fontSize: 12 }}>
                          Click &quot;+ New Banner&quot; above to add your first custom slide for the Shop page.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    banners.map((banner, index) => (
                      <tr key={banner.id || index} className={styles.tableRow}>
                        <td style={{ fontWeight: 700, color: '#e2ff32' }}>
                          #{banner.display_order ?? index + 1}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            {/* Desktop preview */}
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 9, color: banner.image_url ? '#e2ff32' : '#86868b', marginBottom: 2 }}>🖥️ Desktop</div>
                              {banner.image_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={banner.image_url}
                                  alt="Desktop Banner"
                                  style={{
                                    width: 72,
                                    height: 42,
                                    objectFit: 'cover',
                                    borderRadius: 4,
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: 72,
                                  height: 42,
                                  background: 'rgba(255,255,255,0.04)',
                                  borderRadius: 4,
                                  border: '1px dashed rgba(255,255,255,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 8,
                                  color: '#666',
                                }} title="No desktop image (Mobile only banner)">
                                  Mobile Only
                                </div>
                              )}
                            </div>
                            {/* Mobile preview */}
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 9, color: banner.mobile_image_url ? '#e2ff32' : '#86868b', marginBottom: 2 }}>📱 Mobile</div>
                              {banner.mobile_image_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={banner.mobile_image_url}
                                  alt="Mobile Banner"
                                  style={{
                                    width: 26,
                                    height: 42,
                                    objectFit: 'cover',
                                    borderRadius: 4,
                                    border: '1px solid rgba(226, 255, 50, 0.4)',
                                  }}
                                  title={`Mobile banner: ${banner.mobile_image_url}`}
                                />
                              ) : (
                                <div style={{
                                  width: 26,
                                  height: 42,
                                  background: 'rgba(255,255,255,0.04)',
                                  borderRadius: 4,
                                  border: '1px dashed rgba(255,255,255,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 8,
                                  color: '#666',
                                }} title="No mobile image (Desktop only banner)">
                                  Desktop Only
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {banner.hide_title ? (
                            <span style={{ fontSize: 11, color: '#86868b', fontStyle: 'italic' }}>— (Hidden)</span>
                          ) : (
                            <>
                              <div style={{ fontWeight: 600, color: '#ffffff' }}>{banner.title || 'Untitled'}</div>
                              {banner.category && (
                                <div style={{ fontSize: 11, color: '#e2ff32', fontFamily: 'monospace' }}>
                                  {banner.category}
                                </div>
                              )}
                            </>
                          )}
                        </td>
                        <td style={{ color: '#d1d1d6', fontSize: 12, fontFamily: 'monospace' }}>
                          {banner.hide_price ? (
                            <span style={{ fontSize: 11, color: '#86868b', fontStyle: 'italic' }}>—</span>
                          ) : (
                            banner.price || '—'
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: 11, color: '#86868b', fontFamily: 'monospace' }}>
                            {banner.link_url || 'None'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleActiveBanner(banner)}
                            title="Click to toggle Active / Hidden"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                            }}
                          >
                            {banner.active !== false ? (
                              <span
                                className={styles.statusBadge}
                                style={{
                                  backgroundColor: 'rgba(85, 243, 133, 0.15)',
                                  color: '#55f385',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                }}
                              >
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#55f385' }} />
                                Active
                              </span>
                            ) : (
                              <span
                                className={styles.statusBadge}
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                  color: '#86868b',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                }}
                              >
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#86868b' }} />
                                Hidden
                              </span>
                            )}
                          </button>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className={styles.btnGroup}>
                            <button
                              onClick={() => {
                                setEditingBanner({ ...banner });
                                setEditBannerPreview(banner.image_url);
                                setEditMobileBannerPreview(banner.mobile_image_url || null);
                              }}
                              className={styles.btnEdit}
                              title="Edit banner"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(banner.id, banner.title)}
                              className={styles.btnDelete}
                              title="Delete banner"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: SHOPIFY PRODUCTS INVENTORY                                    */}
      {/* ===================================================================== */}
      {activeSubTab === 'products' && (
        <div>
          {/* Quick Stats Grid */}
          <div className={styles.metricsGrid} style={{ marginBottom: 20 }}>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Total Products</div>
              <div className={styles.metricValue}>{products.length}</div>
              <div className={styles.metricSubtitle}>Synced from Shopify Storefront</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>In Stock Items</div>
              <div className={styles.metricValue} style={{ color: '#e2ff32' }}>
                {inStockCount}
              </div>
              <div className={styles.metricSubtitle}>Available for immediate checkout</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Sold Out Items</div>
              <div className={styles.metricValue} style={{ color: soldOutCount > 0 ? '#ff453a' : '#86868b' }}>
                {soldOutCount}
              </div>
              <div className={styles.metricSubtitle}>Inventory depleted</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Store Domain</div>
              <div className={styles.metricValue} style={{ fontSize: 16, wordBreak: 'break-all' }}>
                {cleanStoreName}
              </div>
              <div className={styles.metricSubtitle}>Headless API connection active</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['all', 'in_stock', 'sold_out'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterStatus(filter)}
                  className={filterStatus === filter ? styles.btnPrimary : styles.btnSecondary}
                  style={{ fontSize: 12, padding: '5px 12px', textTransform: 'capitalize' }}
                >
                  {filter === 'all'
                    ? `All (${products.length})`
                    : filter === 'in_stock'
                    ? `In Stock (${inStockCount})`
                    : `Sold Out (${soldOutCount})`}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search products by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.formInput}
              style={{ maxWidth: 300, fontSize: 12 }}
            />
          </div>

          {/* Products Table */}
          <div className={styles.card} style={{ padding: 0 }}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>Image</th>
                    <th>Product Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Available Sizes</th>
                    <th style={{ width: 120 }}>Stock Status</th>
                    <th style={{ width: 110, textAlign: 'center' }}>Shopify</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProducts ? (
                    [1, 2, 3].map((n) => (
                      <tr key={n} className={styles.tableRow}>
                        <td><div className="skeletonShimmer" style={{ width: 50, height: 50, borderRadius: 4 }} /></td>
                        <td><div className="skeletonShimmer" style={{ width: 160, height: 18 }} /></td>
                        <td><div className="skeletonShimmer" style={{ width: 80, height: 16 }} /></td>
                        <td><div className="skeletonShimmer" style={{ width: 60, height: 16 }} /></td>
                        <td><div className="skeletonShimmer" style={{ width: 100, height: 16 }} /></td>
                        <td><div className="skeletonShimmer" style={{ width: 75, height: 20 }} /></td>
                        <td><div className="skeletonShimmer" style={{ width: 60, height: 26 }} /></td>
                      </tr>
                    ))
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: '#86868b' }}>
                        No products found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const editProductUrl = `https://admin.shopify.com/store/${cleanStoreName}/products/${p.shopifyId.replace(
                        'gid://shopify/Product/',
                        ''
                      )}`;

                      return (
                        <tr key={p.id} className={styles.tableRow}>
                          <td>
                            {p.image ? (
                              <Image
                                src={p.image}
                                alt={p.name}
                                width={48}
                                height={48}
                                style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}
                              />
                            ) : (
                              <div style={{ width: 48, height: 48, background: '#1c1c1e', borderRadius: 4 }} />
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#ffffff' }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: '#86868b' }}>{p.handle}</div>
                          </td>
                          <td style={{ color: '#d1d1d6', fontSize: 12 }}>
                            {p.category || 'Apparel'}
                          </td>
                          <td style={{ fontWeight: 600, color: '#ffffff' }}>
                            ${p.price.toFixed(2)}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {p.sizes && p.sizes.length > 0 ? (
                                p.sizes.map((s) => (
                                  <span key={s} className={styles.tagPill} style={{ fontSize: 10 }}>
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span style={{ color: '#666', fontSize: 11 }}>One Size</span>
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
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e2ff32', boxShadow: '0 0 6px #e2ff32' }} />
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
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff453a' }} />
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
                              style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              title="Open product editor in Shopify Admin"
                            >
                              <span>Edit ↗</span>
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
      )}

      {/* Edit Banner Modal */}
      <EditBannerModal
        editingBanner={editingBanner}
        setEditingBanner={setEditingBanner}
        editBannerUploading={editBannerUploading}
        editBannerPreview={editBannerPreview}
        setEditBannerPreview={setEditBannerPreview}
        handleEditBannerUpload={handleEditBannerUpload}
        editMobileBannerUploading={editMobileBannerUploading}
        editMobileBannerPreview={editMobileBannerPreview}
        setEditMobileBannerPreview={setEditMobileBannerPreview}
        handleEditMobileBannerUpload={handleEditMobileBannerUpload}
        handleUpdateBanner={handleUpdateBanner}
      />
    </div>
  );
}
