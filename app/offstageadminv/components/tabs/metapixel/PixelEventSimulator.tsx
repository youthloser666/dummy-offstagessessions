'use client';

import React from 'react';
import type { SimulatableStandardPixelEvent } from '../../../hooks/usePixelEventSimulator';
import metaStyles from '../../../styles/adminMetaPixel.module.css';
import overviewStyles from '../../../styles/adminOverview.module.css';
import shellStyles from '../../../styles/adminShell.module.css';

interface StandardEventButtonSpec {
  eventName: SimulatableStandardPixelEvent;
  subtitle: string;
}

const STANDARD_EVENT_BUTTONS: StandardEventButtonSpec[] = [
  { eventName: 'PageView', subtitle: 'Track current route view' },
  { eventName: 'ViewContent', subtitle: 'Show showcase ($25.00 USD)' },
  { eventName: 'AddToCart', subtitle: 'Hoodie cart add ($45.00 USD)' },
  { eventName: 'InitiateCheckout', subtitle: 'Checkout flow ($75.00 USD)' },
  { eventName: 'Lead', subtitle: 'VIP table inquiry ($150.00 USD)' },
  { eventName: 'Contact', subtitle: 'Direct booking inquiry action' },
  { eventName: 'Search', subtitle: 'Genre search ("Techno Baltimore")' },
];

interface PixelEventSimulatorProps {
  customEventName: string;
  customEventPayload: string;
  onCustomEventNameChange: (value: string) => void;
  onCustomEventPayloadChange: (value: string) => void;
  onFireStandardEvent: (eventName: SimulatableStandardPixelEvent) => void;
  onFireCustomEvent: (event: React.FormEvent) => void;
}

export function PixelEventSimulator({
  customEventName,
  customEventPayload,
  onCustomEventNameChange,
  onCustomEventPayloadChange,
  onFireStandardEvent,
  onFireCustomEvent,
}: PixelEventSimulatorProps) {
  return (
    <div className={shellStyles.card}>
      <div className={shellStyles.cardHeader}>
        <div>
          <h3 className={shellStyles.cardTitle}>Live Event Simulator</h3>
          <p className={shellStyles.cardSubtitle}>
            Dispatch real Meta Pixel + GA4 events directly from your active session
          </p>
        </div>
      </div>

      <div className={metaStyles.simulatorButtonsGrid}>
        {STANDARD_EVENT_BUTTONS.map((spec) => (
          <button
            key={spec.eventName}
            type="button"
            className={metaStyles.simulatorEventBtn}
            onClick={() => onFireStandardEvent(spec.eventName)}
          >
            <span className={metaStyles.simulatorEventName}>{spec.eventName}</span>
            <span className={metaStyles.simulatorEventHint}>{spec.subtitle}</span>
          </button>
        ))}
      </div>

      <form className={metaStyles.customEventDivider} onSubmit={onFireCustomEvent}>
        <h4 className={metaStyles.customEventHeading}>Custom Pixel Event Trigger</h4>

        <div className={shellStyles.formGroup}>
          <label className={shellStyles.formLabel}>Custom Event Name</label>
          <input
            type="text"
            className={shellStyles.formInput}
            placeholder="e.g. PlayAftermovie or ClickTicketTier"
            value={customEventName}
            onChange={(event) => onCustomEventNameChange(event.target.value)}
          />
        </div>

        <div className={shellStyles.formGroup}>
          <label className={shellStyles.formLabel}>JSON Payload Parameters</label>
          <textarea
            className={`${shellStyles.formInput} ${overviewStyles.textareaInput} ${overviewStyles.codeText}`}
            value={customEventPayload}
            onChange={(event) => onCustomEventPayloadChange(event.target.value)}
          />
        </div>

        <button type="submit" className={shellStyles.btnPrimary}>
          Fire Custom Event
        </button>
      </form>
    </div>
  );
}

