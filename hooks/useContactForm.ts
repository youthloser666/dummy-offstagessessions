'use client';

import { useState } from 'react';
import { trackLead } from '@/lib/analytics';

export function useContactForm() {
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

      trackLead({
        content_name: subject.trim(),
        content_category: category,
      });
    } catch (err) {
      console.warn('Failed to record inquiry to backend:', err);
    } finally {
      setIsSubmitting(false);
    }

    const mailtoUrl = `mailto:offstage@offstagesessions.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  return {
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
  };
}
