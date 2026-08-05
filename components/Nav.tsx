'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const NAV_ITEMS = [
    { href: '/', label: 'Home' },
    { href: '/shows', label: 'Shows' },
    { href: '/media', label: 'Media' },
    { href: '/shop', label: 'Shop' },
];

export default function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);
    const drawerRef = useRef<HTMLDivElement>(null);

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

    // Close drawer on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                navRef.current &&
                !navRef.current.contains(e.target as Node) &&
                drawerRef.current &&
                !drawerRef.current.contains(e.target as Node)
            ) {
                closeDrawer();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeDrawer();
        };

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, closeDrawer]);

    // Close drawer on route change
    useEffect(() => {
        closeDrawer();
    }, [pathname, closeDrawer]);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <>
            <nav ref={navRef}>
                <div className="logo">
                    <Link href="/">
                        <Image
                            src="/image/offstages.gif"
                            alt="Offstage Sessions"
                            width={200}
                            height={112}
                            priority
                            unoptimized
                        />
                    </Link>
                </div>

                <ul className="nav-links">
                    {NAV_ITEMS.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={isActive(item.href) ? 'active' : ''}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="nav-right">
                    <a href="#contact" className="btn-contact">
                        Contact ↗
                    </a>
                    <button
                        className={`nav-hamburger${isOpen ? ' open' : ''}`}
                        onClick={toggleMenu}
                        aria-label="Menu"
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </nav>

            <div
                className={`nav-drawer${isOpen ? ' open' : ''}`}
                ref={drawerRef}
            >
                <ul>
                    {NAV_ITEMS.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={isActive(item.href) ? 'active' : ''}
                                onClick={closeDrawer}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
