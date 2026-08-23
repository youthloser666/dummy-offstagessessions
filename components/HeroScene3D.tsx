'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, useGLTF, MeshTransmissionMaterial, Center, Float } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';

function GlassOffstageModel({ isHovered, fontSize }: { isHovered: boolean; fontSize: number }) {
    const { nodes } = useGLTF('/3D/offstage_text.glb') as any;
    const groupRef = useRef<THREE.Group>(null);
    const targetScaleVec = useMemo(() => new THREE.Vector3(), []);

    // ─── LEVA CONTROLS ────────────────────────────────────────────
    const glassConfig = useControls('3D Glass Material', {
        transmission: { value: 1.0, min: 0.0, max: 1.0, step: 0.01 },
        thickness: { value: 1.4, min: 0.0, max: 5.0, step: 0.05 },
        roughness: { value: 0.04, min: 0.0, max: 1.0, step: 0.01 },
        ior: { value: 1.48, min: 1.0, max: 2.5, step: 0.01 },
        chromaticAberration: { value: 0.08, min: 0.0, max: 1.0, step: 0.01 },
        anisotropy: { value: 0.15, min: 0.0, max: 1.0, step: 0.01 },
        distortion: { value: 0.25, min: 0.0, max: 2.0, step: 0.05 },
        distortionScale: { value: 0.3, min: 0.0, max: 2.0, step: 0.05 },
        temporalDistortion: { value: 0.06, min: 0.0, max: 1.0, step: 0.01 },
        color: '#ffffff',
        attenuationColor: '#ffffff',
        attenuationDistance: { value: 1.5, min: 0.0, max: 10.0, step: 0.1 },
        samples: { value: 6, min: 1, max: 16, step: 1 },
        resolution: { value: 256, options: [128, 256, 512, 1024] },
        backside: true,
    });

    const animConfig = useControls('3D Position & Motion', {
        scaleMultiplier: { value: 1.0, min: 0.5, max: 2.0, step: 0.02 },
        offsetX: { value: 0.0, min: -2.0, max: 2.0, step: 0.02 },
        offsetY: { value: 0.0, min: -2.0, max: 2.0, step: 0.02 },
        floatSpeed: { value: 2.0, min: 0.0, max: 5.0, step: 0.1 },
        floatIntensity: { value: 0.08, min: 0.0, max: 1.0, step: 0.01 },
        parallaxStrength: { value: 0.8, min: 0.0, max: 3.0, step: 0.1 },
    });

    // Base model width ~ 0.127 units
    const baseScale = (fontSize * 4.6 / 0.127) * animConfig.scaleMultiplier;

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Hover reaction: scale up slightly and follow mouse
            const hoverScale = isHovered ? 1.08 : 1.0;
            const currentScale = baseScale * hoverScale;
            targetScaleVec.set(currentScale, currentScale, currentScale);
            groupRef.current.scale.lerp(targetScaleVec, delta * 6);

            // Parallax tilt
            if (animConfig.parallaxStrength > 0) {
                const mult = animConfig.parallaxStrength;
                const targetRotY = (state.pointer.x * Math.PI * mult) / 8;
                const targetRotX = (-state.pointer.y * Math.PI * mult) / 10;

                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 4);
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 4);
            }
        }
    });

    if (!nodes || !nodes.Curve) return null;

    return (
        <group ref={groupRef} position={[animConfig.offsetX, animConfig.offsetY, 0.25]}>
            <Float
                speed={animConfig.floatSpeed}
                rotationIntensity={animConfig.floatIntensity * 0.8}
                floatIntensity={animConfig.floatIntensity}
            >
                <Center rotation={[Math.PI / 2, 0, 0]}>
                    <mesh geometry={nodes.Curve.geometry}>
                        <MeshTransmissionMaterial
                            backside={glassConfig.backside}
                            samples={glassConfig.samples}
                            resolution={glassConfig.resolution}
                            transmission={glassConfig.transmission}
                            roughness={glassConfig.roughness}
                            thickness={glassConfig.thickness}
                            ior={glassConfig.ior}
                            chromaticAberration={glassConfig.chromaticAberration}
                            anisotropy={glassConfig.anisotropy}
                            distortion={glassConfig.distortion}
                            distortionScale={glassConfig.distortionScale}
                            temporalDistortion={glassConfig.temporalDistortion}
                            color={glassConfig.color}
                            attenuationColor={glassConfig.attenuationColor}
                            attenuationDistance={glassConfig.attenuationDistance}
                        />
                    </mesh>
                </Center>
            </Float>
        </group>
    );
}

export default function HeroScene3D() {
    const heroGroupRef = useRef<THREE.Group>(null);
    const { viewport, size } = useThree();
    const [isHovered, setIsHovered] = useState(false);

    // Responsive font sizing based on viewport width
    const fontSize = useMemo(() => {
        return Math.min(viewport.width * 0.088, 0.72);
    }, [viewport.width]);

    const lineHeight = fontSize * 0.96;

    // Track vertical scroll to smoothly move hero text upward
    useEffect(() => {
        let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
        const handleScroll = () => {
            if (heroGroupRef.current) {
                const scrollY = window.scrollY;
                // Convert screen pixel scroll to Three.js units
                const unitPerPixel = viewport.height / (window.innerHeight || 1);
                heroGroupRef.current.position.y = scrollY * unitPerPixel;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [viewport.height]);

    return (
        <group
            ref={heroGroupRef}
            position={[0, 0, 0.1]}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
        >
            {/* LINE 1: THE BEST */}
            <Text
                font="/font/Moderniz.otf"
                fontSize={fontSize}
                position={[0, lineHeight, 0]}
                anchorX="center"
                anchorY="middle"
                color="#ffffff"
                letterSpacing={-0.03}
            >
                THE BEST
            </Text>

            {/* LINE 2: MOMENTS ARE */}
            <Text
                font="/font/Moderniz.otf"
                fontSize={fontSize}
                position={[0, 0, 0]}
                anchorX="center"
                anchorY="middle"
                color="#ffffff"
                letterSpacing={-0.03}
            >
                MOMENTS ARE
            </Text>

            {/* LINE 3: MADE + 3D Glass OFFSTAGE */}
            <group position={[0, -lineHeight, 0]}>
                {/* MADE on the left */}
                <Text
                    font="/font/Moderniz.otf"
                    fontSize={fontSize}
                    position={[-fontSize * 1.7, 0, 0]}
                    anchorX="center"
                    anchorY="middle"
                    color="#ffffff"
                    letterSpacing={-0.03}
                >
                    MADE
                </Text>

                {/* 3D Glass OFFSTAGE on the right */}
                <group position={[fontSize * 1.35, 0, 0]}>
                    <GlassOffstageModel isHovered={isHovered} fontSize={fontSize} />
                </group>
            </group>
        </group>
    );
}

useGLTF.preload('/3D/offstage_text.glb');
