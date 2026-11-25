import type { MetadataRoute } from 'next';
import { getShopifyProducts } from '@/lib/shopify';
import { getSiteUrl } from '@/lib/utils/siteUrl';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shows`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/media`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getShopifyProducts(100);
    productRoutes = products
      .filter((product) => Boolean(product.handle || product.id))
      .map((product) => ({
        url: `${baseUrl}/shop/${encodeURIComponent(product.handle || product.id)}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch (error) {
    console.warn('Sitemap: skipping dynamic Shopify product URLs:', error);
  }

  return [...staticRoutes, ...productRoutes];
}
