'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useControls } from 'leva';
import GridBackground from './GridBackground';
import GridLines3D from './GridLines3D';
import HeroScene3D from './HeroScene3D';

function SceneLighting() {
    const lightConfig = useControls('3D Scene Lighting', {
        ambientIntensity: { value: 0.9, min: 0.0, max: 3.0, step: 0.1 },
        directionalIntensity: { value: 2.2, min: 0.0, max: 5.0, step: 0.1 },
        envPreset: {
            value: 'city',
            options: ['city', 'studio', 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'park', 'lobby'],
        },
    });

    return (
        <>
            <ambientLight intensity={lightConfig.ambientIntensity} />
            <directionalLight position={[10, 10, 8]} intensity={lightConfig.directionalIntensity} />
            <directionalLight position={[-10, -10, 5]} intensity={lightConfig.directionalIntensity * 0.5} />
            <Environment preset={lightConfig.envPreset as any} />
        </>
    );
}

export default function GlobalBackgroundCanvas() {
    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 60 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 1.5]}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'auto',
                }}
            >
                <Suspense fallback={null}>
                    <SceneLighting />

                    {/* Layer 0: Infinite 3D Photo Grid Collage */}
                    <GridBackground />

                    {/* Layer 1: 40px Square Grid Lines Overlay */}
                    <GridLines3D />

                    {/* Layer 2 & 3: Hero Moderniz 3D Text + 3D Glass OFFSTAGE (Refracts L0 & L1) */}
                    <HeroScene3D />
                </Suspense>
            </Canvas>
        </div>
    );
}
