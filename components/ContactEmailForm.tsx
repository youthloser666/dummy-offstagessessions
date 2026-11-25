'use client';

import React from 'react';
import { useContactForm } from '@/hooks/useContactForm';

export default function ContactEmailForm() {
    const {
        email,
        setEmail,
        subject,
        setSubject,
        category,
        setCategory,
        message,
        setMessage,
        isSubmitting,
        submitted,
        handleSubmit,
    } = useContactForm();

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
