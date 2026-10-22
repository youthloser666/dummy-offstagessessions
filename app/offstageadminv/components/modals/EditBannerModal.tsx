'use client';

import React, { useRef } from 'react';
import styles from '../../admin.module.css';
import { ShopBanner } from '../../types';

interface EditBannerModalProps {
  editingBanner: ShopBanner | null;
  setEditingBanner: (banner: ShopBanner | null) => void;
  editBannerUploading: boolean;
  editBannerPreview: string | null;
  setEditBannerPreview?: (preview: string | null) => void;
  handleEditBannerUpload: (file: File) => void;
  editMobileBannerUploading: boolean;
  editMobileBannerPreview: string | null;
  setEditMobileBannerPreview?: (preview: string | null) => void;
  handleEditMobileBannerUpload: (file: File) => void;
  handleUpdateBanner: (e: React.FormEvent) => void;
}

export default function EditBannerModal({
  editingBanner,
  setEditingBanner,
  editBannerUploading,
  editBannerPreview,
  setEditBannerPreview,
  handleEditBannerUpload,
  editMobileBannerUploading,
  editMobileBannerPreview,
  setEditMobileBannerPreview,
  handleEditMobileBannerUpload,
  handleUpdateBanner,
}: EditBannerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  if (!editingBanner) return null;

  const currentImage = editBannerPreview || editingBanner.image_url;
  const currentMobileImage = editMobileBannerPreview !== null ? editMobileBannerPreview : (editingBanner.mobile_image_url || '');

  return (
    <div
      className={styles.modalBackdrop}
      onClick={() => setEditingBanner(null)}
      data-lenis-prevent="true"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Edit Shop Banner</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#86868b' }}>
              Updating slide: <strong style={{ color: '#ffffff' }}>{editingBanner.title}</strong>
            </p>
          </div>
          <button
            className={styles.modalCloseBtn}
            onClick={() => setEditingBanner(null)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleUpdateBanner}>
          {/* VISUALLY DIVIDED: DESKTOP & MOBILE BANNER ASSETS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginBottom: 20,
          }}>
            {/* BOX 1: DESKTOP BANNER */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 8,
              padding: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>🖥️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#ffffff' }}>Banner Khusus Desktop</div>
                    <div style={{ fontSize: 10, color: '#86868b' }}>Tampil di PC / Laptop (&gt; 768px)</div>
                  </div>
                </div>
                {currentImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBanner({ ...editingBanner, image_url: '' });
                      if (setEditBannerPreview) setEditBannerPreview(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ff453a',
                      fontSize: 10,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div
                className={styles.dropzoneContainer}
                onClick={() => fileInputRef.current?.click()}
                style={{ minHeight: 140 }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenFileInput}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleEditBannerUpload(file);
                  }}
                />

                {editBannerUploading ? (
                  <div className={styles.dropzonePrompt}>Uploading desktop WebP...</div>
                ) : currentImage ? (
                  <div className={styles.dropzonePreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentImage}
                      alt="Desktop Banner preview"
                      className={styles.dropzonePreviewImg}
                      style={{ maxHeight: 140, objectFit: 'cover', width: '100%', borderRadius: 6 }}
                    />
                    <div className={styles.dropzoneOverlay}>Click to change desktop image</div>
                  </div>
                ) : (
                  <div className={styles.dropzonePrompt}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 4, opacity: 0.7 }}>
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                    <span>Upload Desktop (Landscape 16:9)</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 8 }}>
                <input
                  type="url"
                  className={styles.formInput}
                  placeholder="Or paste Desktop image URL"
                  value={editingBanner.image_url || ''}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, image_url: e.target.value })
                  }
                />
              </div>
            </div>

            {/* BOX 2: MOBILE BANNER */}
            <div style={{
              background: 'rgba(226, 255, 50, 0.02)',
              border: '1px solid rgba(226, 255, 50, 0.3)',
              borderRadius: 8,
              padding: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>📱</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#e2ff32' }}>Banner Khusus Mobile</div>
                    <div style={{ fontSize: 10, color: '#86868b' }}>Tampil di Layar HP (&le; 768px)</div>
                  </div>
                </div>
                {currentMobileImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBanner({ ...editingBanner, mobile_image_url: '' });
                      if (setEditMobileBannerPreview) setEditMobileBannerPreview(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ff453a',
                      fontSize: 10,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div
                className={styles.dropzoneContainer}
                onClick={() => mobileFileInputRef.current?.click()}
                style={{ minHeight: 140 }}
              >
                <input
                  ref={mobileFileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenFileInput}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleEditMobileBannerUpload(file);
                  }}
                />

                {editMobileBannerUploading ? (
                  <div className={styles.dropzonePrompt}>Uploading mobile banner WebP...</div>
                ) : currentMobileImage ? (
                  <div className={styles.dropzonePreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentMobileImage}
                      alt="Mobile banner preview"
                      className={styles.dropzonePreviewImg}
                      style={{ maxHeight: 140, objectFit: 'cover', width: '100%', borderRadius: 6 }}
                    />
                    <div className={styles.dropzoneOverlay}>Click to change mobile image</div>
                  </div>
                ) : (
                  <div className={styles.dropzonePrompt}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 4, opacity: 0.7 }}>
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    <span>Upload Mobile (Portrait 9:16)</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 8 }}>
                <input
                  type="url"
                  className={styles.formInput}
                  placeholder="Or paste Mobile image URL"
                  value={editingBanner.mobile_image_url || ''}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, mobile_image_url: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Conditionally rendered detail fields */}
          {!editingBanner.hide_title && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Banner Title *</label>
                <input
                  type="text"
                  required={!editingBanner.hide_title}
                  className={styles.formInput}
                  placeholder="e.g. THE STRAPBACK"
                  value={editingBanner.title}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, title: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category / Badge</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. APPAREL, LIMITED DROP"
                  value={editingBanner.category || ''}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, category: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {(!editingBanner.hide_price || !editingBanner.hide_button) && (
            <div className={styles.formRow}>
              {!editingBanner.hide_price && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Price / Tagline</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. $25.00 or Coming Soon"
                    value={editingBanner.price || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, price: e.target.value })
                    }
                  />
                </div>
              )}

              {!editingBanner.hide_button && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CTA Button Text</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. SHOP NOW"
                    value={editingBanner.button_text || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, button_text: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Destination Link URL</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="e.g. /shop or product link"
                value={editingBanner.link_url || ''}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, link_url: e.target.value })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Display Order</label>
              <input
                type="number"
                min="1"
                className={styles.formInput}
                value={editingBanner.display_order ?? 1}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, display_order: parseInt(e.target.value, 10) || 1 })
                }
              />
            </div>
          </div>

          {/* Banner Overlay Checkboxes below Display Order */}
          <div style={{ marginTop: 10, marginBottom: 14, padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 6, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#86868b', marginBottom: 10 }}>
              Banner Text Overlay Options
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#f5f5f7' }}>
                <input
                  type="checkbox"
                  checked={Boolean(editingBanner.hide_title)}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, hide_title: e.target.checked })
                  }
                  style={{ accentColor: '#e2ff32', width: 16, height: 16 }}
                />
                <span>Remove Banner Title &amp; Category</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#f5f5f7' }}>
                <input
                  type="checkbox"
                  checked={Boolean(editingBanner.hide_price)}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, hide_price: e.target.checked })
                  }
                  style={{ accentColor: '#e2ff32', width: 16, height: 16 }}
                />
                <span>Remove Price / Tagline</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#f5f5f7' }}>
                <input
                  type="checkbox"
                  checked={Boolean(editingBanner.hide_button)}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, hide_button: e.target.checked })
                  }
                  style={{ accentColor: '#e2ff32', width: 16, height: 16 }}
                />
                <span>Remove Shop Button</span>
              </label>
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginTop: 4, marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#f5f5f7' }}>
              <input
                type="checkbox"
                checked={editingBanner.active !== false}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, active: e.target.checked })
                }
                style={{ accentColor: '#e2ff32', width: 16, height: 16 }}
              />
              <span>Active (Show in Shop Hero Carousel)</span>
            </label>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setEditingBanner(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editBannerUploading}
              className={styles.btnPrimary}
            >
              {editBannerUploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
