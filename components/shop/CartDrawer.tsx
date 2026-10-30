'use client';

import React from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { CartState } from '@/hooks/useCart';
import { trackInitiateCheckout } from '@/lib/analytics';
import styles from '@/app/shop/shop.module.css';

interface CartDrawerProps {
  cart: CartState | null;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  updatingLineId: string | null;
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onRemoveItem: (lineId: string) => void;
  isMounted: boolean;
}

export default function CartDrawer({
  cart,
  isOpen,
  onClose,
  onOpen,
  updatingLineId,
  onUpdateQuantity,
  onRemoveItem,
  isMounted,
}: CartDrawerProps) {
  return (
    <>
      {/* Floating Bag Pill (Shown whenever cart has items) */}
      {cart && cart.totalQuantity > 0 && (
        <button
          className={styles.cartFloatBtn}
          onClick={onOpen}
          aria-label="View Shopping Bag"
        >
          <span className={styles.cartIconWrapper}>
            <svg
              className={styles.trolleyIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className={styles.cartCountBadgeResponsive}>{cart.totalQuantity}</span>
          </span>
          <span className={styles.cartCountBadgeDesktop}>{cart.totalQuantity}</span>
          <span className={styles.cartCheckoutText}>Checkout →</span>
        </button>
      )}

      {/* Cart Slide-Over Drawer mounted to body via Portal */}
      {isMounted && isOpen && cart && createPortal(
        <div className={styles.cartOverlay} onClick={onClose}>
          <div className={styles.cartDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cartHeader}>
              <div className={styles.cartTitleWrap}>
                <svg
                  className={styles.cartDrawerIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <h3 className={styles.cartTitle}>Your Bag ({cart.totalQuantity})</h3>
              </div>
              <button
                className={styles.cartCloseBtn}
                onClick={onClose}
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            <div className={styles.cartBody}>
              {cart.lines && cart.lines.length > 0 ? (
                cart.lines.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.cartItemImg}>
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className={styles.cartItemImgFallback} />
                      )}
                    </div>
                    <div className={styles.cartItemDetails}>
                      <div className={styles.cartItemMeta}>
                        <p className={styles.cartItemTitle}>{item.name}</p>
                        <p className={styles.cartItemVariant}>Size: {item.size}</p>
                      </div>
                      <div className={styles.cartItemBottom}>
                        <div className={styles.cartItemQtyControl}>
                          <button
                            className={styles.qtyBtn}
                            disabled={updatingLineId === item.id}
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button
                            className={styles.qtyBtn}
                            disabled={updatingLineId === item.id}
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <div className={styles.cartItemPriceAndRemove}>
                          <p className={styles.cartItemPrice}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            className={styles.cartItemRemoveBtn}
                            disabled={updatingLineId === item.id}
                            onClick={() => onRemoveItem(item.id)}
                            aria-label="Remove item"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.cartEmptyState}>
                  <p>Your bag is currently empty.</p>
                </div>
              )}
            </div>

            <div className={styles.cartFooter}>
              {cart.subtotal !== undefined && cart.subtotal > 0 && (
                <div className={styles.cartSubtotalRow}>
                  <span className={styles.cartSubtotalLabel}>Subtotal</span>
                  <span className={styles.cartSubtotalValue}>
                    ${cart.subtotal.toFixed(2)}
                  </span>
                </div>
              )}
              <p className={styles.checkoutNotice}>
                Secure checkout powered by Shopify. Taxes and shipping calculated at checkout.
              </p>
              <a
                href={cart.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.checkoutBtn}
                onClick={() => {
                  trackInitiateCheckout({
                    content_ids: cart.lines.map((l) => l.variantId || l.id),
                    num_items: cart.totalQuantity,
                    value: cart.subtotal || 0,
                    currency: 'USD',
                  });
                }}
              >
                Checkout on Shopify →
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

