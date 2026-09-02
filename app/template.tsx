'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

// Transisi murni opacity halus (0.22s) tanpa y/scale agar bebas konflik dengan Lenis
const pageVariants: Variants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.22,
            ease: [0.25, 1, 0.5, 1],
        },
    },
};

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            style={{ width: '100%' }}
        >
            {children}
        </motion.div>
    );
}
