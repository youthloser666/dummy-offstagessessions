'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackAddToCart } from '@/lib/analytics';

export interface CartItem {
  id: string;
  variantId?: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CartState {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal?: number;
  lines: CartItem[];
}

export function useCart() {
  const [cart, setCart] = useState<CartState | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addingVariantId, setAddingVariantId] = useState<string | null>(null);
  const [updatingLineId, setUpdatingLineId] = useState<string | null>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);

  // Helper to normalize backend cart response into CartState
  const normalizeCart = (rawCart: any): CartState => ({
    id: rawCart.id,
    checkoutUrl: rawCart.checkoutUrl,
    totalQuantity: rawCart.totalQuantity,
    subtotal: rawCart.subtotal,
    lines: (rawCart.lines || []).map((l: any) => ({
      id: l.id,
      variantId: l.variantId,
      name: l.productTitle,
      size: l.title,
      price: l.price,
      quantity: l.quantity,
      image: l.image,
    })),
  });

  // Restore cart from localStorage on mount
  useEffect(() => {
    setIsClientMounted(true);
    const savedCartId = typeof window !== 'undefined' ? localStorage.getItem('offstage_cart_id') : null;
    if (savedCartId) {
      fetch(`/api/shopify/cart?cartId=${encodeURIComponent(savedCartId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.cart && data.cart.totalQuantity > 0) {
            setCart(normalizeCart(data.cart));
          }
        })
        .catch(() => {});
    }
  }, []);

  // Lock body scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback(
    async (
      variantId: string,
      product: { name: string; shopifyId: string; currency?: string; price: number }
    ) => {
      setAddingVariantId(variantId);
      try {
        const res = await fetch('/api/shopify/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartId: cart?.id || null,
            variantId,
            quantity: 1,
          }),
        });

        const data = await res.json();
        if (data.success && data.cart) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('offstage_cart_id', data.cart.id);
          }
          setCart(normalizeCart(data.cart));
          setIsCartOpen(true);

          // Analytics tracking
          trackAddToCart({
            content_name: product.name,
            content_ids: [product.shopifyId],
            content_type: 'product',
            value: product.price,
            currency: product.currency || 'USD',
          });
        } else {
          alert(data.error || 'Failed to add item to bag.');
        }
      } catch (err: any) {
        alert(err.message || 'Error communicating with Shopify.');
      } finally {
        setAddingVariantId(null);
      }
    },
    [cart?.id]
  );

  const updateQuantity = useCallback(
    async (lineId: string, newQuantity: number) => {
      if (!cart?.id || updatingLineId) return;
      setUpdatingLineId(lineId);

      try {
        const res = await fetch('/api/shopify/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartId: cart.id,
            lineId,
            quantity: newQuantity,
          }),
        });
        const data = await res.json();
        if (data.success && data.cart) {
          setCart(normalizeCart(data.cart));
        }
      } catch (err) {
        console.error('Failed to update quantity:', err);
      } finally {
        setUpdatingLineId(null);
      }
    },
    [cart?.id, updatingLineId]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart?.id || updatingLineId) return;
      setUpdatingLineId(lineId);

      try {
        const res = await fetch('/api/shopify/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartId: cart.id,
            lineId,
          }),
        });
        const data = await res.json();
        if (data.success && data.cart) {
          setCart(normalizeCart(data.cart));
        }
      } catch (err) {
        console.error('Failed to remove item:', err);
      } finally {
        setUpdatingLineId(null);
      }
    },
    [cart?.id, updatingLineId]
  );

  return {
    cart,
    isCartOpen,
    openCart,
    closeCart,
    setIsCartOpen,
    addingVariantId,
    updatingLineId,
    isClientMounted,
    addToCart,
    updateQuantity,
    removeItem,
  };
}

