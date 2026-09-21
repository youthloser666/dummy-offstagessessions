'use client';

import React from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ width: '100%' }}>
            {children}
        </div>
    );
}
