'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useReveal } from '@/hooks/useReveal';
import { products, shopCategories } from '@/lib/data';
import styles from './shop.module.css';

const PRODUCTS_PER_PAGE = 8;

export default function ShopPage() {
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    useReveal([currentPage, sortBy]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % products.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const sortedProducts = useMemo(() => {
        let sorted = [...products];

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
    }, [sortBy]);

    const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = sortedProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    return (
        <main className="bg-transparent" style={{ background: 'transparent' }}>
            {/* Full-Width Hero Image Banner (Bleeding under transparent navbar) */}
            <div className={`${styles.heroBanner} reveal`}>
                {products.map((item, idx) => (
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
                            <span className={styles.heroPrice}>${item.price}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Collection Title + Sort Toolbar */}
            <div className={styles.shopHeader}>
                <h2 className={`${styles.collectionTitle} reveal`}>
                    Shop All
                </h2>
                <div className={`${styles.shopToolbar} reveal`}>
                    <div className={styles.toolbarRight}>
                        <span className={styles.productCount}>
                            {sortedProducts.length} item{sortedProducts.length !== 1 ? 's' : ''}
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

            {/* Product Grid */}
            <div className={styles.shopSection}>
                <div className={styles.productsGrid}>
                    {paginatedProducts.map((product, idx) => (
                        <div
                            key={product.id}
                            className={`${styles.productCard} reveal`}
                            style={{ transitionDelay: `${Math.min(idx, 7) * 0.06}s` }}
                            onMouseEnter={() => setHoveredProduct(product.id)}
                            onMouseLeave={() => setHoveredProduct(null)}
                        >
                            <div className={styles.productImg}>
                                {/* Badge */}
                                {product.badge && (
                                    <span className={`${styles.productBadge} ${product.badge === 'Sold Out' ? styles.badgeSoldOut : ''} ${product.badge === 'Limited' ? styles.badgeLimited : ''}`}>
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
                                {product.badge !== 'Sold Out' && product.sizes && (
                                    <div className={styles.quickAdd}>
                                        <div className={styles.quickAddInner}>
                                            <span className={styles.quickAddLabel}>Quick Add</span>
                                            <div className={styles.sizeButtons}>
                                                {product.sizes.map((size) => (
                                                    <button key={size} className={styles.sizeBtn}>
                                                        {size}
                                                    </button>
                                                ))}
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
                                    {product.badge === 'Sold Out' ? (
                                        <span className={styles.soldOutText}>Sold Out</span>
                                    ) : (
                                        `$${product.price}`
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

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
        </main>
    );
}
