'use client';

import React from 'react';
import type { NotifyHandler, SocialForm } from '../../../types';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';

interface SocialsTabProps {
  socialForm: SocialForm;
  setSocialForm: (form: SocialForm) => void;
  isLoadingSocials: boolean;
  isSavingSocials: boolean;
  isSocialTableMissing?: boolean;
  notify?: NotifyHandler;
  onReloadSocials?: () => void;
  onSaveSocials: (event: React.FormEvent) => void;
}

export function SocialsTab({
  socialForm,
  setSocialForm,
  isLoadingSocials,
  isSavingSocials,
  onReloadSocials,
  onSaveSocials,
}: SocialsTabProps) {
  return (
    <div>
      <header className={shellStyles.pageHeader}>
        <div>
          <h1 className={shellStyles.pageTitle}>Social &amp; Contact Channels</h1>
          <p className={shellStyles.pageDesc}>
            Configure social dock links, booking email &amp; external music profiles globally
          </p>
        </div>

        {onReloadSocials && (
          <div className={shellStyles.headerActions}>
            <button
              type="button"
              className={shellStyles.btnSecondary}
              onClick={onReloadSocials}
              disabled={isLoadingSocials}
            >
              {isLoadingSocials ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        )}
      </header>

      <div className={shellStyles.socialsSplit}>
        <form className={shellStyles.card} onSubmit={onSaveSocials}>
          <div className={shellStyles.cardHeader}>
            <div>
              <h3 className={shellStyles.cardTitle}>Live Channel Endpoints</h3>
              <p className={shellStyles.cardSubtitle}>
                {isLoadingSocials
                  ? 'Loading persisted configuration...'
                  : 'Updates reflect across footer, social dock & contact modals'}
              </p>
            </div>
          </div>

          <div className={shellStyles.formGrid2}>
            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Instagram URL</label>
              <input
                type="url"
                className={shellStyles.formInput}
                placeholder="https://instagram.com/..."
                value={socialForm.instagram}
                onChange={(event) =>
                  setSocialForm({ ...socialForm, instagram: event.target.value })
                }
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>TikTok URL</label>
              <input
                type="url"
                className={shellStyles.formInput}
                placeholder="https://www.tiktok.com/@..."
                value={socialForm.tiktok}
                onChange={(event) =>
                  setSocialForm({ ...socialForm, tiktok: event.target.value })
                }
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Facebook URL</label>
              <input
                type="url"
                className={shellStyles.formInput}
                placeholder="https://www.facebook.com/..."
                value={socialForm.facebook}
                onChange={(event) =>
                  setSocialForm({ ...socialForm, facebook: event.target.value })
                }
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Booking / Official Email</label>
              <input
                type="email"
                className={shellStyles.formInput}
                placeholder="offstage@offstagesessions.com"
                value={socialForm.email}
                onChange={(event) =>
                  setSocialForm({ ...socialForm, email: event.target.value })
                }
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>Spotify URL (Optional)</label>
              <input
                type="url"
                className={shellStyles.formInput}
                placeholder="https://open.spotify.com/..."
                value={socialForm.spotify}
                onChange={(event) =>
                  setSocialForm({ ...socialForm, spotify: event.target.value })
                }
              />
            </div>

            <div className={shellStyles.formGroup}>
              <label className={shellStyles.formLabel}>SoundCloud URL (Optional)</label>
              <input
                type="url"
                className={shellStyles.formInput}
                placeholder="https://soundcloud.com/..."
                value={socialForm.soundcloud}
                onChange={(event) =>
                  setSocialForm({ ...socialForm, soundcloud: event.target.value })
                }
              />
            </div>
          </div>

          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>YouTube Channel URL (Optional)</label>
            <input
              type="url"
              className={shellStyles.formInput}
              placeholder="https://www.youtube.com/@..."
              value={socialForm.youtube}
              onChange={(event) =>
                setSocialForm({ ...socialForm, youtube: event.target.value })
              }
            />
          </div>

          <div className={overviewStyles.socialSaveRow}>
            <button
              type="submit"
              className={shellStyles.btnPrimary}
              disabled={isSavingSocials || isLoadingSocials}
            >
              {isSavingSocials ? 'Saving Links...' : 'Save Social Links'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
