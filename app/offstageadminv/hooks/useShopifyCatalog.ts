import { useState, useCallback, useEffect, useMemo } from 'react';
import { fetchShopifyProductsList } from '../services/consoleClientService';
import { extractErrorMessage } from '../utils/errorHelpers';
import { filterShopifyProducts } from '../utils/productFilters';
import type {
  NotifyHandler,
  ProductStockFilter,
  ShopifyProductItem,
} from '../types';

export interface UseShopifyCatalogOptions {
  notify?: NotifyHandler;
}

export function useShopifyCatalog({ notify }: UseShopifyCatalogOptions) {
  const [products, setProducts] = useState<ShopifyProductItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<ProductStockFilter>('all');

  const storeDomain =
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'z6sevy-0z.myshopify.com';
  const cleanStoreName = storeDomain.replace('.myshopify.com', '');
  const shopifyAdminUrl = `https://admin.shopify.com/store/${cleanStoreName}/products`;

  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const catalogProducts = await fetchShopifyProductsList();
      setProducts(catalogProducts);
    } catch (error: unknown) {
      console.error('Error loading Shopify products:', error);
      notify?.('error', extractErrorMessage(error, 'Error loading store products'));
    } finally {
      setIsLoadingProducts(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(
    () => filterShopifyProducts(products, searchQuery, stockFilter),
    [products, searchQuery, stockFilter]
  );

  const inStockCount = useMemo(
    () => products.filter((product) => product.availableForSale).length,
    [products]
  );

  const soldOutCount = useMemo(
    () => products.filter((product) => !product.availableForSale).length,
    [products]
  );

  return {
    products,
    filteredProducts,
    inStockCount,
    soldOutCount,
    isLoadingProducts,
    searchQuery,
    setSearchQuery,
    stockFilter,
    setStockFilter,
    cleanStoreName,
    shopifyAdminUrl,
    loadProducts,
  };
}

