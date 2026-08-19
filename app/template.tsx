'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 15,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: 15,
        transition: {
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: 'opacity, transform' }}
        >
            {children}
        </motion.div>
    );
}
