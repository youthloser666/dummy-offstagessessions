'use client';

import React, { useMemo } from 'react';
import type { Inquiry, InquiryFilterCriterion } from '../../../types';
import { formatInquiryTimestamp } from '../../../utils/dateFormatters';
import { filterInquiriesByCriterion } from '../../../utils/inquiryFilters';
import { getInquiryCategoryClass } from '../../../utils/statusClasses';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';
import { InquiryDetailModal } from './InquiryDetailModal';

interface InquiriesTabProps {
  inquiriesList: Inquiry[];
  isLoadingInquiries: boolean;
  inquiryFilter: InquiryFilterCriterion;
  setInquiryFilter: (filter: InquiryFilterCriterion) => void;
  selectedInquiry: Inquiry | null;
  setSelectedInquiry: (inquiry: Inquiry | null) => void;
  unreadCount: number;
  onRefreshInquiries: () => void;
  onUpdateStatus: (id: string | number, status: string) => void;
  onDeleteInquiry: (id: string | number) => void;
}

export function InquiriesTab({
  inquiriesList,
  isLoadingInquiries,
  inquiryFilter,
  setInquiryFilter,
  selectedInquiry,
  setSelectedInquiry,
  unreadCount,
  onRefreshInquiries,
  onUpdateStatus,
  onDeleteInquiry,
}: InquiriesTabProps) {
  const filteredInquiries = useMemo(
    () => filterInquiriesByCriterion(inquiriesList, inquiryFilter),
    [inquiriesList, inquiryFilter]
  );

  const handleOpenInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    if (inquiry.status === 'unread') {
      onUpdateStatus(inquiry.id, 'read');
    }
  };

  return (
    <div>
      <header className={shellStyles.pageHeader}>
        <div>
          <h1 className={shellStyles.pageTitle}>Inquiries &amp; Inbox</h1>
          <p className={shellStyles.pageDesc}>
            Booking requests, VIP tables, artist collaborations &amp; press messages ({unreadCount}{' '}
            unread)
          </p>
        </div>

        <div className={shellStyles.headerActions}>
          <select
            className={`${shellStyles.formSelect} ${overviewStyles.filterSelectCompact}`}
            value={inquiryFilter}
            onChange={(event) => setInquiryFilter(event.target.value)}
            aria-label="Filter inquiries"
          >
            <option value="all">All Inquiries ({inquiriesList.length})</option>
            <option value="unread">Unread Only ({unreadCount})</option>
            <option value="Booking">Category: Booking</option>
            <option value="Collaboration">Category: Collaboration</option>
            <option value="Press">Category: Press</option>
            <option value="General">Category: General</option>
            <option value="replied">Status: Replied</option>
          </select>

          <button
            type="button"
            className={shellStyles.btnSecondary}
            onClick={onRefreshInquiries}
            disabled={isLoadingInquiries}
          >
            Refresh
          </button>
        </div>
      </header>

      <div className={`${shellStyles.card} ${shellStyles.cardFlush}`}>
        <div className={shellStyles.tableWrapper}>
          <table className={shellStyles.table}>
            <thead>
              <tr>
                <th>Sender / Contact</th>
                <th>Category</th>
                <th>Message Preview</th>
                <th>Received</th>
                <th>Status</th>
                <th className={shellStyles.tableActionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingInquiries ? (
                [1, 2, 3].map((rowIndex) => (
                  <tr key={rowIndex} className={shellStyles.tableRow}>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarMd}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarLg}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                    <td>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                    <td className={shellStyles.tableActionsCell}>
                      <div className={`skeletonShimmer ${overviewStyles.skeletonBarSm}`} />
                    </td>
                  </tr>
                ))
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className={shellStyles.tableEmptyCell}>
                    No inquiries found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className={shellStyles.tableRow}>
                    <td>
                      <div className={overviewStyles.unreadSenderCell}>
                        {inquiry.status === 'unread' && (
                          <span className={overviewStyles.unreadIndicatorDot} />
                        )}
                        <div>
                          <div className={overviewStyles.cellPrimaryTitle}>
                            {inquiry.name || inquiry.subject || 'Visitor'}
                          </div>
                          <div className={overviewStyles.cellPrimarySubtitle}>
                            {inquiry.email || 'No email provided'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${shellStyles.categoryTag} ${
                          shellStyles[getInquiryCategoryClass(inquiry.category)]
                        }`}
                      >
                        {inquiry.category || 'General'}
                      </span>
                    </td>
                    <td>
                      <div className={overviewStyles.messagePreviewCell}>
                        {inquiry.message || '—'}
                      </div>
                    </td>
                    <td className={overviewStyles.cellSecondaryText}>
                      {formatInquiryTimestamp(inquiry.created_at)}
                    </td>
                    <td>
                      <span
                        className={`${shellStyles.statusBadge} ${
                          inquiry.status === 'unread'
                            ? shellStyles.statusBadgeLime
                            : inquiry.status === 'replied'
                              ? shellStyles.statusBadgeActive
                              : shellStyles.statusBadgeWarning
                        }`}
                      >
                        {inquiry.status || 'read'}
                      </span>
                    </td>
                    <td className={shellStyles.tableActionsCell}>
                      <div className={shellStyles.tableActionsRow}>
                        <button
                          type="button"
                          className={shellStyles.btnEdit}
                          onClick={() => handleOpenInquiry(inquiry)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className={shellStyles.btnDanger}
                          onClick={() => onDeleteInquiry(inquiry.id)}
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

      <InquiryDetailModal
        inquiry={selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        onUpdateStatus={onUpdateStatus}
        onDelete={onDeleteInquiry}
      />
    </div>
  );
}

