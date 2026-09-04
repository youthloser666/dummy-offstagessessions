'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
    { href: '/', label: 'Home' },
    { href: '/shows', label: 'Shows' },
    { href: '/media', label: 'Media' },
    { href: '/shop', label: 'Shop' },
];

function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);

    const closeDrawer = useCallback(() => {
        setIsOpen(false);
        document.body.style.overflow = '';
    }, []);

    const toggleMenu = useCallback(() => {
        setIsOpen((prev) => {
            const next = !prev;
            document.body.style.overflow = next ? 'hidden' : '';
            return next;
        });
    }, []);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeDrawer();
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeDrawer]);

    // Close on route change
    useEffect(() => {
        closeDrawer();
    }, [pathname, closeDrawer]);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <>
            <nav 
                ref={navRef}
                className="fixed top-0 left-0 right-0 w-full z-50 pointer-events-none"
                style={{
                    background: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                }}
            >
                {/* Far Left: Brand Logo */}
                <div className="logo pointer-events-auto">
                    <Link href="/" onClick={closeDrawer}>
                        <Image
                            src="/image/offstages.gif"
                            alt="Offstage Sessions"
                            width={320}
                            height={180}
                            priority
                            unoptimized
                            style={{ height: '70px', width: 'auto', objectFit: 'contain' }}
                        />
                    </Link>
                </div>

                {/* Far Right: Desktop Menu Links & Actions (K95 Kinetic Character Roll with Blend Mode) */}
                <div className="nav-right-cluster pointer-events-auto">
                    <ul className="nav-links">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`nav-link-item ${active ? 'is-active' : ''}`}
                                        data-hover
                                    >
                                        <span className="nav-link-text">
                                            {item.label.toUpperCase().split('').map((char, i) => (
                                                <span
                                                    key={i}
                                                    className="nav-link-char"
                                                    style={{ '--i': i } as React.CSSProperties}
                                                >
                                                    <span className="char-top">{char}</span>
                                                    <span className="char-bot">{char}</span>
                                                </span>
                                            ))}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="nav-right">
                        <a 
                            href="#contact" 
                            className="btn-contact" 
                            data-cursor="CONTACT" 
                            data-hover
                        >
                            CONTACT
                        </a>
                        <button
                            className={`nav-hamburger${isOpen ? ' open' : ''}`}
                            onClick={toggleMenu}
                            aria-label="Toggle Navigation Menu"
                            data-hover
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Modern Fullscreen Mobile Overlay ala K95 Studio */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="mobile-fullscreen-overlay transform-gpu"
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            width: '100vw',
                            height: '100vh',
                            zIndex: 99999,
                            backgroundColor: 'rgba(0, 0, 0, 0.96)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '0 6% 40px',
                        }}
                    >
                        {/* Header: Logo on Left, Close ('X') on Right */}
                        <div 
                            style={{
                                height: '80px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                            }}
                        >
                            <Link href="/" onClick={closeDrawer} style={{ display: 'flex', alignItems: 'center' }}>
                                <Image
                                    src="/image/offstages.gif"
                                    alt="Offstage Sessions"
                                    width={260}
                                    height={150}
                                    priority
                                    unoptimized
                                    style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
                                />
                            </Link>

                            <button
                                onClick={closeDrawer}
                                aria-label="Close Navigation Menu"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontSize: '1.75rem',
                                    fontFamily: 'Arial, sans-serif',
                                    cursor: 'pointer',
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1,
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Giant Center Menu: HOME, SHOWS, MEDIA, SHOP */}
                        <div 
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '32px',
                                flex: 1,
                            }}
                        >
                            {NAV_ITEMS.map((item, i) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, y: 25 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.08 * i + 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="transform-gpu"
                                >
                                    <Link
                                        href={item.href}
                                        onClick={closeDrawer}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            textDecoration: 'none',
                                            color: '#ffffff',
                                            fontFamily: "'Moderniz', sans-serif",
                                            fontSize: 'clamp(2.2rem, 8vw, 3.4rem)',
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                            opacity: isActive(item.href) ? 1 : 0.45,
                                            transition: 'opacity 0.25s ease, color 0.25s ease',
                                        }}
                                    >
                                        <span>{item.label}</span>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Bottom Pinned Wide Contact Button */}
                        <div 
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                width: '100%',
                            }}
                        >
                            <a
                                href="#contact"
                                onClick={closeDrawer}
                                className="btn-contact btn-contact-mobile"
                                data-hover
                            >
                                CONTACT
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default memo(Nav);




