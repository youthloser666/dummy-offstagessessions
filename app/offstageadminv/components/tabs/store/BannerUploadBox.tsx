'use client';

import React, { useRef } from 'react';
import shellStyles from '../../../styles/adminShell.module.css';
import storeStyles from '../../../styles/adminStore.module.css';

interface BannerUploadBoxProps {
  title: string;
  specLabel: string;
  imageUrl: string;
  previewUrl: string | null;
  isUploading: boolean;
  uploadingLabel: string;
  emptyPromptTitle: string;
  emptyPromptSub: string;
  urlPlaceholder: string;
  statusReadyLabel: string;
  previewAlt: string;
  isRequired?: boolean;
  onUploadFile: (file: File) => void;
  onUrlChange: (url: string) => void;
  onClear: () => void;
}

export function BannerUploadBox({
  title,
  specLabel,
  imageUrl,
  previewUrl,
  isUploading,
  uploadingLabel,
  emptyPromptTitle,
  emptyPromptSub,
  urlPlaceholder,
  statusReadyLabel,
  previewAlt,
  isRequired = false,
  onUploadFile,
  onUrlChange,
  onClear,
}: BannerUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const effectivePreview = previewUrl || imageUrl;

  const handleOpenPicker = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadFile(file);
      event.target.value = '';
    }
  };

  return (
    <div className={storeStyles.bannerUploadBox}>
      <div className={storeStyles.bannerUploadHeader}>
        <span className={storeStyles.bannerUploadTitle}>
          {title}
          {isRequired ? ' *' : ''}
        </span>
        <span className={storeStyles.bannerUploadSpec}>{specLabel}</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={shellStyles.hiddenFileInput}
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {isUploading ? (
        <div className={storeStyles.bannerDropzone}>
          <span className={storeStyles.bannerUploadPromptTitle}>{uploadingLabel}</span>
          <span className={storeStyles.bannerUploadPromptSub}>Converting to WebP...</span>
        </div>
      ) : effectivePreview ? (
        <>
          <div
            className={storeStyles.bannerPreviewFrame}
            role="button"
            tabIndex={0}
            onClick={handleOpenPicker}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleOpenPicker();
              }
            }}
          >
            <img src={effectivePreview} alt={previewAlt} className={storeStyles.bannerPreviewImg} />
          </div>
          <div className={storeStyles.bannerPreviewActions}>
            <span className={storeStyles.bannerUploadStatusOk}>{statusReadyLabel}</span>
            <div className={shellStyles.tableActionsRow}>
              <button type="button" className={shellStyles.btnEdit} onClick={handleOpenPicker}>
                Replace
              </button>
              <button type="button" className={shellStyles.btnDanger} onClick={onClear}>
                Clear
              </button>
            </div>
          </div>
        </>
      ) : (
        <button
          type="button"
          className={storeStyles.bannerDropzone}
          onClick={handleOpenPicker}
        >
          <span className={storeStyles.bannerUploadPromptTitle}>{emptyPromptTitle}</span>
          <span className={storeStyles.bannerUploadPromptSub}>{emptyPromptSub}</span>
        </button>
      )}

      <input
        type="text"
        className={shellStyles.formInput}
        placeholder={urlPlaceholder}
        value={imageUrl}
        onChange={(event) => onUrlChange(event.target.value)}
        required={isRequired}
      />
    </div>
  );
}

