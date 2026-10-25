'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useReveal } from '@/hooks/useReveal';
import { trackAddToCart, trackInitiateCheckout, trackViewContent } from '@/lib/analytics';
import styles from './shop.module.css';

const PRODUCTS_PER_PAGE = 8;

interface StoreProduct {
    id: string;
    shopifyId: string;
    handle?: string;
    name: string;
    price: number;
    currency: string;
    image: string;
    hoverImage?: string;
    category: string;
    sizes: string[];
    variantMap: {
        [key: string]: {
            id: string;
            title: string;
            price: number;
            available: boolean;
        };
    };
    badge?: string;
}

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

export default function ShopPage() {
    const router = useRouter();
    const [allProducts, setAllProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [banners, setBanners] = useState<any[]>([]);
    const [bannersLoading, setBannersLoading] = useState(true);
    const [isGlitching, setIsGlitching] = useState(false);
    const isGlitchingRef = useRef(false);

    // Cart state
    const [addingVariantId, setAddingVariantId] = useState<string | null>(null);
    const [updatingLineId, setUpdatingLineId] = useState<string | null>(null);
    const [cart, setCart] = useState<CartState | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isClientMounted, setIsClientMounted] = useState(false);

    // Fetch real Shopify products and custom Shop Banners
    useEffect(() => {
        let isMounted = true;

        async function fetchBanners() {
            try {
                const res = await fetch('/api/shop-banners');
                const data = await res.json();
                if (isMounted && data.success && Array.isArray(data.data)) {
                    const active = data.data.filter((b: any) => b.active !== false);
                    if (active.length > 0) {
                        setBanners(active);
                    }
                }
            } catch (err) {
                console.warn('Failed to load shop banners:', err);
            } finally {
                if (isMounted) setBannersLoading(false);
            }
        }

        fetchBanners();

        async function fetchShopify() {
            setLoading(true);
            try {
                const res = await fetch('/api/shopify/products');
                const data = await res.json();

                if (isMounted && data.success && Array.isArray(data.products)) {
                    const liveProducts: StoreProduct[] = data.products.map((p: any) => ({
                        id: p.id,
                        shopifyId: p.shopifyId,
                        handle: p.handle || p.id,
                        name: p.name,
                        price: p.price,
                        currency: p.currency || 'USD',
                        image: p.image,
                        hoverImage: p.hoverImage,
                        category: p.category || 'Apparel',
                        sizes: p.sizes || [],
                        variantMap: p.variantMap || {},
                        badge: p.badge, // Only real badges: 'Sold Out', 'Limited', 'New'
                    }));

                    setAllProducts(liveProducts);
                }
            } catch (err) {
                console.error('Failed to load Shopify products:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchShopify();

        return () => {
            isMounted = false;
        };
    }, []);

    useReveal([currentPage, sortBy, allProducts, loading]);

    // Restore cart from localStorage on mount & track mounting
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

    // Responsive device detection for Shop Banner Carousel
    const [isMobileScreen, setIsMobileScreen] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobileScreen(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Filter banners strictly by device type (Desktop vs Mobile)
    const activeBanners = useMemo(() => {
        if (!banners || banners.length === 0) return [];

        const desktopList = banners.filter(b => Boolean(b.image_url && b.image_url.trim()));
        const mobileList = banners.filter(b => Boolean(b.mobile_image_url && b.mobile_image_url.trim()));

        if (isMobileScreen) {
            // On mobile: strictly use mobile banners; fallback to desktop only if zero mobile banners exist
            return mobileList.length > 0 ? mobileList : desktopList;
        } else {
            // On desktop: strictly use desktop banners; fallback to mobile only if zero desktop banners exist
            return desktopList.length > 0 ? desktopList : mobileList;
        }
    }, [banners, isMobileScreen]);

    // Hero carousel interval based on device-specific banners only (product photos never used as banners)
    const activeSlideCount = activeBanners.length;

    // Reset current slide if count changes (e.g. on window resize)
    useEffect(() => {
        if (currentHeroIndex >= activeSlideCount && activeSlideCount > 0) {
            setCurrentHeroIndex(0);
        }
    }, [activeSlideCount, currentHeroIndex]);

    const goToHeroSlide = (targetIdx: number) => {
        if (isGlitchingRef.current || targetIdx === currentHeroIndex) return;
        isGlitchingRef.current = true;
        setIsGlitching(true);

        // Mid-glitch burst (160ms), switch the active slide
        setTimeout(() => {
            setCurrentHeroIndex(targetIdx);
        }, 160);

        // Reset glitch state
        setTimeout(() => {
            setIsGlitching(false);
            isGlitchingRef.current = false;
        }, 360);
    };

    useEffect(() => {
        if (activeSlideCount <= 1) {
            setCurrentHeroIndex(0);
            return;
        }

        const interval = setInterval(() => {
            const nextIdx = (currentHeroIndex + 1) % activeSlideCount;
            goToHeroSlide(nextIdx);
        }, 4800);

        return () => clearInterval(interval);
    }, [activeSlideCount, currentHeroIndex]);

    const sortedProducts = useMemo(() => {
        let sorted = [...allProducts];

        switch (sortBy) {
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            default:
                break;
        }

        return sorted;
    }, [allProducts, sortBy]);

    const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = sortedProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    const handleQuickAdd = async (product: StoreProduct, size: string) => {
        if (product.badge === 'Sold Out') return;

        const variant = product.variantMap[size] || Object.values(product.variantMap)[0];
        if (!variant) return;

        if (!variant.available) {
            alert(`The variant "${size}" of "${product.name}" is currently sold out.`);
            return;
        }

        setAddingVariantId(variant.id);

        try {
            const res = await fetch('/api/shopify/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variantId: variant.id,
                    quantity: 1,
                    cartId: cart?.id,
                }),
            });

            const data = await res.json();
            if (data.success && data.cart) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('offstage_cart_id', data.cart.id);
                }
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
                setIsCartOpen(true);

                // Fire Meta Pixel AddToCart + GA4 add_to_cart
                trackAddToCart({
                    content_name: product.name,
                    content_ids: [product.shopifyId],
                    content_type: 'product',
                    value: variant.price,
                    currency: product.currency || 'USD',
                });
            } else {
                alert(data.error || 'Failed to add item to cart.');
            }
        } catch (err: any) {
            alert(err.message || 'Error communicating with Shopify.');
        } finally {
            setAddingVariantId(null);
        }
    };

    const handleUpdateQuantity = async (lineId: string, newQuantity: number) => {
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
            console.error('Failed to update item quantity:', err);
        } finally {
            setUpdatingLineId(null);
        }
    };

    const handleRemoveItem = async (lineId: string) => {
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

    return (
        <div className="bg-transparent" style={{ background: 'transparent' }}>
            {/* Full-Width Hero Image Banner (Bleeding under transparent navbar on desktop & mobile) */}
            <div className={`${styles.heroBanner} relative ${isGlitching ? styles.stageGlitching : ''}`}>
                {activeBanners.length > 0 ? (
                    activeBanners.map((item, idx) => {
                        const isCurrent = idx === currentHeroIndex;
                        const showTitleAndCat = !item.hide_title && Boolean(item.title || item.category);
                        const showPrice = !item.hide_price && Boolean(item.price);
                        const showButton = !item.hide_button && Boolean(item.link_url && item.button_text);
                        const hasAnyOverlay = showTitleAndCat || showPrice || showButton;

                        const desktopImg = item.image_url?.trim() || '';
                        const mobileImg = item.mobile_image_url?.trim() || '';
                        const hasBoth = Boolean(desktopImg && mobileImg);
                        const primaryImg = (isMobileScreen ? mobileImg : desktopImg) || desktopImg || mobileImg;

                        if (!primaryImg) return null;

                        return (
                            <div
                                key={item.id}
                                className={`${styles.heroSlide} ${isCurrent ? styles.activeSlide : ''}`}
                            >
                                {/* Ambient Blur backdrop to softly blend letterbox on various aspect ratios */}
                                <div className={styles.heroImgBlurWrap}>
                                    {hasBoth ? (
                                        <>
                                            <Image
                                                src={desktopImg}
                                                alt=""
                                                fill
                                                className={`${styles.heroImgBlur} ${styles.heroDesktopOnly}`}
                                                priority={idx === 0}
                                            />
                                            <Image
                                                src={mobileImg}
                                                alt=""
                                                fill
                                                className={`${styles.heroImgBlur} ${styles.heroMobileOnly}`}
                                                priority={idx === 0}
                                            />
                                        </>
                                    ) : (
                                        <Image
                                            src={primaryImg}
                                            alt=""
                                            fill
                                            className={styles.heroImgBlur}
                                            priority={idx === 0}
                                        />
                                    )}
                                </div>

                                {/* Main Hero Banner Image (Desktop vs Mobile Responsive) */}
                                {hasBoth ? (
                                    <>
                                        <Image
                                            src={desktopImg}
                                            alt={item.title || 'Shop Hero Banner (Desktop)'}
                                            fill
                                            className={`${styles.heroImg} ${styles.heroDesktopOnly}`}
                                            priority={idx === 0}
                                        />
                                        <Image
                                            src={mobileImg}
                                            alt={item.title || 'Shop Hero Banner (Mobile)'}
                                            fill
                                            className={`${styles.heroImg} ${styles.heroMobileOnly}`}
                                            priority={idx === 0}
                                        />
                                    </>
                                ) : (
                                    <Image
                                        src={primaryImg}
                                        alt={item.title || 'Shop Hero Banner'}
                                        fill
                                        className={styles.heroImg}
                                        priority={idx === 0}
                                    />
                                )}

                                {/* Glitch Slice Layers (Red / Cyan chromatic channels) */}
                                {hasBoth ? (
                                    <>
                                        <Image
                                            src={desktopImg}
                                            alt=""
                                            fill
                                            aria-hidden="true"
                                            className={`${styles.sliceA} ${styles.heroDesktopOnly}`}
                                        />
                                        <Image
                                            src={mobileImg}
                                            alt=""
                                            fill
                                            aria-hidden="true"
                                            className={`${styles.sliceA} ${styles.heroMobileOnly}`}
                                        />
                                        <Image
                                            src={desktopImg}
                                            alt=""
                                            fill
                                            aria-hidden="true"
                                            className={`${styles.sliceB} ${styles.heroDesktopOnly}`}
                                        />
                                        <Image
                                            src={mobileImg}
                                            alt=""
                                            fill
                                            aria-hidden="true"
                                            className={`${styles.sliceB} ${styles.heroMobileOnly}`}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Image
                                            src={primaryImg}
                                            alt=""
                                            fill
                                            aria-hidden="true"
                                            className={styles.sliceA}
                                        />
                                        <Image
                                            src={primaryImg}
                                            alt=""
                                            fill
                                            aria-hidden="true"
                                            className={styles.sliceB}
                                        />
                                    </>
                                )}

                                {/* Clickable banner link when CTA button is hidden/removed */}
                                {item.link_url && (!showButton || !hasAnyOverlay) && (
                                    <a
                                        href={item.link_url}
                                        className={styles.heroSlideLink}
                                        aria-label={item.title || 'Shop Banner Slide'}
                                        onClick={(e) => {
                                            if (item.link_url?.startsWith('#')) {
                                                e.preventDefault();
                                                document.querySelector(item.link_url)?.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}
                                    />
                                )}

                                {/* Gradient Overlay only rendered if there is text overlay to display */}
                                {hasAnyOverlay && <div className={styles.heroOverlay} />}

                                {/* Info Card (Title, Category, Price, CTA Button) */}
                                {hasAnyOverlay && (
                                    <div className={styles.heroInfo}>
                                        {showTitleAndCat && (
                                            <>
                                                {item.category && <span className={styles.heroCategory}>{item.category}</span>}
                                                {item.title && <h2 className={styles.heroTitle}>{item.title}</h2>}
                                            </>
                                        )}
                                        {showPrice && (
                                            <span className={styles.heroPrice}>
                                                {item.price}
                                            </span>
                                        )}
                                        {showButton && (
                                            <a
                                                href={item.link_url}
                                                className={styles.heroCtaBtn}
                                                onClick={(e) => {
                                                    if (item.link_url?.startsWith('#')) {
                                                        e.preventDefault();
                                                        document.querySelector(item.link_url)?.scrollIntoView({ behavior: 'smooth' });
                                                    }
                                                }}
                                            >
                                                <span>{item.button_text || 'SHOP NOW'}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                    <polyline points="12 5 19 12 12 19" />
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : bannersLoading ? (
                    /* Subtle dark shimmer while shop banners load */
                    <div className={`${styles.heroSlide} ${styles.activeSlide}`}>
                        <div className={styles.heroBannerSkeleton} />
                    </div>
                ) : (
                    /* Brand hero banner fallback when store banners list is empty */
                    <div className={`${styles.heroSlide} ${styles.activeSlide}`}>
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: 'radial-gradient(circle at center, #1a1a1a 0%, #080808 100%)',
                            }}
                        />
                        <div className={styles.heroOverlay} />
                        <div className={styles.heroInfo}>
                            <span className={styles.heroCategory}>Official Merchandise</span>
                            <h2 className={styles.heroTitle}>Offstage Store</h2>
                        </div>
                    </div>
                )}

                {/* Top Vignette for clean Navbar bleeding overlay */}
                <div className={styles.heroTopVignette} />

                {/* Glitch CRT Scanlines, Acid Flash Burst, and VHS Tracking Bar */}
                <div className={styles.scanlines} />
                <div className={styles.flashOverlay} />
                <div className={styles.trackingBar} />

                {/* Carousel Indicator Dots */}
                {activeSlideCount > 1 && (
                    <div className={styles.heroNavDots}>
                        {Array.from({ length: activeSlideCount }).map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className={`${styles.heroNavDot} ${idx === currentHeroIndex ? styles.heroNavDotActive : ''}`}
                                onClick={() => goToHeroSlide(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Carousel Arrow Controls */}
                {activeSlideCount > 1 && (
                    <div className={styles.heroArrowNav}>
                        <button
                            type="button"
                            className={styles.heroArrowBtn}
                            onClick={() => goToHeroSlide((currentHeroIndex - 1 + activeSlideCount) % activeSlideCount)}
                            aria-label="Previous slide"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className={styles.heroArrowBtn}
                            onClick={() => goToHeroSlide((currentHeroIndex + 1) % activeSlideCount)}
                            aria-label="Next slide"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Collection Title + Sort Toolbar */}
            <div className={styles.shopHeader}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <h2 className={`${styles.collectionTitle} reveal`} style={{ marginBottom: 0 }}>
                        Shop All
                    </h2>

                    <div className={`${styles.shopToolbar} reveal`} style={{ paddingBottom: 0, borderBottom: 'none' }}>
                        <div className={styles.toolbarRight}>
                            <span className={styles.productCount}>
                                {loading ? 'Loading...' : `${sortedProducts.length} item${sortedProducts.length !== 1 ? 's' : ''}`}
                            </span>
                            <select
                                className={styles.sortSelect}
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="newest">Sort by: Newest</option>
                                <option value="price-low">Price: Low — High</option>
                                <option value="price-high">Price: High — Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className={styles.shopSection}>
                {loading ? (
                    <div className={styles.productsGrid}>
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className={styles.productCard}>
                                <div
                                    className={`${styles.productImg} skeletonShimmer`}
                                    style={{ borderRadius: 4 }}
                                />
                                <div className={styles.productInfo} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div className="skeletonShimmer" style={{ height: 16, width: '65%', marginBottom: 8 }} />
                                    <div className="skeletonShimmer" style={{ height: 13, width: '30%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 20px', color: '#86868b' }}>
                        <h3 style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.8rem', color: '#ffffff', textTransform: 'uppercase', marginBottom: 10 }}>
                            New Drops Coming Soon
                        </h3>
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.85rem', maxWidth: 460, margin: '0 auto' }}>
                            Our merchandise catalog is currently being updated. Check back soon for exclusive limited-edition releases.
                        </p>
                    </div>
                ) : (
                    <div className={styles.productsGrid}>
                        {paginatedProducts.map((product, idx) => {
                            const isSoldOut = product.badge === 'Sold Out';

                            return (
                                <div
                                    key={product.id}
                                    className={`${styles.productCard} reveal`}
                                    data-hover={hoveredProduct === product.id ? 'true' : undefined}
                                    style={{ transitionDelay: `${Math.min(idx, 7) * 0.06}s` }}
                                    onClick={() => router.push(`/shop/${product.handle || product.id}`)}
                                    onMouseEnter={() => {
                                        setHoveredProduct(product.id);
                                        trackViewContent({
                                            content_name: product.name,
                                            content_ids: [product.shopifyId],
                                            content_type: 'product',
                                            value: product.price,
                                            currency: product.currency || 'USD',
                                        });
                                    }}
                                    onMouseLeave={() => setHoveredProduct(null)}
                                >
                                    <div className={styles.productImg}>
                                        {/* Real Status Badge */}
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

                                        {/* Main Image */}
                                        <Image
                                            src={
                                                hoveredProduct === product.id && product.hoverImage
                                                    ? product.hoverImage
                                                    : product.image
                                            }
                                            alt={product.name}
                                            width={600}
                                            height={600}
                                            className={styles.productImage}
                                        />

                                        {/* Quick Add Overlay */}
                                        {!isSoldOut && product.sizes && product.sizes.length > 0 && (
                                            <div className={styles.quickAdd}>
                                                <div className={styles.quickAddInner}>
                                                    <span className={styles.quickAddLabel}>
                                                        Quick Add
                                                    </span>
                                                    <div className={styles.sizeButtons}>
                                                        {product.sizes.map((size) => {
                                                            const isVariantAdding =
                                                                addingVariantId === product.variantMap[size]?.id;

                                                            return (
                                                                <button
                                                                    key={size}
                                                                    className={styles.sizeBtn}
                                                                    disabled={isVariantAdding}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleQuickAdd(product, size);
                                                                    }}
                                                                >
                                                                    {isVariantAdding ? (
                                                                        <span className={styles.loadingSpinner} />
                                                                    ) : (
                                                                        size
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.productInfo}>
                                        {product.sizes && product.sizes.length === 1 && (
                                            <div className={styles.productSize}>{product.sizes[0]}</div>
                                        )}
                                        <div className={styles.productName}>{product.name}</div>
                                        <div className={styles.productPrice}>
                                            {isSoldOut ? (
                                                <span className={styles.soldOutText}>Sold Out</span>
                                            ) : (
                                                `$${product.price.toFixed(2)}`
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={`${styles.pagination} reveal`}>
                        <button
                            className={styles.pageBtn}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                        >
                            ←
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className={styles.pageBtn}
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                        >
                            →
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Bag Pill */}
            {cart && cart.totalQuantity > 0 && (
                <button
                    className={styles.cartFloatBtn}
                    onClick={() => setIsCartOpen(true)}
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
            {isClientMounted && isCartOpen && cart && createPortal(
                <div className={styles.cartOverlay} onClick={() => setIsCartOpen(false)}>
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
                                onClick={() => setIsCartOpen(false)}
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
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        -
                                                    </button>
                                                    <span className={styles.qtyValue}>{item.quantity}</span>
                                                    <button
                                                        className={styles.qtyBtn}
                                                        disabled={updatingLineId === item.id}
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
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
        </div>
    );
}
