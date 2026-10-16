'use client';

import React, { useRef } from 'react';
import styles from '../../admin.module.css';
import { ShopBanner } from '../../types';

interface EditBannerModalProps {
  editingBanner: ShopBanner | null;
  setEditingBanner: (banner: ShopBanner | null) => void;
  editBannerUploading: boolean;
  editBannerPreview: string | null;
  handleEditBannerUpload: (file: File) => void;
  handleUpdateBanner: (e: React.FormEvent) => void;
}

export default function EditBannerModal({
  editingBanner,
  setEditingBanner,
  editBannerUploading,
  editBannerPreview,
  handleEditBannerUpload,
  handleUpdateBanner,
}: EditBannerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editingBanner) return null;

  const currentImage = editBannerPreview || editingBanner.image_url;

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
          {/* Banner Image Upload & Preview */}
          <div className={styles.formGroup} style={{ marginBottom: 20 }}>
            <label className={styles.formLabel}>Banner Image (Click to Upload / Replace)</label>
            <div
              className={styles.dropzoneContainer}
              onClick={() => fileInputRef.current?.click()}
              style={{ minHeight: 160 }}
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
                <div className={styles.dropzonePrompt}>Uploading optimized WebP image...</div>
              ) : currentImage ? (
                <div className={styles.dropzonePreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentImage}
                    alt="Banner preview"
                    className={styles.dropzonePreviewImg}
                    style={{ maxHeight: 180, objectFit: 'cover', width: '100%', borderRadius: 6 }}
                  />
                  <div className={styles.dropzoneOverlay}>Click to change image</div>
                </div>
              ) : (
                <div className={styles.dropzonePrompt}>
                  <span>Click to choose banner photo (auto-converts to WebP)</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: 8 }}>
              <input
                type="url"
                className={styles.formInput}
                placeholder="Or paste external Image URL directly"
                value={editingBanner.image_url}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, image_url: e.target.value })
                }
              />
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
