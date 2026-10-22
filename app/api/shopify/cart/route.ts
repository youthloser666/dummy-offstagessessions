import { NextRequest, NextResponse } from 'next/server';
import {
    createShopifyCart,
    addToShopifyCart,
    removeFromShopifyCart,
    updateShopifyCartLine,
    getShopifyCart,
} from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cartId = searchParams.get('cartId');

        if (!cartId) {
            return NextResponse.json(
                { success: false, error: 'cartId is required' },
                { status: 400 }
            );
        }

        const cart = await getShopifyCart(cartId);
        return NextResponse.json({
            success: true,
            cart,
        });
    } catch (error: any) {
        console.error('Error fetching Shopify cart:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch cart' },
            { status: 500 }
        );
    }
}

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
        console.error('Error in /api/shopify/cart POST:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to update Shopify cart',
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { cartId, lineId, quantity } = body;

        if (!cartId || !lineId || typeof quantity !== 'number') {
            return NextResponse.json(
                { success: false, error: 'cartId, lineId, and numeric quantity are required' },
                { status: 400 }
            );
        }

        let result;
        if (quantity <= 0) {
            result = await removeFromShopifyCart(cartId, [lineId]);
        } else {
            result = await updateShopifyCartLine(cartId, lineId, quantity);
        }

        return NextResponse.json({
            success: true,
            cart: result,
        });
    } catch (error: any) {
        console.error('Error in /api/shopify/cart PUT:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update item quantity' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { cartId, lineId } = body;

        if (!cartId || !lineId) {
            return NextResponse.json(
                { success: false, error: 'cartId and lineId are required' },
                { status: 400 }
            );
        }

        const result = await removeFromShopifyCart(cartId, [lineId]);

        return NextResponse.json({
            success: true,
            cart: result,
        });
    } catch (error: any) {
        console.error('Error in /api/shopify/cart DELETE:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to remove item from cart' },
            { status: 500 }
        );
    }
}
