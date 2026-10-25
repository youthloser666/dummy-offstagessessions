'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { trackAddToCart, trackInitiateCheckout, trackViewContent } from '@/lib/analytics';
import type { FormattedProduct, FormattedVariantItem } from '@/lib/shopify';
import styles from './product-detail.module.css';
import cartStyles from '../shop.module.css';

interface CartItem {
    id: string;
    variantId?: string;
    name: string;
    size: string;
    price: number;
    quantity: number;
    image: string;
}

interface CartState {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    subtotal?: number;
    lines: CartItem[];
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const rawId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';

    const [product, setProduct] = useState<FormattedProduct | null>(null);
    const [allProducts, setAllProducts] = useState<FormattedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Wishlist state
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Modals state
    const [isShippingOpen, setIsShippingOpen] = useState(false);
    const [isRestockOpen, setIsRestockOpen] = useState(false);
    const [restockVariant, setRestockVariant] = useState<FormattedVariantItem | null>(null);
    const [restockEmail, setRestockEmail] = useState('');
    const [restockSubmitted, setRestockSubmitted] = useState(false);

    const [isInquiryOpen, setIsInquiryOpen] = useState(false);
    const [inquiryName, setInquiryName] = useState('');
    const [inquiryEmail, setInquiryEmail] = useState('');
    const [inquiryMessage, setInquiryMessage] = useState('');
    const [inquirySubmitted, setInquirySubmitted] = useState(false);

    // Copy link toast
    const [copyToast, setCopyToast] = useState(false);

    // Cart state
    const [addingVariantId, setAddingVariantId] = useState<string | null>(null);
    const [updatingLineId, setUpdatingLineId] = useState<string | null>(null);
    const [cart, setCart] = useState<CartState | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isClientMounted, setIsClientMounted] = useState(false);

    // Fetch product details & catalog
    useEffect(() => {
        let isMounted = true;
        if (!rawId) return;

        async function fetchProductData() {
            setLoading(true);
            try {
                // Fetch target product
                const res = await fetch(`/api/shopify/products/${encodeURIComponent(rawId)}`);
                const data = await res.json();

                if (isMounted && data.success && data.product) {
                    setProduct(data.product);
                    setActiveImageIndex(0);

                    // Track analytics
                    trackViewContent({
                        content_name: data.product.name,
                        content_ids: [data.product.shopifyId],
                        content_type: 'product',
                        value: data.product.price,
                        currency: data.product.currency || 'USD',
                    });
                }

                // Fetch other products for related items
                const listRes = await fetch('/api/shopify/products');
                const listData = await listRes.json();
                if (isMounted && listData.success && Array.isArray(listData.products)) {
                    setAllProducts(listData.products);
                }
            } catch (err) {
                console.error('Failed to load product data:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchProductData();

        return () => {
            isMounted = false;
        };
    }, [rawId]);

    // Restore cart & wishlist on mount
    useEffect(() => {
        setIsClientMounted(true);

        const savedCartId = typeof window !== 'undefined' ? localStorage.getItem('offstage_cart_id') : null;
        if (savedCartId) {
            fetch(`/api/shopify/cart?cartId=${encodeURIComponent(savedCartId)}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.cart && data.cart.totalQuantity > 0) {
                        setCart({
                            id: data.cart.id,
                            checkoutUrl: data.cart.checkoutUrl,
                            totalQuantity: data.cart.totalQuantity,
                            subtotal: data.cart.subtotal,
                            lines: (data.cart.lines || []).map((l: any) => ({
                                id: l.id,
                                variantId: l.variantId,
                                name: l.productTitle,
                                size: l.title,
                                price: l.price,
                                quantity: l.quantity,
                                image: l.image,
                            })),
                        });
                    }
                })
                .catch(() => {});
        }

        // Check wishlist
        if (product && typeof window !== 'undefined') {
            try {
                const list = JSON.parse(localStorage.getItem('offstage_wishlist') || '[]');
                setIsWishlisted(list.includes(product.id) || list.includes(product.handle));
            } catch {
                setIsWishlisted(false);
            }
        }
    }, [product]);

    // Lock body scroll when cart or modal is open
    useEffect(() => {
        if (isCartOpen || isShippingOpen || isRestockOpen || isInquiryOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCartOpen, isShippingOpen, isRestockOpen, isInquiryOpen]);

    // Wishlist Toggle
    const handleToggleWishlist = () => {
        if (!product || typeof window === 'undefined') return;
        try {
            const key = 'offstage_wishlist';
            const raw = localStorage.getItem(key);
            let list: string[] = raw ? JSON.parse(raw) : [];
            const itemId = product.handle || product.id;

            if (list.includes(itemId)) {
                list = list.filter((id) => id !== itemId);
                setIsWishlisted(false);
            } else {
                list.push(itemId);
                setIsWishlisted(true);
            }
            localStorage.setItem(key, JSON.stringify(list));
        } catch (err) {
            console.error('Failed to update wishlist:', err);
        }
    };

    // Format currency
    const formatPrice = (price: number, currency = 'USD') => {
        if (currency === 'JPY') {
            return `¥${Math.round(price).toLocaleString('ja-JP')}`;
        }
        if (currency === 'IDR') {
            return `Rp ${Math.round(price).toLocaleString('id-ID')}`;
        }
        return `$${price.toFixed(2)}`;
    };

    // Add to cart handler
    const handleAddToCart = async (variant: FormattedVariantItem) => {
        if (addingVariantId) return;
        setAddingVariantId(variant.id);

        try {
            const endpoint = '/api/shopify/cart';
            let res;

            if (cart?.id) {
                res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cartId: cart.id,
                        variantId: variant.id,
                        quantity: 1,
                    }),
                });
            } else {
                res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        variantId: variant.id,
                        quantity: 1,
                    }),
                });
            }

            const data = await res.json();
            if (data.success && data.cart) {
                const updatedCart: CartState = {
                    id: data.cart.id,
                    checkoutUrl: data.cart.checkoutUrl,
                    totalQuantity: data.cart.totalQuantity,
                    subtotal: data.cart.subtotal,
                    lines: (data.cart.lines || []).map((l: any) => ({
                        id: l.id,
                        variantId: l.variantId,
                        name: l.productTitle,
                        size: l.title,
                        price: l.price,
                        quantity: l.quantity,
                        image: l.image,
                    })),
                };

                setCart(updatedCart);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('offstage_cart_id', data.cart.id);
                }

                trackAddToCart({
                    content_name: product?.name || 'Product',
                    content_ids: [variant.id],
                    content_type: 'product',
                    value: variant.price,
                    currency: variant.currency || 'USD',
                });

                setIsCartOpen(true);
            }
        } catch (err) {
            console.error('Failed to add to cart:', err);
        } finally {
            setAddingVariantId(null);
        }
    };

    // Cart Line Quantity Update
    const handleUpdateQuantity = async (lineId: string, newQuantity: number) => {
        if (!cart?.id || updatingLineId) return;
        setUpdatingLineId(lineId);

        try {
            let res;
            if (newQuantity <= 0) {
                res = await fetch('/api/shopify/cart', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartId: cart.id, lineId }),
                });
            } else {
                res = await fetch('/api/shopify/cart', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartId: cart.id, lineId, quantity: newQuantity }),
                });
            }

            const data = await res.json();
            if (data.success && data.cart) {
                setCart({
                    id: data.cart.id,
                    checkoutUrl: data.cart.checkoutUrl,
                    totalQuantity: data.cart.totalQuantity,
                    subtotal: data.cart.subtotal,
                    lines: (data.cart.lines || []).map((l: any) => ({
                        id: l.id,
                        variantId: l.variantId,
                        name: l.productTitle,
                        size: l.title,
                        price: l.price,
                        quantity: l.quantity,
                        image: l.image,
                    })),
                });
            }
        } catch (err) {
            console.error('Failed to update quantity:', err);
        } finally {
            setUpdatingLineId(null);
        }
    };

    // Remove cart item
    const handleRemoveItem = async (lineId: string) => {
        if (!cart?.id || updatingLineId) return;
        setUpdatingLineId(lineId);

        try {
            const res = await fetch('/api/shopify/cart', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartId: cart.id, lineId }),
            });
            const data = await res.json();
            if (data.success && data.cart) {
                setCart({
                    id: data.cart.id,
                    checkoutUrl: data.cart.checkoutUrl,
                    totalQuantity: data.cart.totalQuantity,
                    subtotal: data.cart.subtotal,
                    lines: (data.cart.lines || []).map((l: any) => ({
                        id: l.id,
                        variantId: l.variantId,
                        name: l.productTitle,
                        size: l.title,
                        price: l.price,
                        quantity: l.quantity,
                        image: l.image,
                    })),
                });
            }
        } catch (err) {
            console.error('Failed to remove item:', err);
        } finally {
            setUpdatingLineId(null);
        }
    };

    // Social Sharing
    const handleShareTwitter = () => {
        if (!product || typeof window === 'undefined') return;
        const url = window.location.href;
        const text = `${product.name} | OFFSTAGE SESSIONS`;
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            '_blank',
            'width=600,height=440'
        );
    };

    const handleShareFacebook = () => {
        if (typeof window === 'undefined') return;
        const url = window.location.href;
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            '_blank',
            'width=600,height=480'
        );
    };

    const handleSharePinterest = () => {
        if (!product || typeof window === 'undefined') return;
        const url = window.location.href;
        const media = product.images?.[0] || product.image;
        window.open(
            `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(product.name)}`,
            '_blank',
            'width=750,height=520'
        );
    };

    const handleCopyLink = () => {
        if (typeof window === 'undefined') return;
        navigator.clipboard.writeText(window.location.href);
        setCopyToast(true);
        setTimeout(() => setCopyToast(false), 2400);
    };

    // Filter related items (exclude current product)
    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return allProducts
            .filter((p) => p.id !== product.id && p.handle !== product.handle)
            .slice(0, 6);
    }, [allProducts, product]);

    // Product gallery images
    const galleryImages = useMemo(() => {
        if (!product) return [];
        if (product.images && product.images.length > 0) {
            return product.images;
        }
        return [product.image];
    }, [product]);

    const activeImage = galleryImages[activeImageIndex] || product?.image || '';

    // Status Badge check
    const isSoldOut = product?.badge === 'Sold Out' || !product?.availableForSale;

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.detailContainer}>
                    {/* Breadcrumb Skeleton */}
                    <div className={styles.skeletonBox} style={{ height: 16, width: '28%', marginBottom: 32 }} />

                    {/* Main Product Layout Skeleton */}
                    <div className={styles.productMain}>
                        {/* Image Skeleton */}
                        <div className={styles.skeletonBox} style={{ aspectRatio: '1/1', width: '100%' }} />

                        {/* Details Skeleton */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {/* Title */}
                            <div className={styles.skeletonBox} style={{ height: 38, width: '75%' }} />
                            {/* Price */}
                            <div className={styles.skeletonBox} style={{ height: 28, width: '32%' }} />
                            {/* Variants List Rows */}
                            <div className={styles.skeletonBox} style={{ height: 48, width: '100%', marginTop: 8 }} />
                            <div className={styles.skeletonBox} style={{ height: 48, width: '100%' }} />
                            {/* Description block */}
                            <div className={styles.skeletonBox} style={{ height: 80, width: '100%', marginTop: 12 }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.detailContainer} style={{ textAlign: 'center', padding: '90px 20px' }}>
                    <h2 style={{ fontFamily: 'HelveticaCustom, sans-serif', fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: 12 }}>
                        Product Not Found
                    </h2>
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.85rem', color: '#888', marginBottom: 28 }}>
                        The requested item could not be found or has been discontinued.
                    </p>
                    <Link href="/shop" className={styles.backBtn}>
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.detailContainer}>
                {/* Breadcrumb Header */}
                <div role="navigation" aria-label="Breadcrumb" className={styles.breadcrumb}>
                    <Link href="/shop" className={styles.breadcrumbLink}>
                        SHOP
                    </Link>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span className={styles.breadcrumbCurrent}>
                        {product.name.toUpperCase()}
                    </span>
                </div>

                {/* Main 2-Column Product Section */}
                <div className={styles.productMain}>
                    {/* Left Column: Gallery */}
                    <div className={styles.gallerySection}>
                        <div className={styles.mainImageFrame}>
                            {product.badge && (
                                <span
                                    className={`${styles.productBadge} ${
                                        isSoldOut
                                            ? styles.badgeSoldOut
                                            : product.badge === 'Limited'
                                            ? styles.badgeLimited
                                            : ''
                                    }`}
                                >
                                    {product.badge}
                                </span>
                            )}
                            {activeImage && (
                                <Image
                                    src={activeImage}
                                    alt={product.name}
                                    width={700}
                                    height={700}
                                    priority
                                    className={styles.mainImage}
                                />
                            )}
                        </div>

                        {/* Thumbnail Row */}
                        {galleryImages.length > 1 && (
                            <div className={styles.thumbnailRow}>
                                {galleryImages.map((imgUrl, idx) => {
                                    const isActive = idx === activeImageIndex;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            className={`${styles.thumbnailBtn} ${isActive ? styles.thumbnailActive : ''}`}
                                            onClick={() => setActiveImageIndex(idx)}
                                            aria-label={`View photo ${idx + 1}`}
                                        >
                                            <Image
                                                src={imgUrl}
                                                alt={`${product.name} view ${idx + 1}`}
                                                fill
                                                className={styles.thumbnailImg}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Information & Actions */}
                    <div className={styles.infoSection}>
                        <h1 className={styles.productTitle}>{product.name}</h1>

                        {/* Price Block - Hidden if Sold Out */}
                        {!isSoldOut && (
                            <div className={styles.priceBlock}>
                                <span className={styles.priceText}>
                                    {formatPrice(product.price, product.currency)}
                                </span>
                                <span className={styles.taxNote}>(Tax Included)</span>
                            </div>
                        )}

                        {/* Shipping link - Hidden if Sold Out */}
                        {!isSoldOut && (
                            <button
                                type="button"
                                className={styles.shippingInfoTrigger}
                                onClick={() => setIsShippingOpen(true)}
                            >
                                <span>ⓘ</span>
                                <span>Shipping & Delivery Info</span>
                            </button>
                        )}

                        {/* Variants List / Size rows */}
                        <div className={styles.variantsList}>
                            {product.variantsList && product.variantsList.length > 0 ? (
                                product.variantsList.map((variant) => {
                                    const isAvailable = variant.available && !isSoldOut;
                                    const isAdding = addingVariantId === variant.id;

                                    return (
                                        <div key={variant.id} className={styles.variantRow}>
                                            <div className={styles.variantMeta}>
                                                {isAvailable ? (
                                                    <>
                                                        <span className={styles.variantTitle}>{variant.title}</span>
                                                        <span className={styles.variantPrice}>
                                                            {formatPrice(variant.price, variant.currency)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className={styles.soldOutLabel}>
                                                        {product.variantsList.length > 1 && variant.title !== 'One Size'
                                                            ? `${variant.title} — SOLD OUT`
                                                            : 'SOLD OUT'}
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                {isAvailable && (
                                                    <button
                                                        type="button"
                                                        className={styles.btnAddToCart}
                                                        disabled={isAdding}
                                                        onClick={() => handleAddToCart(variant)}
                                                    >
                                                        {isAdding ? (
                                                            <span className={styles.spinner} />
                                                        ) : (
                                                            <>
                                                                <svg
                                                                    width="14"
                                                                    height="14"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2.2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <circle cx="9" cy="21" r="1" />
                                                                    <circle cx="20" cy="21" r="1" />
                                                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                                                </svg>
                                                                <span>Add to Bag</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className={styles.variantRow}>
                                    <div className={styles.variantMeta}>
                                        {isSoldOut ? (
                                            <span className={styles.soldOutLabel}>SOLD OUT</span>
                                        ) : (
                                            <>
                                                <span className={styles.variantTitle}>Standard Edition</span>
                                                <span className={styles.variantPrice}>
                                                    {formatPrice(product.price, product.currency)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {!isSoldOut && (
                                        <button
                                            type="button"
                                            className={styles.btnAddToCart}
                                            disabled={addingVariantId === product.defaultVariantId}
                                            onClick={() =>
                                                handleAddToCart({
                                                    id: product.defaultVariantId,
                                                    title: 'One Size',
                                                    price: product.price,
                                                    currency: product.currency,
                                                    available: true,
                                                })
                                            }
                                        >
                                            Add to Bag
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Description & Specifications (directly from Shopify) */}
                        <div className={styles.descriptionSection}>
                            {product.descriptionHtml ? (
                                <div
                                    className={styles.descriptionText}
                                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                                />
                            ) : product.description ? (
                                <p className={styles.descriptionText}>{product.description}</p>
                            ) : null}

                            <div className={styles.specsList}>
                                <div>
                                    <strong>Item :</strong> {product.name}
                                </div>
                                {product.category && (
                                    <div>
                                        <strong>Category :</strong> {product.category}
                                    </div>
                                )}
                                {product.sizes && product.sizes.length > 0 && (
                                    <div>
                                        <strong>Sizes :</strong> {product.sizes.join(', ')}
                                    </div>
                                )}
                                <div>
                                    <strong>Material :</strong> {product.material || '100% Premium Cotton / Heavyweight'}
                                </div>
                                <div>
                                    <strong>Collection :</strong> {product.collection || 'Official Offstage Sessions Drops'}
                                </div>
                            </div>
                        </div>

                        {/* Social Share Buttons */}
                        <div className={styles.socialShareRow}>
                            <button
                                type="button"
                                className={styles.socialBtn}
                                onClick={handleShareTwitter}
                                aria-label="Share on X"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                <span>Share on X</span>
                            </button>

                            <button
                                type="button"
                                className={styles.socialBtn}
                                onClick={handleShareFacebook}
                                aria-label="Share on Facebook"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span>Share on Facebook</span>
                            </button>

                            <button
                                type="button"
                                className={styles.socialBtn}
                                onClick={handleSharePinterest}
                                aria-label="Share on Pinterest"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.211-.174.256-.402.154-1.498-.697-2.435-2.887-2.435-4.647 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                                </svg>
                                <span>Share on Pinterest</span>
                            </button>

                            <button
                                type="button"
                                className={styles.socialBtn}
                                onClick={handleCopyLink}
                                aria-label="Copy Link"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                                <span>{copyToast ? 'Link Copied!' : 'Copy Link'}</span>
                            </button>
                        </div>

                        {/* Product Inquiry Button */}
                        <button
                            type="button"
                            className={styles.inquiryBtn}
                            onClick={() => {
                                setInquirySubmitted(false);
                                setIsInquiryOpen(true);
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <span>Inquire About This Item</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Separated Other Items Section (No tick divider line) */}
            {relatedProducts.length > 0 ? (
                <div className={styles.otherItemsContainer}>
                    <h2 className={styles.otherItemsTitle}>Other Items</h2>
                    <div className={styles.otherGrid}>
                        {relatedProducts.map((item) => (
                            <Link
                                key={item.id}
                                href={`/shop/${item.handle || item.id}`}
                                className={styles.otherCard}
                            >
                                <div className={styles.otherCardImgWrap}>
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className={styles.otherCardImg}
                                    />
                                </div>
                                <div className={styles.otherCardInfo}>
                                    <h3 className={styles.otherCardTitle}>{item.name}</h3>
                                    <span className={styles.otherCardPrice}>
                                        {formatPrice(item.price, item.currency)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Return Button */}
                    <div className={styles.backButtonWrap}>
                        <Link href="/shop" className={styles.backBtn}>
                            Back to Shop
                        </Link>
                    </div>
                </div>
            ) : (
                <div className={styles.backButtonWrap} style={{ marginTop: '36px' }}>
                    <Link href="/shop" className={styles.backBtn}>
                        Back to Shop
                    </Link>
                </div>
            )}

            {/* ============================================
               MODAL: SHIPPING INFO
               ============================================ */}
            {isShippingOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsShippingOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Shipping & Delivery Information</h3>
                            <button
                                type="button"
                                className={styles.modalCloseBtn}
                                onClick={() => setIsShippingOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <p style={{ marginBottom: 14 }}>
                                <strong>■ Order Processing & Dispatch</strong>
                                <br />
                                All orders are processed and prepared within 2 to 5 business days. Once your package has been handed over to the courier, an automated email with tracking details will be dispatched immediately.
                            </p>
                            <p style={{ marginBottom: 14 }}>
                                <strong>■ Domestic Shipping (US)</strong>
                                <br />
                                Standard nationwide shipping: Flat rate $5.00.
                                <br />
                                Free shipping is automatically applied to orders over $100.
                            </p>
                            <p style={{ marginBottom: 0 }}>
                                <strong>■ International Shipping</strong>
                                <br />
                                Worldwide delivery available via DHL Express & FedEx. International shipping rates, duties, and estimated transit times are calculated at checkout.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================
               MODAL: RESTOCK NOTIFICATION
               ============================================ */}
            {isRestockOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsRestockOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Restock Notification</h3>
                            <button
                                type="button"
                                className={styles.modalCloseBtn}
                                onClick={() => setIsRestockOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <p style={{ marginBottom: 14 }}>
                                <strong>{product.name}</strong>
                                {restockVariant && (
                                    <span> — Size: {restockVariant.title}</span>
                                )}
                                <br />
                                Enter your email below to receive an instant alert when this item is restocked.
                            </p>

                            {restockSubmitted ? (
                                <div style={{ background: 'rgba(0, 255, 0, 0.1)', border: '1px solid var(--acid, #00FF00)', color: '#ffffff', padding: 14, borderRadius: 3, textAlign: 'center' }}>
                                    ✓ You&apos;re on the list! We&apos;ll notify you as soon as this item is back in stock.
                                </div>
                            ) : (
                                <form
                                    className={styles.modalForm}
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (restockEmail) setRestockSubmitted(true);
                                    }}
                                >
                                    <input
                                        type="email"
                                        required
                                        placeholder="your.email@example.com"
                                        className={styles.modalInput}
                                        value={restockEmail}
                                        onChange={(e) => setRestockEmail(e.target.value)}
                                    />
                                    <button type="submit" className={styles.modalSubmitBtn}>
                                        Notify Me
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================
               MODAL: PRODUCT INQUIRY
               ============================================ */}
            {isInquiryOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsInquiryOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Item Inquiry</h3>
                            <button
                                type="button"
                                className={styles.modalCloseBtn}
                                onClick={() => setIsInquiryOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <p style={{ marginBottom: 14 }}>
                                Have a question about <strong>{product.name}</strong>? Drop us a note below and our team will get back to you shortly.
                            </p>

                            {inquirySubmitted ? (
                                <div style={{ background: 'rgba(0, 255, 0, 0.1)', border: '1px solid var(--acid, #00FF00)', color: '#ffffff', padding: 14, borderRadius: 3, textAlign: 'center' }}>
                                    ✓ Thank you! Your inquiry has been received. Our team will get back to you shortly.
                                </div>
                            ) : (
                                <form
                                    className={styles.modalForm}
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (inquiryEmail && inquiryMessage) setInquirySubmitted(true);
                                    }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className={styles.modalInput}
                                        value={inquiryName}
                                        onChange={(e) => setInquiryName(e.target.value)}
                                    />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Email Address"
                                        className={styles.modalInput}
                                        value={inquiryEmail}
                                        onChange={(e) => setInquiryEmail(e.target.value)}
                                    />
                                    <textarea
                                        required
                                        placeholder="Your Message..."
                                        className={styles.modalTextarea}
                                        value={inquiryMessage}
                                        onChange={(e) => setInquiryMessage(e.target.value)}
                                    />
                                    <button type="submit" className={styles.modalSubmitBtn}>
                                        Send Inquiry
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Bag Pill */}
            {cart && cart.totalQuantity > 0 && (
                <button
                    className={cartStyles.cartFloatBtn}
                    onClick={() => setIsCartOpen(true)}
                    aria-label="View Shopping Bag"
                >
                    <span className={cartStyles.cartIconWrapper}>
                        <svg
                            className={cartStyles.trolleyIcon}
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
                        <span className={cartStyles.cartCountBadgeResponsive}>{cart.totalQuantity}</span>
                    </span>
                    <span className={cartStyles.cartCountBadgeDesktop}>{cart.totalQuantity}</span>
                    <span className={cartStyles.cartCheckoutText}>Checkout →</span>
                </button>
            )}

            {/* Cart Slide-Over Drawer mounted to body via Portal */}
            {isClientMounted && isCartOpen && cart && createPortal(
                <div className={cartStyles.cartOverlay} onClick={() => setIsCartOpen(false)}>
                    <div className={cartStyles.cartDrawer} onClick={(e) => e.stopPropagation()}>
                        <div className={cartStyles.cartHeader}>
                            <div className={cartStyles.cartTitleWrap}>
                                <svg
                                    className={cartStyles.cartDrawerIcon}
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
                                <h3 className={cartStyles.cartTitle}>Your Bag ({cart.totalQuantity})</h3>
                            </div>
                            <button
                                className={cartStyles.cartCloseBtn}
                                onClick={() => setIsCartOpen(false)}
                                aria-label="Close cart"
                            >
                                ✕
                            </button>
                        </div>

                        <div className={cartStyles.cartBody}>
                            {cart.lines && cart.lines.length > 0 ? (
                                cart.lines.map((item) => (
                                    <div key={item.id} className={cartStyles.cartItem}>
                                        <div className={cartStyles.cartItemImg}>
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className={cartStyles.cartItemImgFallback} />
                                            )}
                                        </div>
                                        <div className={cartStyles.cartItemDetails}>
                                            <div className={cartStyles.cartItemMeta}>
                                                <p className={cartStyles.cartItemTitle}>{item.name}</p>
                                                <p className={cartStyles.cartItemVariant}>Size: {item.size}</p>
                                            </div>
                                            <div className={cartStyles.cartItemBottom}>
                                                <div className={cartStyles.cartItemQtyControl}>
                                                    <button
                                                        className={cartStyles.qtyBtn}
                                                        disabled={updatingLineId === item.id}
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        -
                                                    </button>
                                                    <span className={cartStyles.qtyValue}>{item.quantity}</span>
                                                    <button
                                                        className={cartStyles.qtyBtn}
                                                        disabled={updatingLineId === item.id}
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        aria-label="Increase quantity"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className={cartStyles.cartItemPriceAndRemove}>
                                                    <p className={cartStyles.cartItemPrice}>
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                    <button
                                                        className={cartStyles.cartItemRemoveBtn}
                                                        disabled={updatingLineId === item.id}
                                                        onClick={() => handleRemoveItem(item.id)}
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
                                <div className={cartStyles.cartEmptyState}>
                                    <p>Your bag is currently empty.</p>
                                </div>
                            )}
                        </div>

                        <div className={cartStyles.cartFooter}>
                            {cart.subtotal !== undefined && cart.subtotal > 0 && (
                                <div className={cartStyles.cartSubtotalRow}>
                                    <span className={cartStyles.cartSubtotalLabel}>Subtotal</span>
                                    <span className={cartStyles.cartSubtotalValue}>
                                        ${cart.subtotal.toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <p className={cartStyles.checkoutNotice}>
                                Secure checkout powered by Shopify. Taxes and shipping calculated at checkout.
                            </p>
                            <a
                                href={cart.checkoutUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cartStyles.checkoutBtn}
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
        </div>
    );
}
