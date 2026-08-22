'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';

// Transisi murni opacity halus (0.2s) tanpa y/scale agar bebas konflik dengan Lenis
const pageVariants: Variants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.15,
            ease: 'easeIn',
        },
    },
};

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <motion.div
            key={pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%', willChange: 'opacity' }}
        >
            {children}
        </motion.div>
    );
}
