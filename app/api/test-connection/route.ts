import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { cloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export async function GET() {
  const result: {
    supabase: {
      configured: boolean;
      connected: boolean;
      message: string;
      showsCount?: number;
      hasServiceRole?: boolean;
    };
    cloudinary: {
      configured: boolean;
      connected: boolean;
      message: string;
      cloudName?: string;
    };
    shopify: {
      configured: boolean;
      connected: boolean;
      message: string;
      storeDomain?: string;
      productsCount?: number;
    };
  } = {
    supabase: {
      configured: false,
      connected: false,
      message: 'Supabase credentials missing in environment variables.',
    },
    cloudinary: {
      configured: false,
      connected: false,
      message: 'Cloudinary credentials missing in environment variables.',
    },
    shopify: {
      configured: false,
      connected: false,
      message: 'Shopify credentials missing in environment variables.',
    },
  };

  // 1. Test Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && anonKey) {
    result.supabase.configured = true;
    result.supabase.hasServiceRole = Boolean(serviceRoleKey);

    try {
      const client = getSupabaseServerClient(Boolean(serviceRoleKey));
      if (client) {
        const { count, error } = await client
          .from('shows')
          .select('*', { count: 'exact', head: true });

        if (error) {
          result.supabase.message = `Supabase responded with error: ${error.message}. (Did you run schema.sql in Supabase SQL Editor?)`;
        } else {
          result.supabase.connected = true;
          result.supabase.showsCount = count ?? 0;
          result.supabase.message = `Supabase connected successfully. Found ${count ?? 0} shows in database.`;
        }
      }
    } catch (err: any) {
      result.supabase.message = `Failed to connect to Supabase: ${err.message}`;
    }
  }

  // 2. Test Cloudinary
  if (isCloudinaryConfigured) {
    result.cloudinary.configured = true;
    result.cloudinary.cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    try {
      const pingResult = await cloudinary.api.ping();
      if (pingResult && pingResult.status === 'ok') {
        result.cloudinary.connected = true;
        result.cloudinary.message = `Cloudinary connected successfully to cloud "${process.env.CLOUDINARY_CLOUD_NAME}".`;
      } else {
        result.cloudinary.message = 'Cloudinary ping returned non-ok response.';
      }
    } catch (err: any) {
      result.cloudinary.message = `Cloudinary ping error: ${err.message}`;
    }
  }

  // 3. Test Shopify
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const shopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (shopifyDomain && shopifyToken) {
    result.shopify.configured = true;
    result.shopify.storeDomain = shopifyDomain;

    try {
      const response = await fetch(`https://${shopifyDomain}/api/2024-07/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': shopifyToken,
        },
        body: JSON.stringify({
          query: '{ products(first: 20) { edges { node { id } } } }',
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data?.products) {
          result.shopify.connected = true;
          result.shopify.productsCount = json.data.products.edges.length;
          result.shopify.message = `Shopify connected successfully (${result.shopify.productsCount} products found).`;
        }
      }
    } catch (err: any) {
      result.shopify.message = `Shopify ping error: ${err.message}`;
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    status:
      result.supabase.connected && result.cloudinary.connected && result.shopify.connected
        ? 'all_connected'
        : 'partial_or_offline',
    ...result,
  });
}

