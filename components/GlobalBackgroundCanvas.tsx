'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { usePathname } from 'next/navigation';
import GridBackground from './GridBackground';
import GridLines3D from './GridLines3D';
import HeroVideoBackground from './HeroVideoBackground';
import HeroScene3D from './HeroScene3D';

export default function GlobalBackgroundCanvas() {
    const pathname = usePathname();
    const isHome = pathname === '/';

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
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 8]} intensity={1.7} />
                <directionalLight position={[-10, -10, 5]} intensity={0.85} />

                <Suspense fallback={null}>
                    {/* User Selected Environment Preset: Studio */}
                    <Environment preset="studio" />

                    {/* Layer 0: Infinite 3D Photo Grid Collage */}
                    <GridBackground />

                    {/* Layer 1: 40px Square Grid Lines Overlay */}
                    <GridLines3D />

                    {/* Layer 1.5: 3D Video Background Plane (Directly behind Hero 3D Text & Glass) */}
                    <HeroVideoBackground visible={isHome} />

                    {/* Layer 2 & 3: Hero Moderniz 3D Text + 3D Glass OFFSTAGE (Warm GPU Caching) */}
                    <HeroScene3D visible={isHome} />
                </Suspense>
            </Canvas>
        </div>
    );
}
