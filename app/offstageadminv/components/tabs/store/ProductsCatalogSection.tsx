'use client';

import React from 'react';
import type { ProductStockFilter, ShopifyProductItem } from '../../../types';
import shellStyles from '../../../styles/adminShell.module.css';
import storeStyles from '../../../styles/adminStore.module.css';

interface ProductsCatalogSectionProps {
  products: ShopifyProductItem[];
  filteredProducts: ShopifyProductItem[];
  inStockCount: number;
  soldOutCount: number;
  isLoadingProducts: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stockFilter: ProductStockFilter;
  onStockFilterChange: (filter: ProductStockFilter) => void;
  cleanStoreName: string;
  shopifyAdminUrl: string;
  onRefreshProducts: () => void;
}

export function ProductsCatalogSection({
  products,
  filteredProducts,
  inStockCount,
  soldOutCount,
  isLoadingProducts,
  searchQuery,
  onSearchChange,
  stockFilter,
  onStockFilterChange,
  cleanStoreName,
  shopifyAdminUrl,
  onRefreshProducts,
}: ProductsCatalogSectionProps) {
  return (
    <div>
      <div className={storeStyles.catalogToolbar}>
        <div className={storeStyles.catalogSearchInputWrap}>
          <input
            type="search"
            className={shellStyles.formInput}
            placeholder="Search products by title or category..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className={storeStyles.catalogFilterButtons}>
          <button
            type="button"
            className={`${storeStyles.catalogFilterBtn} ${
              stockFilter === 'all' ? storeStyles.catalogFilterBtnActive : ''
            }`}
            onClick={() => onStockFilterChange('all')}
          >
            All ({products.length})
          </button>
          <button
            type="button"
            className={`${storeStyles.catalogFilterBtn} ${
              stockFilter === 'in_stock' ? storeStyles.catalogFilterBtnActive : ''
            }`}
            onClick={() => onStockFilterChange('in_stock')}
          >
            In Stock ({inStockCount})
          </button>
          <button
            type="button"
            className={`${storeStyles.catalogFilterBtn} ${
              stockFilter === 'sold_out' ? storeStyles.catalogFilterBtnActive : ''
            }`}
            onClick={() => onStockFilterChange('sold_out')}
          >
            Sold Out ({soldOutCount})
          </button>

          <button
            type="button"
            className={shellStyles.btnSecondary}
            onClick={onRefreshProducts}
            disabled={isLoadingProducts}
          >
            {isLoadingProducts ? 'Syncing...' : 'Sync Shopify'}
          </button>

          <a
            href={shopifyAdminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={shellStyles.btnSecondary}
          >
            Shopify Admin ({cleanStoreName}) ↗
          </a>
        </div>
      </div>

      {isLoadingProducts ? (
        <div className={shellStyles.card}>
          <div className={storeStyles.productEmptyBox}>Syncing live catalog from Shopify Storefront API...</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={shellStyles.card}>
          <div className={storeStyles.productEmptyBox}>
            No products matched your current filter or search query.
          </div>
        </div>
      ) : (
        <div className={storeStyles.productGrid}>
          {filteredProducts.map((product) => {
            const variantCount = product.variantsList?.length || product.sizes?.length || 1;
            const numericShopifyId = product.shopifyId?.split('/').pop();
            const shopifyEditHref = numericShopifyId
              ? `${shopifyAdminUrl}/${numericShopifyId}`
              : shopifyAdminUrl;

            return (
              <article key={product.id} className={storeStyles.productCard}>
                <div className={storeStyles.productImageBox}>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className={storeStyles.productImage}
                    />
                  ) : (
                    <div className={storeStyles.productNoImage}>No Product Image</div>
                  )}

                  <span
                    className={`${storeStyles.productStockBadge} ${
                      product.availableForSale
                        ? storeStyles.productStockBadgeIn
                        : storeStyles.productStockBadgeOut
                    }`}
                  >
                    <span
                      className={`${storeStyles.productStockDot} ${
                        product.availableForSale
                          ? storeStyles.productStockDotIn
                          : storeStyles.productStockDotOut
                      }`}
                    />
                    {product.availableForSale ? 'In Stock' : 'Sold Out'}
                  </span>
                </div>

                <div className={storeStyles.productCardBody}>
                  <h4 className={storeStyles.productTitle}>{product.name}</h4>
                  <div className={storeStyles.productMetaRow}>
                    <span className={storeStyles.productPrice}>
                      ${Number(product.price || 0).toFixed(2)} {product.currency || 'USD'}
                    </span>
                    <span className={storeStyles.productVariantsLabel}>
                      {variantCount} variant{variantCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  {product.category && (
                    <div>
                      <span className={shellStyles.tagPill}>{product.category}</span>
                    </div>
                  )}

                  <div className={storeStyles.productCardFooter}>
                    <a
                      href={`/shop/${product.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={shellStyles.linkPill}
                    >
                      Storefront ↗
                    </a>
                    <a
                      href={shopifyEditHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={shellStyles.btnEdit}
                    >
                      Shopify ↗
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

