'use client';

import React, { useState } from 'react';

export default function ContactEmailForm() {
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Booking');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !email.trim() || !subject.trim()) return;

        setIsSubmitting(true);
        const emailSubject = `[${category.toUpperCase()}] ${subject.trim()}`;
        const emailBody = `From: ${email.trim()}\nCategory: ${category}\n\n${message.trim()}`;

        try {
            // Asynchronously record to Supabase database via API
            await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    subject: subject.trim(),
                    category,
                    message: message.trim(),
                }),
            });
            setSubmitted(true);
        } catch (err) {
            console.warn('Failed to record inquiry to backend:', err);
        } finally {
            setIsSubmitting(false);
        }

        // Also trigger mailto so user can send direct email
        const mailtoUrl = `mailto:offstage@offstagesessions.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoUrl;
    };

    return (
        <form className="contact-email-form" onSubmit={handleSubmit}>
            <div className="contact-form-field">
                <label className="contact-field-label" htmlFor="contact-email">
                    YOUR EMAIL
                </label>
                <input
                    id="contact-email"
                    type="email"
                    className="contact-field-input"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="contact-form-field">
                <label className="contact-field-label" htmlFor="contact-category">
                    CATEGORY
                </label>
                <select
                    id="contact-category"
                    className="contact-field-input"
                    style={{ background: '#0a0a0c', color: '#fff', cursor: 'pointer', padding: '10px 0' }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="Booking">Booking & Performances</option>
                    <option value="Collaboration">Collaboration / DJ</option>
                    <option value="Press">Press & Media</option>
                    <option value="General">General Inquiry</option>
                </select>
            </div>

            <div className="contact-form-field">
                <label className="contact-field-label" htmlFor="contact-subject">
                    SUBJECT
                </label>
                <input
                    id="contact-subject"
                    type="text"
                    className="contact-field-input"
                    placeholder="Brief topic or event inquiry..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                />
            </div>

            <div className="contact-form-field">
                <label className="contact-field-label" htmlFor="contact-message">
                    YOUR MESSAGE
                </label>
                <textarea
                    id="contact-message"
                    rows={2}
                    className="contact-field-textarea"
                    placeholder="Write your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />
            </div>

            <div className="contact-form-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                    type="submit"
                    className="contact-form-submit"
                    data-cursor="SEND"
                    data-hover
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Recording...' : 'Send Email ↗'}
                </button>

                {submitted && (
                    <span style={{ fontSize: '12px', color: '#e2ff32', fontWeight: 600 }}>
                        ✓ Recorded in system!
                    </span>
                )}
            </div>
        </form>
    );
}
