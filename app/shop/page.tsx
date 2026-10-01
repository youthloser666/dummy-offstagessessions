'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useReveal } from '@/hooks/useReveal';
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

    // Cart state
    const [addingVariantId, setAddingVariantId] = useState<string | null>(null);
    const [cart, setCart] = useState<CartState | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Fetch real Shopify products
    useEffect(() => {
        let isMounted = true;

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

    // Hero carousel interval
    useEffect(() => {
        if (allProducts.length <= 1) {
            setCurrentHeroIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % Math.min(allProducts.length, 5));
        }, 4500);

        return () => clearInterval(interval);
    }, [allProducts.length]);

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
            {/* Full-Width Hero Image Banner (Bleeding under transparent navbar) */}
            <div className={`${styles.heroBanner} relative reveal`}>
                {allProducts.length > 0 ? (
                    allProducts.slice(0, 5).map((item, idx) => (
                        <div
                            key={item.id}
                            className={`${styles.heroSlide} ${idx === currentHeroIndex ? styles.activeSlide : ''}`}
                        >
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className={styles.heroImg}
                                priority={idx === 0}
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
                    /* Elegant brand hero banner when store is loading or empty */
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
                                    onMouseEnter={() => setHoveredProduct(product.id)}
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
