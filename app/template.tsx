'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* Fullscreen Curtain: Turun dari ATAS (-100%) ke BAWAH (100%) */}
            <motion.div
                initial={{ y: '0%' }}
                animate={{ y: '100%' }}
                transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: '#000000',
                    zIndex: 99999,
                    pointerEvents: 'none',
                }}
            >
                {/* Acid Laser Line di sisi atas tirai */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        backgroundColor: 'var(--acid, #00FF00)',
                        boxShadow: '0 0 16px var(--acid, #00FF00), 0 0 32px var(--acid, #00FF00)',
                    }}
                />
            </motion.div>

            {/* Page Content Entrance: Masuk dengan gerakan agak turun selaras dengan tirai */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
                {children}
            </motion.div>
        </>
    );
}


