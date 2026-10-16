'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useReveal } from '@/hooks/useReveal';
import { trackAddToCart, trackInitiateCheckout, trackViewContent } from '@/lib/analytics';
import styles from './shop.module.css';

const PRODUCTS_PER_PAGE = 8;

interface StoreProduct {
    id: string;
    shopifyId: string;
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

interface CartState {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    lastItem?: {
        name: string;
        size: string;
        price: number;
        image: string;
    };
}

export default function ShopPage() {
    const [allProducts, setAllProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [banners, setBanners] = useState<any[]>([]);
    const [isGlitching, setIsGlitching] = useState(false);
    const isGlitchingRef = useRef(false);

    // Cart state
    const [addingVariantId, setAddingVariantId] = useState<string | null>(null);
    const [cart, setCart] = useState<CartState | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

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

    // Hero carousel interval based on banners or products
    const activeSlideCount = banners.length > 0 ? banners.length : Math.min(allProducts.length, 5);

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
                setCart({
                    id: data.cart.id,
                    checkoutUrl: data.cart.checkoutUrl,
                    totalQuantity: data.cart.totalQuantity,
                    lastItem: {
                        name: product.name,
                        size: variant.title,
                        price: variant.price,
                        image: product.image,
                    },
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

    return (
        <div className="bg-transparent" style={{ background: 'transparent' }}>
            {/* Full-Width Hero Image Banner (Bleeding under transparent navbar on desktop & mobile) */}
            <div className={`${styles.heroBanner} relative ${isGlitching ? styles.stageGlitching : ''}`}>
                {banners.length > 0 ? (
                    banners.map((item, idx) => {
                        const isCurrent = idx === currentHeroIndex;
                        const showTitleAndCat = !item.hide_title && Boolean(item.title || item.category);
                        const showPrice = !item.hide_price && Boolean(item.price);
                        const showButton = !item.hide_button && Boolean(item.link_url && item.button_text);
                        const hasAnyOverlay = showTitleAndCat || showPrice || showButton;

                        return (
                            <div
                                key={item.id}
                                className={`${styles.heroSlide} ${isCurrent ? styles.activeSlide : ''}`}
                            >
                                {/* Ambient Blur backdrop to softly blend letterbox on various aspect ratios */}
                                <div className={styles.heroImgBlurWrap}>
                                    <Image
                                        src={item.image_url}
                                        alt=""
                                        fill
                                        className={styles.heroImgBlur}
                                        priority
                                    />
                                </div>

                                {/* Main Hero Banner Image */}
                                <Image
                                    src={item.image_url}
                                    alt={item.title || 'Shop Hero Banner'}
                                    fill
                                    className={styles.heroImg}
                                    priority
                                />

                                {/* Glitch Slice Layers (Red / Cyan chromatic channels) */}
                                <Image
                                    src={item.image_url}
                                    alt=""
                                    fill
                                    aria-hidden="true"
                                    className={styles.sliceA}
                                />
                                <Image
                                    src={item.image_url}
                                    alt=""
                                    fill
                                    aria-hidden="true"
                                    className={styles.sliceB}
                                />

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
                ) : allProducts.length > 0 ? (
                    allProducts.slice(0, 5).map((item, idx) => (
                        <div
                            key={item.id}
                            className={`${styles.heroSlide} ${idx === currentHeroIndex ? styles.activeSlide : ''}`}
                        >
                            <div className={styles.heroImgBlurWrap}>
                                <Image
                                    src={item.image}
                                    alt=""
                                    fill
                                    className={styles.heroImgBlur}
                                    priority
                                />
                            </div>
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className={styles.heroImg}
                                priority
                            />
                            <Image
                                src={item.image}
                                alt=""
                                fill
                                aria-hidden="true"
                                className={styles.sliceA}
                            />
                            <Image
                                src={item.image}
                                alt=""
                                fill
                                aria-hidden="true"
                                className={styles.sliceB}
                            />
                            <div className={styles.heroOverlay} />
                            <div className={styles.heroInfo}>
                                <span className={styles.heroCategory}>{item.category}</span>
                                <h2 className={styles.heroTitle}>{item.name}</h2>
                                <span className={styles.heroPrice}>
                                    ${item.price.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    /* Brand hero banner when store is loading or empty */
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
                                    style={{ transitionDelay: `${Math.min(idx, 7) * 0.06}s` }}
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
                    <span>Bag</span>
                    <span className={styles.cartCountBadge}>{cart.totalQuantity}</span>
                    <span>Checkout →</span>
                </button>
            )}

            {/* Cart Slide-Over Drawer */}
            {isCartOpen && cart && (
                <div className={styles.cartOverlay} onClick={() => setIsCartOpen(false)}>
                    <div className={styles.cartDrawer} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.cartHeader}>
                            <h3 className={styles.cartTitle}>Your Bag ({cart.totalQuantity})</h3>
                            <button
                                className={styles.cartCloseBtn}
                                onClick={() => setIsCartOpen(false)}
                                aria-label="Close cart"
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.cartBody}>
                            {cart.lastItem && (
                                <div className={styles.cartItem}>
                                    <div className={styles.cartItemImg}>
                                        <Image
                                            src={cart.lastItem.image}
                                            alt={cart.lastItem.name}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className={styles.cartItemDetails}>
                                        <div>
                                            <p className={styles.cartItemTitle}>{cart.lastItem.name}</p>
                                            <p className={styles.cartItemVariant}>Size: {cart.lastItem.size}</p>
                                        </div>
                                        <p className={styles.cartItemPrice}>${cart.lastItem.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.cartFooter}>
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
                                        content_ids: cart.lastItem ? [cart.id] : [],
                                        num_items: cart.totalQuantity,
                                        value: cart.lastItem?.price,
                                        currency: 'USD',
                                    });
                                }}
                            >
                                Checkout on Shopify →
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
