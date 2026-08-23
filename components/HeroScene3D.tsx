'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, useGLTF, MeshTransmissionMaterial, Center, Float } from '@react-three/drei';
import * as THREE from 'three';

// ─── EXACT MATERIAL & POSITION CONSTANTS FROM USER CONFIGURATION ──
const GLASS_CONFIG = {
    transmission: 1.0,
    thickness: 0.15,
    roughness: 0.0,
    ior: 1.06,
    chromaticAberration: 0.07,
    anisotropy: 0.26,
    distortion: 0.05,
    distortionScale: 1.2,
    temporalDistortion: 0.01,
    color: '#f5f5f5',
    attenuationColor: '#ffffff',
    attenuationDistance: 2.2,
    samples: 9,
    resolution: 256,
    backside: true,
};

const MOTION_CONFIG = {
    scaleMultiplier: 1.18,
    offsetX: 1.42,
    offsetY: 0.0,
    floatSpeed: 3.0,
    floatIntensity: 0.08,
    parallaxStrength: 3.0,
};

function GlassOffstageModel({ isHovered, fontSize }: { isHovered: boolean; fontSize: number }) {
    const { nodes } = useGLTF('/3D/offstage_text.glb') as any;
    const groupRef = useRef<THREE.Group>(null);
    const targetScaleVec = useMemo(() => new THREE.Vector3(), []);

    // Base model width ~ 0.127 units
    const baseScale = (fontSize * 4.6 / 0.127) * MOTION_CONFIG.scaleMultiplier;

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Hover reaction: scale up slightly and smoothly follow mouse
            const hoverScale = isHovered ? 1.08 : 1.0;
            const currentScale = baseScale * hoverScale;
            targetScaleVec.set(currentScale, currentScale, currentScale);
            groupRef.current.scale.lerp(targetScaleVec, delta * 6);

            // Parallax tilt (strength 3.0)
            const mult = MOTION_CONFIG.parallaxStrength;
            const targetRotY = (state.pointer.x * Math.PI * mult) / 8;
            const targetRotX = (-state.pointer.y * Math.PI * mult) / 10;

            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 4);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 4);
        }
    });

    if (!nodes || !nodes.Curve) return null;

    return (
        <group ref={groupRef} position={[MOTION_CONFIG.offsetX, MOTION_CONFIG.offsetY, 0.25]}>
            <Float
                speed={MOTION_CONFIG.floatSpeed}
                rotationIntensity={MOTION_CONFIG.floatIntensity * 0.8}
                floatIntensity={MOTION_CONFIG.floatIntensity}
            >
                <Center rotation={[Math.PI / 2, 0, 0]}>
                    <mesh geometry={nodes.Curve.geometry}>
                        <MeshTransmissionMaterial
                            backside={GLASS_CONFIG.backside}
                            samples={GLASS_CONFIG.samples}
                            resolution={GLASS_CONFIG.resolution}
                            transmission={GLASS_CONFIG.transmission}
                            roughness={GLASS_CONFIG.roughness}
                            thickness={GLASS_CONFIG.thickness}
                            ior={GLASS_CONFIG.ior}
                            chromaticAberration={GLASS_CONFIG.chromaticAberration}
                            anisotropy={GLASS_CONFIG.anisotropy}
                            distortion={GLASS_CONFIG.distortion}
                            distortionScale={GLASS_CONFIG.distortionScale}
                            temporalDistortion={GLASS_CONFIG.temporalDistortion}
                            color={GLASS_CONFIG.color}
                            attenuationColor={GLASS_CONFIG.attenuationColor}
                            attenuationDistance={GLASS_CONFIG.attenuationDistance}
                        />
                    </mesh>
                </Center>
            </Float>
        </group>
    );
}

export default function HeroScene3D() {
    const heroGroupRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();
    const [isHovered, setIsHovered] = useState(false);

    // Responsive font sizing based on viewport width
    const fontSize = useMemo(() => {
        return Math.min(viewport.width * 0.088, 0.72);
    }, [viewport.width]);

    const lineHeight = fontSize * 0.96;

    // Track vertical scroll to smoothly move hero text upward
    useEffect(() => {
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
