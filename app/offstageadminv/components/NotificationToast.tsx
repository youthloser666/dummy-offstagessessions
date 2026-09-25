'use client';

import React from 'react';
import styles from '../admin.module.css';
import { NotificationState } from '../types';

interface NotificationToastProps {
  notification: NotificationState | null;
}

export default function NotificationToast({ notification }: NotificationToastProps) {
  if (!notification) return null;

  return (
    <div
      className={`${styles.notification} ${
        notification.type === 'success' ? styles.notificationSuccess : styles.notificationError
      }`}
    >
      {notification.message}
    </div>
  );
}
