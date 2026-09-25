'use client';

import React from 'react';
import styles from '../../admin.module.css';
import { SocialForm } from '../../types';

interface SocialsTabProps {
  socialForm: SocialForm;
  setSocialForm: React.Dispatch<React.SetStateAction<SocialForm>>;
  loadingSocials: boolean;
  savingSocials: boolean;
  socialTableMissing: boolean;
  loadSocials: () => void;
  handleSaveSocials: (e: React.FormEvent) => void;
  notify: (type: 'success' | 'error', message: string) => void;
}

export default function SocialsTab({
  socialForm,
  setSocialForm,
  loadingSocials,
  savingSocials,
  socialTableMissing,
  loadSocials,
  handleSaveSocials,
  notify,
}: SocialsTabProps) {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Social Media &amp; Channel Links</h1>
          <p className={styles.pageDesc}>
            Manage the official links for Instagram, TikTok, Facebook, and contact email across the Offstage Sessions website.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={loadSocials}
            disabled={loadingSocials}
            className={styles.btnSecondary}
          >
            {loadingSocials ? 'Loading...' : 'Refresh'}
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={styles.btnPrimary}
            style={{ textDecoration: 'none' }}
          >
            Open Live Site ↗
          </a>
        </div>
      </div>

      {socialTableMissing && (
        <div
          style={{
            backgroundColor: 'rgba(226, 255, 50, 0.08)',
            border: '1px solid rgba(226, 255, 50, 0.3)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ color: '#e2ff32', fontWeight: 600, fontSize: 14 }}>
            ⚡ Supabase Table Setup Notice:
          </div>
          <div style={{ color: '#c0c0c0', fontSize: 13, lineHeight: 1.5 }}>
            Tabel <code>site_settings</code> belum dibuat di Supabase kamu. Supaya link social media bisa tersimpan permanen di cloud database, silakan buka <strong>Supabase Dashboard &gt; SQL Editor</strong> dan jalankan kode SQL di bawah ini:
          </div>
          <pre
            style={{
              backgroundColor: '#0a0a0a',
              padding: 12,
              borderRadius: 8,
              fontSize: 12,
              color: '#55f385',
              overflowX: 'auto',
              border: '1px solid #222',
            }}
          >{`CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin write site_settings" ON public.site_settings FOR ALL USING (true);`}</pre>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin write site_settings" ON public.site_settings FOR ALL USING (true);`);
              notify('success', 'SQL copied to clipboard! Paste in Supabase SQL Editor.');
            }}
            className={styles.btnSecondary}
            style={{ alignSelf: 'flex-start', fontSize: 12 }}
          >
            📋 Copy SQL to Clipboard
          </button>
        </div>
      )}

      <div className={styles.socialsSplit}>
        {/* Form Settings */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle} style={{ marginBottom: 16 }}>Edit Social Channels</h3>

          <form onSubmit={handleSaveSocials}>
            <div className={styles.formGroup} style={{ marginBottom: 16 }}>
              <label className={styles.formLabel}>Instagram Profile URL *</label>
              <input
                type="url"
                className={styles.formInput}
                value={socialForm.instagram}
                onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
                placeholder="https://instagram.com/offstagesession"
                required
              />
              <small style={{ color: '#777', fontSize: 11, marginTop: 4, display: 'block' }}>
                Appears on the floating Social Dock, Footer, and Behold Feed links.
              </small>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 16 }}>
              <label className={styles.formLabel}>TikTok Profile URL *</label>
              <input
                type="url"
                className={styles.formInput}
                value={socialForm.tiktok}
                onChange={(e) => setSocialForm({ ...socialForm, tiktok: e.target.value })}
                placeholder="https://www.tiktok.com/@offstagesessions"
                required
              />
              <small style={{ color: '#777', fontSize: 11, marginTop: 4, display: 'block' }}>
                Appears on the floating Social Dock and Footer.
              </small>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 16 }}>
              <label className={styles.formLabel}>Facebook Page URL *</label>
              <input
                type="url"
                className={styles.formInput}
                value={socialForm.facebook}
                onChange={(e) => setSocialForm({ ...socialForm, facebook: e.target.value })}
                placeholder="https://www.facebook.com/offstagesessions"
                required
              />
              <small style={{ color: '#777', fontSize: 11, marginTop: 4, display: 'block' }}>
                Appears on the floating Social Dock, Footer, and default Media Archive album links.
              </small>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 16 }}>
              <label className={styles.formLabel}>Official Contact Email *</label>
              <input
                type="email"
                className={styles.formInput}
                value={socialForm.email}
                onChange={(e) => setSocialForm({ ...socialForm, email: e.target.value })}
                placeholder="offstage@offstagesessions.com"
                required
              />
              <small style={{ color: '#777', fontSize: 11, marginTop: 4, display: 'block' }}>
                Displayed in the footer direct email link and inquiry receipts.
              </small>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 16 }}>
              <label className={styles.formLabel}>Spotify Profile / Playlist (Optional)</label>
              <input
                type="url"
                className={styles.formInput}
                value={socialForm.spotify || ''}
                onChange={(e) => setSocialForm({ ...socialForm, spotify: e.target.value })}
                placeholder="https://open.spotify.com/artist/..."
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 16 }}>
              <label className={styles.formLabel}>SoundCloud URL (Optional)</label>
              <input
                type="url"
                className={styles.formInput}
                value={socialForm.soundcloud || ''}
                onChange={(e) => setSocialForm({ ...socialForm, soundcloud: e.target.value })}
                placeholder="https://soundcloud.com/..."
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 24 }}>
              <label className={styles.formLabel}>YouTube Channel URL (Optional)</label>
              <input
                type="url"
                className={styles.formInput}
                value={socialForm.youtube || ''}
                onChange={(e) => setSocialForm({ ...socialForm, youtube: e.target.value })}
                placeholder="https://youtube.com/@..."
              />
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={savingSocials}
                className={styles.btnPrimary}
                style={{ padding: '10px 24px' }}
              >
                {savingSocials ? 'Saving Changes...' : 'Save Social Media Links'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSocialForm({
                    instagram: 'https://instagram.com/offstagesession',
                    tiktok: 'https://www.tiktok.com/@offstagesessions',
                    facebook: 'https://www.facebook.com/offstagesessions',
                    email: 'offstage@offstagesessions.com',
                    spotify: '',
                    soundcloud: '',
                    youtube: '',
                  });
                  notify('success', 'Reset fields to default URLs');
                }}
                className={styles.btnSecondary}
              >
                Reset to Default
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle} style={{ marginBottom: 12 }}>Live Channels Preview</h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
              Click any channel to test that the destination link opens correctly:
            </p>

            <div className={styles.channelPreviewList}>
              <a
                href={socialForm.instagram}
                target="_blank"
                rel="noreferrer"
                className={styles.channelPreviewItem}
              >
                <span>📸 Instagram</span>
                <span>Open ↗</span>
              </a>

              <a
                href={socialForm.tiktok}
                target="_blank"
                rel="noreferrer"
                className={styles.channelPreviewItem}
              >
                <span>🎵 TikTok</span>
                <span>Open ↗</span>
              </a>

              <a
                href={socialForm.facebook}
                target="_blank"
                rel="noreferrer"
                className={styles.channelPreviewItem}
              >
                <span>📘 Facebook</span>
                <span>Open ↗</span>
              </a>

              <a
                href={`mailto:${socialForm.email}`}
                className={styles.channelPreviewItem}
              >
                <span>✉️ Direct Email</span>
                <span>Send ↗</span>
              </a>

              {socialForm.spotify && (
                <a
                  href={socialForm.spotify}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.channelPreviewItem}
                >
                  <span>🎧 Spotify</span>
                  <span>Open ↗</span>
                </a>
              )}

              {socialForm.soundcloud && (
                <a
                  href={socialForm.soundcloud}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.channelPreviewItem}
                >
                  <span>☁️ SoundCloud</span>
                  <span>Open ↗</span>
                </a>
              )}

              {socialForm.youtube && (
                <a
                  href={socialForm.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.channelPreviewItem}
                >
                  <span>▶️ YouTube</span>
                  <span>Open ↗</span>
                </a>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className={styles.trafficLiveDot} />
              <h4 className={styles.cardTitle} style={{ fontSize: 13 }}>Automatic Live Sync</h4>
            </div>
            <p style={{ color: '#888', fontSize: 12, lineHeight: 1.5, margin: 0 }}>
              Any changes saved here will immediately update the fixed <strong>Social Dock</strong> on the right screen edge and the bottom <strong>Footer</strong> across all visitor sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
