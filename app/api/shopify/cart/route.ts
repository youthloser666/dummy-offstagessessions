import { NextRequest, NextResponse } from 'next/server';
import { createShopifyCart, addToShopifyCart } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { variantId, quantity = 1, cartId } = body;

        if (!variantId) {
            return NextResponse.json(
                { success: false, error: 'variantId is required' },
                { status: 400 }
            );
        }

        let result;
        if (cartId) {
            result = await addToShopifyCart(cartId, variantId, quantity);
        } else {
            result = await createShopifyCart(variantId, quantity);
        }

        return NextResponse.json({
            success: true,
            cart: result,
        });
    } catch (error: any) {
        console.error('Error in /api/shopify/cart:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to update Shopify cart',
            },
            { status: 500 }
        );
    }
}
