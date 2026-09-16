'use client';

import React, { useState } from 'react';

export default function ContactEmailForm() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() && !subject.trim()) return;

        const emailSubject = subject.trim() || 'Offstage Inquiry';
        const emailBody = message.trim();
        const mailtoUrl = `mailto:offstage@offstagesessions.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        
        window.location.href = mailtoUrl;
    };

    return (
        <form className="contact-email-form" onSubmit={handleSubmit}>
            <div className="contact-form-field">
                <label className="contact-field-label" htmlFor="contact-subject">
                    SUBJECT
                </label>
                <input
                    id="contact-subject"
                    type="text"
                    className="contact-field-input"
                    placeholder="Booking, collab, or question..."
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

            <div className="contact-form-actions">
                <button
                    type="submit"
                    className="contact-form-submit"
                    data-cursor="SEND"
                    data-hover
                >
                    Send Email ↗
                </button>
            </div>
        </form>
    );
}
