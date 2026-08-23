'use client';

import React from 'react';
import { Leva } from 'leva';

export default function LevaProvider() {
    return (
        <div
            id="leva-root"
            style={{
                position: 'fixed',
                top: 16,
                right: 16,
                zIndex: 999999,
                pointerEvents: 'auto',
            }}
        >
            <Leva collapsed={false} oneLineLabels={false} />
        </div>
    );
}
