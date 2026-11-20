'use client';

import React, { useEffect, useState } from 'react';
import { useShopBannersManager } from '../../../hooks/useShopBannersManager';
import { useShopifyCatalog } from '../../../hooks/useShopifyCatalog';
import type { NotifyHandler, StoreSubTab } from '../../../types';
import shellStyles from '../../../styles/adminShell.module.css';
import storeStyles from '../../../styles/adminStore.module.css';
import { BannersManagementSection } from './BannersManagementSection';
import { ProductsCatalogSection } from './ProductsCatalogSection';

interface StoreTabProps {
  passkey: string;
  notify?: NotifyHandler;
  onProductsCountChange?: (count: number) => void;
}

export function StoreTab({ passkey, notify, onProductsCountChange }: StoreTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<StoreSubTab>('banners');

  const bannersManager = useShopBannersManager({ passkey, notify });
  const catalog = useShopifyCatalog({ notify });

  useEffect(() => {
    onProductsCountChange?.(catalog.products.length);
  }, [catalog.products.length, onProductsCountChange]);

  return (
    <div>
      <header className={shellStyles.pageHeader}>
        <div>
          <h1 className={shellStyles.pageTitle}>Store &amp; Merch</h1>
          <p className={shellStyles.pageDesc}>
            Manage homepage/shop hero carousel banners and monitor Shopify Storefront inventory
          </p>
        </div>

        <div className={shellStyles.headerActions}>
          <a
            href="/shop"
            target="_blank"
            rel="noopener noreferrer"
            className={shellStyles.btnSecondary}
          >
            Preview Shop Page ↗
          </a>
        </div>
      </header>

      <section className={shellStyles.metricsGrid}>
        <div className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Active Hero Banners</span>
          <span className={`${shellStyles.metricValue} ${shellStyles.metricValueLime}`}>
            {bannersManager.activeBannersCount}
          </span>
          <span className={shellStyles.metricSubtitle}>
            {bannersManager.banners.length} total slides saved
          </span>
        </div>

        <div className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Shopify Products</span>
          <span className={shellStyles.metricValue}>{catalog.products.length}</span>
          <span className={shellStyles.metricSubtitle}>
            Synced from {catalog.cleanStoreName}
          </span>
        </div>

        <div className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Available In Stock</span>
          <span className={`${shellStyles.metricValue} ${shellStyles.metricValueSuccess}`}>
            {catalog.inStockCount}
          </span>
          <span className={shellStyles.metricSubtitle}>Ready for checkout</span>
        </div>

        <div className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Sold Out Items</span>
          <span className={`${shellStyles.metricValue} ${shellStyles.metricValueInfo}`}>
            {catalog.soldOutCount}
          </span>
          <span className={shellStyles.metricSubtitle}>Managed inside Shopify inventory</span>
        </div>
      </section>

      <div
        role="tablist"
        className={storeStyles.subTabsNav}
        aria-label="Store management sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'banners'}
          className={`${storeStyles.subTabBtn} ${
            activeSubTab === 'banners' ? storeStyles.subTabBtnActive : ''
          }`}
          onClick={() => setActiveSubTab('banners')}
        >
          Shop Hero Banners ({bannersManager.banners.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'products'}
          className={`${storeStyles.subTabBtn} ${
            activeSubTab === 'products' ? storeStyles.subTabBtnActive : ''
          }`}
          onClick={() => setActiveSubTab('products')}
        >
          Shopify Product Catalog ({catalog.products.length})
        </button>
      </div>

      {activeSubTab === 'banners' ? (
        <BannersManagementSection
          banners={bannersManager.banners}
          isLoadingBanners={bannersManager.isLoadingBanners}
          isCreateDrawerOpen={bannersManager.isCreateBannerDrawerOpen}
          setCreateDrawerOpen={bannersManager.setCreateBannerDrawerOpen}
          newBannerDraft={bannersManager.newBannerDraft}
          setNewBannerDraft={bannersManager.setNewBannerDraft}
          isCreateDesktopUploading={bannersManager.isCreateDesktopUploading}
          createDesktopPreviewUrl={bannersManager.createDesktopPreviewUrl}
          setCreateDesktopPreviewUrl={bannersManager.setCreateDesktopPreviewUrl}
          uploadCreateDesktopBanner={(file) => {
            void bannersManager.uploadCreateDesktopBanner(file);
          }}
          isCreateMobileUploading={bannersManager.isCreateMobileUploading}
          createMobilePreviewUrl={bannersManager.createMobilePreviewUrl}
          setCreateMobilePreviewUrl={bannersManager.setCreateMobilePreviewUrl}
          uploadCreateMobileBanner={(file) => {
            void bannersManager.uploadCreateMobileBanner(file);
          }}
          editingBanner={bannersManager.editingBanner}
          setEditingBanner={bannersManager.setEditingBanner}
          isEditDesktopUploading={bannersManager.isEditDesktopUploading}
          editDesktopPreviewUrl={bannersManager.editDesktopPreviewUrl}
          setEditDesktopPreviewUrl={bannersManager.setEditDesktopPreviewUrl}
          uploadEditDesktopBanner={(file) => {
            void bannersManager.uploadEditDesktopBanner(file);
          }}
          isEditMobileUploading={bannersManager.isEditMobileUploading}
          editMobilePreviewUrl={bannersManager.editMobilePreviewUrl}
          setEditMobilePreviewUrl={bannersManager.setEditMobilePreviewUrl}
          uploadEditMobileBanner={(file) => {
            void bannersManager.uploadEditMobileBanner(file);
          }}
          onRefreshBanners={() => {
            void bannersManager.loadBanners();
          }}
          onCreateBanner={(event) => {
            void bannersManager.handleCreateBanner(event);
          }}
          onOpenEditModal={bannersManager.openEditBannerModal}
          onCloseEditModal={bannersManager.closeEditBannerModal}
          onUpdateBanner={(event) => {
            void bannersManager.handleUpdateBanner(event);
          }}
          onDeleteBanner={(id, title) => {
            void bannersManager.handleDeleteBanner(id, title);
          }}
          onToggleBannerActive={(banner) => {
            void bannersManager.handleToggleBannerActive(banner);
          }}
        />
      ) : (
        <ProductsCatalogSection
          products={catalog.products}
          filteredProducts={catalog.filteredProducts}
          inStockCount={catalog.inStockCount}
          soldOutCount={catalog.soldOutCount}
          isLoadingProducts={catalog.isLoadingProducts}
          searchQuery={catalog.searchQuery}
          onSearchChange={catalog.setSearchQuery}
          stockFilter={catalog.stockFilter}
          onStockFilterChange={catalog.setStockFilter}
          cleanStoreName={catalog.cleanStoreName}
          shopifyAdminUrl={catalog.shopifyAdminUrl}
          onRefreshProducts={() => {
            void catalog.loadProducts();
          }}
        />
      )}
    </div>
  );
}

