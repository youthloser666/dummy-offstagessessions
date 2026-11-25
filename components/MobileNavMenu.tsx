'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export interface NavItem {
    href: string;
    label: string;
}

export interface MobileNavMenuProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: NavItem[];
    isActive: (href: string) => boolean;
    onHomeClick: (e: React.MouseEvent) => void;
    onContactClick: (e: React.MouseEvent) => void;
}

export function MobileNavMenu({
    isOpen,
    onClose,
    navItems,
    isActive,
    onHomeClick,
    onContactClick,
}: MobileNavMenuProps) {
    return (
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
                        <Link href="/" onClick={onClose} style={{ display: 'flex', alignItems: 'center' }}>
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
                            onClick={onClose}
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
                        {navItems.map((item, i) => (
                            <motion.div
                                key={item.href}
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 * i + 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="transform-gpu"
                            >
                                <Link
                                    href={item.href}
                                    onClick={item.href === '/' ? onHomeClick : onClose}
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
                            onClick={onContactClick}
                            className="btn-contact btn-contact-mobile"
                            data-hover
                        >
                            CONTACT
                        </a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default React.memo(MobileNavMenu);
