'use client';

import React from 'react';
import styles from '../../admin.module.css';
import { Inquiry } from '../../types';

interface InquiriesTabProps {
  inquiriesList: Inquiry[];
  loadingInquiries: boolean;
  loadInquiries: () => void;
  inquiryFilter: string;
  setInquiryFilter: (filter: string) => void;
  selectedInquiry: Inquiry | null;
  setSelectedInquiry: (inquiry: Inquiry | null) => void;
  handleUpdateInquiryStatus: (id: string | number, status: string) => void;
  handleDeleteInquiry: (id: string | number) => void;
  unreadInquiriesCount: number;
  notify: (type: 'success' | 'error', message: string) => void;
}

export default function InquiriesTab({
  inquiriesList,
  loadingInquiries,
  loadInquiries,
  inquiryFilter,
  setInquiryFilter,
  selectedInquiry,
  setSelectedInquiry,
  handleUpdateInquiryStatus,
  handleDeleteInquiry,
  unreadInquiriesCount,
  notify,
}: InquiriesTabProps) {
  const filteredInquiries = inquiriesList.filter((item) => {
    if (inquiryFilter === 'all') return true;
    if (inquiryFilter === 'unread') return item.status === 'unread';
    if (inquiryFilter === 'replied') return item.status === 'replied';
    return item.category === inquiryFilter;
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Track Emails &amp; Inquiries</h1>
          <p className={styles.pageDesc}>
            Live log of booking requests, collaborations, and contact messages sent from your website.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={() => {
              loadInquiries();
              notify('success', 'Inquiries refreshed');
            }}
            disabled={loadingInquiries}
            className={styles.btnSecondary}
          >
            {loadingInquiries ? 'Refreshing...' : 'Refresh Inquiries'}
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'unread', 'Booking', 'Collaboration', 'Press', 'General', 'replied'].map((cat) => (
          <button
            key={cat}
            onClick={() => setInquiryFilter(cat)}
            className={inquiryFilter === cat ? styles.btnPrimary : styles.btnSecondary}
            style={{ fontSize: 12, padding: '5px 12px', textTransform: 'capitalize' }}
          >
            {cat === 'all'
              ? `All (${inquiriesList.length})`
              : cat === 'unread'
              ? `Unread (${unreadInquiriesCount})`
              : cat}
          </button>
        ))}
      </div>

      {/* Inquiries Table */}
      <div className={styles.card} style={{ padding: 0 }}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sender Email</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th style={{ width: 140, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiriesList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: '#86868b' }}>
                    No inquiries received yet. Try submitting the contact form on your website!
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: '#86868b' }}>
                    No inquiries found matching the &ldquo;{inquiryFilter}&rdquo; filter.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((item, idx) => (
                  <tr key={item.id || idx} className={styles.tableRow}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: '#a1a1a6' }}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recent'}
                    </td>
                    <td>
                      <div style={{ color: '#ffffff', fontWeight: 600 }}>{item.email || 'Anonymous'}</div>
                      {item.ip_address && (
                        <div style={{ fontSize: 10, color: '#666' }}>IP: {item.ip_address}</div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.categoryTag} ${
                          item.category === 'Booking'
                            ? styles.categoryBooking
                            : item.category === 'Collaboration'
                            ? styles.categoryCollab
                            : item.category === 'Press'
                            ? styles.categoryPress
                            : styles.categoryGeneral
                        }`}
                      >
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td>
                      <div style={{ color: '#ffffff', fontWeight: 500 }}>{item.subject}</div>
                    </td>
                    <td style={{ maxWidth: 280, color: '#a1a1a6', fontSize: 12 }}>
                      <div
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                        }}
                        title="Click to view full message"
                        onClick={() => setSelectedInquiry(item)}
                      >
                        {item.message}
                      </div>
                    </td>
                    <td>
                      <select
                        value={item.status || 'unread'}
                        onChange={(e) => handleUpdateInquiryStatus(item.id, e.target.value)}
                        className={styles.formSelect}
                        style={{
                          padding: '3px 8px',
                          fontSize: 11,
                          width: 'auto',
                          borderRadius: 12,
                          backgroundColor:
                            item.status === 'unread'
                              ? 'rgba(226, 255, 50, 0.15)'
                              : item.status === 'replied'
                              ? 'rgba(85, 243, 133, 0.15)'
                              : 'rgba(100, 181, 246, 0.15)',
                          color:
                            item.status === 'unread'
                              ? '#e2ff32'
                              : item.status === 'replied'
                              ? '#55f385'
                              : '#64b5f6',
                          fontWeight: 600,
                        }}
                      >
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        {item.email && (
                          <a
                            href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`}
                            className={styles.linkPill}
                            style={{ fontSize: 11 }}
                            title="Reply via Email Client"
                            onClick={() => {
                              if (item.status === 'unread') {
                                handleUpdateInquiryStatus(item.id, 'replied');
                              }
                            }}
                          >
                            Reply ↗
                          </a>
                        )}
                        <button
                          type="button"
                          className={styles.btnDanger}
                          onClick={() => handleDeleteInquiry(item.id)}
                          title="Delete Inquiry"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Detail Card */}
      {selectedInquiry && (
        <div className={styles.card} style={{ marginTop: 24, border: '1px solid rgba(226, 255, 50, 0.3)' }}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>{selectedInquiry.subject}</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#86868b' }}>
                From: <strong style={{ color: '#fff' }}>{selectedInquiry.email}</strong> · Category: {selectedInquiry.category}
              </p>
            </div>
            <button
              onClick={() => setSelectedInquiry(null)}
              className={styles.btnSecondary}
              style={{ fontSize: 11 }}
            >
              Close Preview
            </button>
          </div>
          <div style={{ backgroundColor: '#141417', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap', color: '#e0e0e0', fontSize: 14, lineHeight: 1.6 }}>
            {selectedInquiry.message}
          </div>
        </div>
      )}
    </div>
  );
}
