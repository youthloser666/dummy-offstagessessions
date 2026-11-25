'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { smoothScrollTo } from '@/lib/utils/scroll';
import MobileNavMenu from './MobileNavMenu';

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

    const handleHomeClick = (e: React.MouseEvent) => {
        if (pathname === '/') {
            e.preventDefault();
            closeDrawer();
            smoothScrollTo(0, 1.8);
        } else {
            closeDrawer();
        }
    };

    const handleContactClick = (e: React.MouseEvent) => {
        if (pathname === '/') {
            e.preventDefault();
            closeDrawer();
            smoothScrollTo('#contact', 1.8);
        } else {
            closeDrawer();
        }
    };

    if (pathname?.startsWith('/offstageadminv')) {
        return null;
    }

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
                    <Link href="/" onClick={handleHomeClick}>
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
                                        onClick={item.href === '/' ? handleHomeClick : closeDrawer}
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
                            onClick={handleContactClick}
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

            {/* Modern Fullscreen Mobile Overlay */}
            <MobileNavMenu
                isOpen={isOpen}
                onClose={closeDrawer}
                navItems={NAV_ITEMS}
                isActive={isActive}
                onHomeClick={handleHomeClick}
                onContactClick={handleContactClick}
            />
        </>
    );
}

export default memo(Nav);
