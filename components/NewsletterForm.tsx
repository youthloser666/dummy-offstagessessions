'use client';

import { useRef } from 'react';

export default function NewsletterForm() {
    const inputRef = useRef<HTMLInputElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    const handleSubscribe = () => {
        const input = inputRef.current;
        const btn = btnRef.current;
        if (!input || !btn) return;

        if (input.value && input.value.includes('@')) {
            btn.textContent = 'Subscribed ✓';
            btn.style.background = '#c8ff00';
            btn.style.color = '#000';
            input.value = '';
            input.placeholder = "You're in!";
        }
    };

    return (
        <>
            <div className="newsletter-form">
                <input
                    ref={inputRef}
                    type="email"
                    placeholder="your@email.com"
                />
                <button
                    ref={btnRef}
                    type="button"
                    onClick={handleSubscribe}
                >
                    Subscribe
                </button>
            </div>
            <p className="form-note">
                Offstage Sessions LLC — We respect your privacy.
            </p>
        </>
    );
}
