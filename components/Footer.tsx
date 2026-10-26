'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ContactEmailForm from './ContactEmailForm';
import { smoothScrollTo } from '@/lib/utils/scroll';

interface FooterProps {
    footerBigText?: string;
}

export default function Footer({ footerBigText = 'Offstage Sessions' }: FooterProps) {
    const pathname = usePathname();
    const [socials, setSocials] = useState({
        email: 'offstage@offstagesessions.com',
        facebook: 'https://www.facebook.com/offstagesessions',
        instagram: 'https://instagram.com/offstagesession',
        tiktok: 'https://www.tiktok.com/@offstagesessions',
    });

    useEffect(() => {
        fetch('/api/socials')
            .then((res) => res.json())
            .then((json) => {
                if (json.success && json.data) {
                    setSocials((prev) => ({
                        ...prev,
                        email: json.data.email || prev.email,
                        facebook: json.data.facebook || prev.facebook,
                        instagram: json.data.instagram || prev.instagram,
                        tiktok: json.data.tiktok || prev.tiktok,
                    }));
                }
            })
            .catch(() => {});
    }, []);

    // Self-contained observer to ensure footer reveal items become visible and STAY visible
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const footerEl = document.getElementById('contact');
        if (!footerEl) return;

        const revealEls = footerEl.querySelectorAll('.reveal');
        if (!revealEls.length) return;

        // Clean any leftover exit class from route transitions
        revealEls.forEach((el) => {
            el.classList.remove('exit');
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('exit');
                        entry.target.classList.add('visible');
                        // Stay visible once revealed
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.02, rootMargin: '100px 0px 100px 0px' }
        );

        revealEls.forEach((el) => observer.observe(el));

        // Safety fallback: after a short delay, if elements are in/near viewport, ensure visible
        const timer = setTimeout(() => {
            revealEls.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight + 250) {
                    el.classList.remove('exit');
                    el.classList.add('visible');
                }
            });
        }, 350);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [pathname]);

    if (pathname?.startsWith('/offstageadminv')) return null;

    const handleScrollToTop = () => {
        smoothScrollTo(0, 1.8);
    };

    return (
        <footer id="contact">
            <div className="footer-top">
                <div className="footer-headline reveal">
                    Get
                    <br />
                    <span>In</span>
                    <br />
                    Touch
                </div>
                <div className="reveal">
                    <p className="footer-desc">
                        Have a question, booking inquiry, or want to collaborate with Offstage Sessions?
                        Send us a message directly.
                    </p>
                    <ContactEmailForm />
                    <div className="footer-contact-block">
                        <span className="footer-contact-label">DIRECT EMAIL</span>
                        <a
                            href={`mailto:${socials.email}`}
                            className="footer-contact-mail"
                            data-cursor="EMAIL"
                            data-hover
                        >
                            {socials.email} ↗
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-logo-text">
                    OFFSTAGE SESSIONS LLC. EST. 2023
                </div>
                <div className="footer-socials">
                    <a
                        href="#home"
                        onClick={(e) => {
                            e.preventDefault();
                            handleScrollToTop();
                        }}
                        data-cursor="HOME"
                        data-hover
                    >
                        Home
                    </a>
                    <a
                        href={`mailto:${socials.email}`}
                        data-cursor="EMAIL"
                        data-hover
                    >
                        Email
                    </a>
                    {socials.facebook && (
                        <a
                            href={socials.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Facebook
                        </a>
                    )}
                    {socials.instagram && (
                        <a
                            href={socials.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Instagram
                        </a>
                    )}
                    {socials.tiktok && (
                        <a
                            href={socials.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            TikTok
                        </a>
                    )}
                </div>
                <div className="footer-copy">© 2026 Offstage Sessions</div>
            </div>

            <div 
                className="footer-big-text"
                onClick={handleScrollToTop}
                style={{ cursor: 'pointer' }}
                data-cursor="TOP"
                title="Click to scroll to top"
            >
                {footerBigText}
            </div>
        </footer>
    );
}
