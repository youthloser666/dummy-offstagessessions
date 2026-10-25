import { NextRequest, NextResponse } from 'next/server';
import { getShopifyProduct } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ handle: string }> }
) {
    try {
        const { handle } = await context.params;
        if (!handle) {
            return NextResponse.json(
                { success: false, error: 'Product identifier is required' },
                { status: 400 }
            );
        }

        const product = await getShopifyProduct(handle);
        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            product,
        });
    } catch (error: any) {
        console.error('Error in /api/shopify/products/[handle]:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch product',
            },
            { status: 500 }
        );
    }
}
