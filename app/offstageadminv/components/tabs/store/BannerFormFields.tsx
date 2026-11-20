'use client';

import React from 'react';
import type { ShopBannerFormDraft } from '../../../types';
import shellStyles from '../../../styles/adminShell.module.css';
import storeStyles from '../../../styles/adminStore.module.css';
import { BannerUploadBox } from './BannerUploadBox';

export interface BannerEditableValues {
  title: string;
  category: string;
  price?: string;
  image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  button_text?: string;
  display_order: number;
  active: boolean;
  hide_title?: boolean;
  hide_price?: boolean;
  hide_button?: boolean;
}

interface BannerFormFieldsProps {
  values: BannerEditableValues;
  desktopPreviewUrl: string | null;
  mobilePreviewUrl: string | null;
  isDesktopUploading: boolean;
  isMobileUploading: boolean;
  activeCheckboxLabel: string;
  onFieldChange: <K extends keyof ShopBannerFormDraft>(
    field: K,
    value: ShopBannerFormDraft[K]
  ) => void;
  onUploadDesktop: (file: File) => void;
  onUploadMobile: (file: File) => void;
  onClearDesktop: () => void;
  onClearMobile: () => void;
}

export function BannerFormFields({
  values,
  desktopPreviewUrl,
  mobilePreviewUrl,
  isDesktopUploading,
  isMobileUploading,
  activeCheckboxLabel,
  onFieldChange,
  onUploadDesktop,
  onUploadMobile,
  onClearDesktop,
  onClearMobile,
}: BannerFormFieldsProps) {
  return (
    <>
      <div className={storeStyles.bannerDualGrid}>
        <BannerUploadBox
          title="Banner Khusus Desktop"
          specLabel="1920 x 600px (Wide)"
          imageUrl={values.image_url || ''}
          previewUrl={desktopPreviewUrl}
          isUploading={isDesktopUploading}
          uploadingLabel="Uploading desktop banner..."
          emptyPromptTitle="Upload Desktop Banner Image"
          emptyPromptSub="Click to pick a landscape editorial photo"
          urlPlaceholder="https://... (Desktop banner URL)"
          statusReadyLabel="Desktop banner ready"
          previewAlt="Desktop banner preview"
          isRequired={!values.mobile_image_url?.trim()}
          onUploadFile={onUploadDesktop}
          onUrlChange={(url) => onFieldChange('image_url', url)}
          onClear={onClearDesktop}
        />

        <BannerUploadBox
          title="Banner Khusus Mobile (Opsional)"
          specLabel="900 x 1200px (Portrait)"
          imageUrl={values.mobile_image_url || ''}
          previewUrl={mobilePreviewUrl}
          isUploading={isMobileUploading}
          uploadingLabel="Uploading mobile banner..."
          emptyPromptTitle="Upload Mobile Portrait Banner"
          emptyPromptSub="Opsional — gambar khusus rasio vertikal untuk HP"
          urlPlaceholder="https://... (Optional mobile portrait URL)"
          statusReadyLabel="Mobile banner ready"
          previewAlt="Mobile banner preview"
          onUploadFile={onUploadMobile}
          onUrlChange={(url) => onFieldChange('mobile_image_url', url)}
          onClear={onClearMobile}
        />
      </div>

      <div className={storeStyles.toggleCheckboxesRow}>
        <label className={shellStyles.checkboxLabel}>
          <input
            type="checkbox"
            checked={Boolean(values.hide_title)}
            onChange={(event) => onFieldChange('hide_title', event.target.checked)}
          />
          <span>Hide Banner Title</span>
        </label>

        <label className={shellStyles.checkboxLabel}>
          <input
            type="checkbox"
            checked={Boolean(values.hide_price)}
            onChange={(event) => onFieldChange('hide_price', event.target.checked)}
          />
          <span>Hide Price Tag</span>
        </label>

        <label className={shellStyles.checkboxLabel}>
          <input
            type="checkbox"
            checked={Boolean(values.hide_button)}
            onChange={(event) => onFieldChange('hide_button', event.target.checked)}
          />
          <span>Hide Action Button</span>
        </label>
      </div>

      <div className={shellStyles.formGrid2}>
        {!values.hide_title && (
          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Headline / Title *</label>
            <input
              type="text"
              className={shellStyles.formInput}
              placeholder="e.g. Heavyweight Acid Wash Hoodie"
              value={values.title || ''}
              onChange={(event) => onFieldChange('title', event.target.value)}
              required
            />
          </div>
        )}

        <div className={shellStyles.formGroup}>
          <label className={shellStyles.formLabel}>Category / Eyebrow</label>
          <input
            type="text"
            className={shellStyles.formInput}
            placeholder="e.g. FW26 DROP / OUTERWEAR"
            value={values.category || ''}
            onChange={(event) => onFieldChange('category', event.target.value)}
          />
        </div>

        {!values.hide_price && (
          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Price Display</label>
            <input
              type="text"
              className={shellStyles.formInput}
              placeholder="e.g. $65 USD"
              value={values.price || ''}
              onChange={(event) => onFieldChange('price', event.target.value)}
            />
          </div>
        )}

        {!values.hide_button && (
          <div className={shellStyles.formGroup}>
            <label className={shellStyles.formLabel}>Button Label</label>
            <input
              type="text"
              className={shellStyles.formInput}
              placeholder="e.g. SHOP DROP"
              value={values.button_text || ''}
              onChange={(event) => onFieldChange('button_text', event.target.value)}
            />
          </div>
        )}

        <div className={shellStyles.formGroup}>
          <label className={shellStyles.formLabel}>Destination Link URL</label>
          <input
            type="text"
            className={shellStyles.formInput}
            placeholder="/shop or https://..."
            value={values.link_url || ''}
            onChange={(event) => onFieldChange('link_url', event.target.value)}
          />
        </div>

        <div className={shellStyles.formGroup}>
          <label className={shellStyles.formLabel}>Display Order</label>
          <input
            type="number"
            min={1}
            className={shellStyles.formInput}
            value={values.display_order ?? 1}
            onChange={(event) =>
              onFieldChange('display_order', Number.parseInt(event.target.value, 10) || 1)
            }
          />
        </div>
      </div>

      <div className={shellStyles.formGroup}>
        <label className={shellStyles.checkboxLabel}>
          <input
            type="checkbox"
            checked={values.active !== false}
            onChange={(event) => onFieldChange('active', event.target.checked)}
          />
          <span>{activeCheckboxLabel}</span>
        </label>
      </div>
    </>
  );
}

