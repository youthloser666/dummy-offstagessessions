import type { ProductStockFilter, ShopifyProductItem } from '../types';

export function filterShopifyProducts(
  products: ShopifyProductItem[],
  searchQuery: string,
  stockFilter: ProductStockFilter
): ShopifyProductItem[] {
  const normalizedQuery = searchQuery.toLowerCase();

  return products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(normalizedQuery) ||
      Boolean(product.category?.toLowerCase().includes(normalizedQuery));

    if (!matchesSearch) {
      return false;
    }
    if (stockFilter === 'in_stock') {
      return product.availableForSale;
    }
    if (stockFilter === 'sold_out') {
      return !product.availableForSale;
    }
    return true;
  });
}

