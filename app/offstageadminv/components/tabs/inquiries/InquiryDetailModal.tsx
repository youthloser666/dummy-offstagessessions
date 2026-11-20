'use client';

import React from 'react';
import type { Inquiry } from '../../../types';
import { formatInquiryTimestamp } from '../../../utils/dateFormatters';
import { getInquiryCategoryClass } from '../../../utils/statusClasses';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';

interface InquiryDetailModalProps {
  inquiry: Inquiry | null;
  onClose: () => void;
  onUpdateStatus: (id: string | number, status: string) => void;
  onDelete: (id: string | number) => void;
}

export function InquiryDetailModal({
  inquiry,
  onClose,
  onUpdateStatus,
  onDelete,
}: InquiryDetailModalProps) {
  if (!inquiry) {
    return null;
  }

  return (
    <div
      className={shellStyles.modalBackdrop}
      data-lenis-prevent="true"
      onClick={onClose}
    >
      <div
        className={`${shellStyles.modalContent} ${overviewStyles.inquiryModalContent}`}
        data-lenis-prevent="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={shellStyles.modalHeader}>
          <div>
            <h3 className={shellStyles.modalTitle}>
              {inquiry.subject || inquiry.name || 'Inquiry Details'}
            </h3>
            <p className={shellStyles.cardSubtitle}>
              Received {formatInquiryTimestamp(inquiry.created_at)}
            </p>
          </div>
          <button
            type="button"
            className={shellStyles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div className={overviewStyles.inquiryMetaBox}>
          <div>
            <div className={shellStyles.formLabel}>Sender</div>
            <div className={overviewStyles.cellPrimaryTitle}>{inquiry.name || 'Anonymous'}</div>
            {inquiry.email && (
              <a
                href={`mailto:${inquiry.email}`}
                className={overviewStyles.inquirySenderEmail}
              >
                {inquiry.email}
              </a>
            )}
          </div>

          <div>
            <div className={shellStyles.formLabel}>Category &amp; Status</div>
            <div className={overviewStyles.rowGapSm}>
              <span
                className={`${shellStyles.categoryTag} ${
                  shellStyles[getInquiryCategoryClass(inquiry.category)]
                }`}
              >
                {inquiry.category || 'General'}
              </span>
              <span
                className={`${shellStyles.statusBadge} ${
                  inquiry.status === 'unread'
                    ? shellStyles.statusBadgeLime
                    : shellStyles.statusBadgeActive
                }`}
              >
                {inquiry.status || 'read'}
              </span>
            </div>
            {inquiry.ip_address && (
              <div className={overviewStyles.monoMuted}>IP: {inquiry.ip_address}</div>
            )}
          </div>
        </div>

        <div className={overviewStyles.inquiryMessageWell}>
          {inquiry.message || 'No message body provided.'}
        </div>

        <div className={shellStyles.modalFooter}>
          {inquiry.email && (
            <a
              href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(
                inquiry.subject || 'Offstage Sessions Inquiry'
              )}`}
              className={shellStyles.btnPrimary}
            >
              Reply via Email ↗
            </a>
          )}

          {inquiry.status !== 'replied' && (
            <button
              type="button"
              className={shellStyles.btnSecondary}
              onClick={() => onUpdateStatus(inquiry.id, 'replied')}
            >
              Mark Replied
            </button>
          )}

          <button
            type="button"
            className={shellStyles.btnSecondary}
            onClick={() =>
              onUpdateStatus(inquiry.id, inquiry.status === 'unread' ? 'read' : 'unread')
            }
          >
            {inquiry.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
          </button>

          <button
            type="button"
            className={shellStyles.btnDanger}
            onClick={() => onDelete(inquiry.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

