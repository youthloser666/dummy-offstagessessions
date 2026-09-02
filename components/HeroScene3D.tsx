'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, useGLTF, MeshTransmissionMaterial, Center, Float } from '@react-three/drei';
import * as THREE from 'three';

// ─── MATERIAL & MOTION CONFIGURATION FOR 3D GLASS ──
const GLASS_CONFIG = {
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

const MOTION_CONFIG = {
    scaleMultiplier: 1.22,
    floatSpeed: 2.8,
    floatIntensity: 0.09,
    parallaxStrength: 2.8,
};

function InteractiveWord({
    text,
    fontSize,
    letterSpacing = -0.02,
    position = [0, 0, 0],
    onHoverChange,
    visible = true,
}: {
    text: string;
    fontSize: number;
    letterSpacing?: number;
    position?: [number, number, number];
    onHoverChange?: (hovered: boolean) => void;
    visible?: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    const textRef = useRef<any>(null);
    const currentColor = useRef(new THREE.Color('#ffffff'));
    const neonColor = useMemo(() => new THREE.Color('#00FF00'), []);
    const whiteColor = useMemo(() => new THREE.Color('#ffffff'), []);
    const opacityRef = useRef(visible ? 1 : 0);

    useFrame((_, delta) => {
        const targetOpacity = visible ? 1 : 0;
        opacityRef.current = THREE.MathUtils.damp(opacityRef.current, targetOpacity, 9, delta);

        if (textRef.current) {
            const dest = hovered ? neonColor : whiteColor;
            currentColor.current.lerp(dest, delta * 12);
            textRef.current.color = currentColor.current;
            textRef.current.fillOpacity = opacityRef.current;
        }
    });

    return (
        <Text
            ref={textRef}
            font="/font/Moderniz.otf"
            fontSize={fontSize}
            position={position}
            anchorX="center"
            anchorY="middle"
            color="#ffffff"
            letterSpacing={letterSpacing}
            onPointerOver={(e) => {
                if (!visible || opacityRef.current < 0.5) return;
                e.stopPropagation();
                setHovered(true);
                onHoverChange?.(true);
            }}
            onPointerOut={() => {
                if (!visible) return;
                setHovered(false);
                onHoverChange?.(false);
            }}
        >
            {text}
        </Text>
    );
}

function GlassOffstageModel({ 
    isHovered, 
    fontSize,
    visible = true,
}: { 
    isHovered: boolean; 
    fontSize: number;
    visible?: boolean;
}) {
    const { nodes } = useGLTF('/3D/offstage_text.glb') as any;
    const groupRef = useRef<THREE.Group>(null);
    const targetScaleVec = useMemo(() => new THREE.Vector3(), []);
    const opacityRef = useRef(visible ? 1 : 0);

    // Scale so the 3D model width matches ~7.2 * fontSize (harmonious with Line 1 & Line 2)
    const baseScale = (fontSize * 7.2 / 0.127) * MOTION_CONFIG.scaleMultiplier;

    useFrame((state, delta) => {
        const targetOpacity = visible ? 1 : 0;
        opacityRef.current = THREE.MathUtils.damp(opacityRef.current, targetOpacity, 9, delta);

        if (groupRef.current) {
            groupRef.current.visible = opacityRef.current > 0.01;

            // Hover reaction: scale up smoothly and follow mouse, modulated by opacity transition
            const hoverScale = isHovered ? 1.08 : 1.0;
            const currentScale = baseScale * hoverScale * THREE.MathUtils.lerp(0.85, 1.0, opacityRef.current);
            targetScaleVec.set(currentScale, currentScale, currentScale);
            groupRef.current.scale.lerp(targetScaleVec, delta * 8);

            // Parallax tilt
            const mult = MOTION_CONFIG.parallaxStrength;
            const targetRotY = (state.pointer.x * Math.PI * mult) / 8;
            const targetRotX = (-state.pointer.y * Math.PI * mult) / 10;

            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 4);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 4);
        }
    });

    if (!nodes || !nodes.Curve) return null;

    return (
        <group ref={groupRef} position={[0, 0, 0.25]}>
            <Float
                speed={visible ? MOTION_CONFIG.floatSpeed : 0}
                rotationIntensity={visible ? MOTION_CONFIG.floatIntensity * 0.8 : 0}
                floatIntensity={visible ? MOTION_CONFIG.floatIntensity : 0}
            >
                <Center>
                    <mesh
                        geometry={nodes.Curve.geometry}
                        rotation={[Math.PI / 2, 0, 0]}
                    >
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
                            color={isHovered ? '#b0ffb0' : GLASS_CONFIG.color}
                            attenuationColor={GLASS_CONFIG.attenuationColor}
                            attenuationDistance={GLASS_CONFIG.attenuationDistance}
                        />
                    </mesh>
                </Center>
            </Float>
        </group>
    );
}

export default function HeroScene3D({ visible = true }: { visible?: boolean }) {
    const heroGroupRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();
    const [glassHovered, setGlassHovered] = useState(false);
    const transitionRef = useRef(visible ? 1 : 0);

    // Responsive font sizing based on viewport width (handles desktop, tablet, and mobile)
    const fontSize = useMemo(() => {
        // Line 1 with wider word spacing is ~13.2 * fontSize wide.
        // Target ~82% viewport width on mobile, max 0.48 on desktop.
        const responsiveSize = (viewport.width * 0.82) / 13.2;
        return Math.min(Math.max(responsiveSize, 0.14), 0.48);
    }, [viewport.width]);

    const lineHeight = fontSize * 1.25;

    // Track vertical scroll to smoothly move hero text upward
    useEffect(() => {
        const handleScroll = () => {
            if (heroGroupRef.current) {
                const scrollY = window.scrollY;
                const unitPerPixel = viewport.height / (window.innerHeight || 1);
                heroGroupRef.current.position.y = scrollY * unitPerPixel;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [viewport.height]);

    useFrame((_, delta) => {
        const target = visible ? 1 : 0;
        transitionRef.current = THREE.MathUtils.damp(transitionRef.current, target, 9, delta);
        if (heroGroupRef.current) {
            heroGroupRef.current.visible = transitionRef.current > 0.005;
        }
    });

    return (
        <group ref={heroGroupRef} position={[0, 0, 0.1]}>
            {/* LINE 1: THE BEST MOMENTS (With wide natural spacing, centered at x = 0) */}
            <group position={[0, lineHeight, 0]}>
                <InteractiveWord
                    text="THE"
                    fontSize={fontSize}
                    position={[-5.44 * fontSize, 0, 0]}
                    visible={visible}
                />
                <InteractiveWord
                    text="BEST"
                    fontSize={fontSize}
                    position={[-1.865 * fontSize, 0, 0]}
                    visible={visible}
                />
                <InteractiveWord
                    text="MOMENTS"
                    fontSize={fontSize}
                    position={[3.575 * fontSize, 0, 0]}
                    visible={visible}
                />
            </group>

            {/* LINE 2: ARE MADE (With wide natural spacing, centered at x = 0) */}
            <group position={[0, 0, 0]}>
                <InteractiveWord
                    text="ARE"
                    fontSize={fontSize}
                    position={[-2.20 * fontSize, 0, 0]}
                    visible={visible}
                />
                <InteractiveWord
                    text="MADE"
                    fontSize={fontSize}
                    position={[1.65 * fontSize, 0, 0]}
                    visible={visible}
                />
            </group>

            {/* LINE 3: OFFSTAGE (3D Glass Model centered at x = 0) */}
            <group
                position={[0, -lineHeight, 0]}
                onPointerOver={() => visible && setGlassHovered(true)}
                onPointerOut={() => visible && setGlassHovered(false)}
            >
                <GlassOffstageModel isHovered={glassHovered} fontSize={fontSize} visible={visible} />
            </group>
        </group>
    );
}

useGLTF.preload('/3D/offstage_text.glb');
