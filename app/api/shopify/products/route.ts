import { NextResponse } from 'next/server';
import { getShopifyProducts } from '@/lib/shopify';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // revalidate every minute or cache control

export async function GET() {
    try {
        const products = await getShopifyProducts(50);
        return NextResponse.json({
            success: true,
            products,
        });
    } catch (error: any) {
        console.error('Error in /api/shopify/products:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch products from Shopify',
                products: [],
            },
            { status: 500 }
        );
    }
}
