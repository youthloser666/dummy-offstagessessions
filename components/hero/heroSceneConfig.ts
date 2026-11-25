// ─── MATERIAL & MOTION CONFIGURATION FOR 3D GLASS ──
export const GLASS_CONFIG = {
    transmission: 1.0,
    thickness: 0.18,
    roughness: 0.02,
    ior: 1.12,
    chromaticAberration: 0.08,
    anisotropy: 0.3,
    distortion: 0.08,
    distortionScale: 1.2,
    temporalDistortion: 0.01,
    color: '#ffffff',
    attenuationColor: '#ffffff',
    attenuationDistance: 2.2,
    samples: 9,
    resolution: 256,
    backside: true,
};

export const MOTION_CONFIG = {
    scaleMultiplier: 1.15,
    floatSpeed: 2.8,
    floatIntensity: 0.09,
};

// ─── NEON GLOW CONFIGURATION ──
export const NEON_ACID_COLOR = '#c8ff00';
export const NEON_AURA_COLOR = '#a6ff00';
