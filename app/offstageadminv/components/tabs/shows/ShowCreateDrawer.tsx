'use client';

import React from 'react';
import type { ShowFormDraft } from '../../../types';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';
import { AdminImageUploader } from '../../shared/AdminImageUploader';

interface ShowCreateDrawerProps {
  draft: ShowFormDraft;
  isUploadingPoster: boolean;
  posterPreviewUrl: string | null;
  onChange: (updatedDraft: ShowFormDraft) => void;
  onUploadPoster: (file: File) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}

export function ShowCreateDrawer({
  draft,
  isUploadingPoster,
  posterPreviewUrl,
  onChange,
  onUploadPoster,
  onSubmit,
  onCancel,
}: ShowCreateDrawerProps) {
  return (
    <div className={`${shellStyles.card} ${overviewStyles.drawerCardSpaced}`}>
      <div className={shellStyles.cardHeader}>
        <div>
          <h3 className={shellStyles.cardTitle}>Schedule New Event / Session</h3>
          <p className={shellStyles.cardSubtitle}>
            Add upcoming sessions directly to the Offstage calendar &amp; homepage spotlight
          </p>
        </div>

        <button type="button" className={shellStyles.btnSecondary} onClick={onCancel}>
          Close
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div className={shellStyles.formGrid2}>
          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Event Name *</label>
            <input
              type="text"
              required
              className={shellStyles.formInput}
              placeholder="e.g. Warehouse Session #14"
              value={draft.name}
              onChange={(event) => onChange({ ...draft, name: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Lineup / Subtitle</label>
            <input
              type="text"
              className={shellStyles.formInput}
              placeholder="e.g. Special Guests & Resident DJs"
              value={draft.subtitle}
              onChange={(event) => onChange({ ...draft, subtitle: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Date Code</label>
            <input
              type="text"
              className={shellStyles.formInput}
              placeholder="e.g. AUG 28"
              value={draft.date_code}
              onChange={(event) => onChange({ ...draft, date_code: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Date Formatted</label>
            <input
              type="text"
              className={shellStyles.formInput}
              placeholder="e.g. Friday, August 28"
              value={draft.date_formatted}
              onChange={(event) => onChange({ ...draft, date_formatted: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Event Calendar Date</label>
            <input
              type="date"
              className={shellStyles.formInput}
              value={draft.event_date}
              onChange={(event) => onChange({ ...draft, event_date: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Month Group</label>
            <input
              type="text"
              className={shellStyles.formInput}
              placeholder="e.g. August 2026"
              value={draft.month}
              onChange={(event) => onChange({ ...draft, month: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Venue *</label>
            <input
              type="text"
              required
              className={shellStyles.formInput}
              placeholder="e.g. Baltimore Warehouse"
              value={draft.venue}
              onChange={(event) => onChange({ ...draft, venue: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Time</label>
            <input
              type="text"
              className={shellStyles.formInput}
              placeholder="e.g. 9:00 PM - 2:00 AM"
              value={draft.time}
              onChange={(event) => onChange({ ...draft, time: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Posh Ticket URL</label>
            <input
              type="url"
              className={shellStyles.formInput}
              placeholder="https://posh.vip/..."
              value={draft.posh_url}
              onChange={(event) => onChange({ ...draft, posh_url: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Tags (comma separated)</label>
            <input
              type="text"
              className={shellStyles.formInput}
              placeholder="House, Techno"
              value={draft.tags}
              onChange={(event) => onChange({ ...draft, tags: event.target.value })}
            />
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Status</label>
            <select
              className={shellStyles.formSelect}
              value={draft.status}
              onChange={(event) => onChange({ ...draft, status: event.target.value })}
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          <div className={`${shellStyles.formGroup} ${overviewStyles.rowGapMd}`}>
            <label className={shellStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) => onChange({ ...draft, featured: event.target.checked })}
              />
              <span>Featured Spotlight Show</span>
            </label>
          </div>
        </div>

        <div className={shellStyles.formGroup}>
          <label className={shellStyles.formLabel}>Event Poster Image *</label>
          <AdminImageUploader
            previewUrl={posterPreviewUrl || draft.poster_url || null}
            isUploading={isUploadingPoster}
            onFileSelect={onUploadPoster}
            emptyTitle="Click or drag event poster here"
            emptySubtitle="PNG, JPG, WEBP — automatically optimized for fast loading"
            uploadedStatusText="Poster uploaded & ready"
            previewAlt="Show poster preview"
          />
        </div>

        <div className={shellStyles.formGroup}>
          <label className={shellStyles.formLabel}>Or Paste Poster URL</label>
          <input
            type="text"
            className={shellStyles.formInput}
            placeholder="https://..."
            value={draft.poster_url}
            onChange={(event) => onChange({ ...draft, poster_url: event.target.value })}
          />
        </div>

        <div className={shellStyles.modalFooter}>
          <button type="button" className={shellStyles.btnSecondary} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className={shellStyles.btnPrimary} disabled={isUploadingPoster}>
            {isUploadingPoster ? 'Uploading Poster...' : 'Publish Show'}
          </button>
        </div>
      </form>
    </div>
  );
}

