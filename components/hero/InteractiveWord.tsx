'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { NEON_ACID_COLOR, NEON_AURA_COLOR } from './heroSceneConfig';

export interface InteractiveWordProps {
    id: string;
    text: string;
    fontSize: number;
    wordWidth: number;
    letterSpacing?: number;
    position?: [number, number, number];
    isHovered?: boolean;
    registerHitbox?: (id: string, mesh: THREE.Mesh | null) => void;
    visible?: boolean;
    isMobile?: boolean;
}

export function InteractiveWord({
    id,
    text,
    fontSize,
    wordWidth,
    letterSpacing = -0.02,
    position = [0, 0, 0],
    isHovered = false,
    registerHitbox,
    visible = true,
    isMobile = false,
}: InteractiveWordProps) {
    const groupRef = useRef<THREE.Group>(null);
    const mainTextRef = useRef<any>(null);
    const haloTextRef = useRef<any>(null);
    const auraTextRef = useRef<any>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    const glowFactorRef = useRef(0);
    const opacityRef = useRef(visible ? 1 : 0);

    const whiteColor = useMemo(() => new THREE.Color('#ffffff'), []);
    const neonHotCoreColor = useMemo(() => new THREE.Color('#f6ffe0'), []);
    const neonAcidColor = useMemo(() => new THREE.Color(NEON_ACID_COLOR), []);
    const currentColor = useRef(new THREE.Color('#ffffff'));

    useFrame((state, delta) => {
        if (!visible) {
            opacityRef.current = 0;
            glowFactorRef.current = 0;
            if (groupRef.current) groupRef.current.visible = false;
            if (mainTextRef.current) mainTextRef.current.fillOpacity = 0;
            if (haloTextRef.current) haloTextRef.current.visible = false;
            if (auraTextRef.current) auraTextRef.current.visible = false;
            if (lightRef.current) lightRef.current.intensity = 0;
            return;
        }

        const targetOpacity = 1;
        opacityRef.current = THREE.MathUtils.damp(opacityRef.current, targetOpacity, 9, delta);

        if (groupRef.current) {
            groupRef.current.visible = opacityRef.current > 0.01;
        }

        // Smooth glow transition when hovered or touched
        const targetGlow = isHovered ? 1.0 : 0.0;
        glowFactorRef.current = THREE.MathUtils.damp(glowFactorRef.current, targetGlow, 7.5, delta);

        const g = glowFactorRef.current;
        const time = state.clock.elapsedTime;

        // Subtle organic neon gas oscillation when active
        const gasHum = Math.sin(time * 5.8 + id.charCodeAt(0)) * 0.035;
        const effectiveGlow = Math.max(0, Math.min(1, g + (g > 0.05 ? gasHum : 0)));

        // 1. Tactile 3D lift & smooth scale-up
        if (groupRef.current) {
            const targetZ = position[2] + effectiveGlow * (0.055 * fontSize);
            groupRef.current.position.set(position[0], position[1], targetZ);
            const targetScale = 1.0 + effectiveGlow * 0.04;
            groupRef.current.scale.set(targetScale, targetScale, 1.0);
        }

        // 2. Core Text - Pure, brilliant, solid white with neon outline on touch/hover
        if (mainTextRef.current) {
            mainTextRef.current.fillOpacity = opacityRef.current;
            if (effectiveGlow > 0.005) {
                mainTextRef.current.outlineColor = neonAcidColor;
                mainTextRef.current.outlineOpacity = effectiveGlow * opacityRef.current;
                mainTextRef.current.outlineBlur = effectiveGlow * fontSize * 0.04;
                mainTextRef.current.outlineWidth = effectiveGlow * fontSize * 0.024;
                currentColor.current.lerpColors(whiteColor, neonHotCoreColor, effectiveGlow * 0.25);
                mainTextRef.current.color = currentColor.current;
            } else {
                if (mainTextRef.current.outlineOpacity !== 0) {
                    mainTextRef.current.outlineOpacity = 0;
                    mainTextRef.current.outlineWidth = 0;
                    mainTextRef.current.color = '#ffffff';
                }
            }
        }

        // 3. Medium Radiant Halo Bloom (Rendered only on hover/tap)
        if (haloTextRef.current) {
            haloTextRef.current.visible = effectiveGlow > 0.01;
            if (effectiveGlow > 0.01) {
                haloTextRef.current.outlineOpacity = effectiveGlow * 0.95 * opacityRef.current;
                haloTextRef.current.outlineBlur = THREE.MathUtils.lerp(fontSize * 0.08, fontSize * 0.24, effectiveGlow);
                haloTextRef.current.outlineWidth = THREE.MathUtils.lerp(fontSize * 0.04, fontSize * 0.12, effectiveGlow);
            }
        }

        // 4. Deep Atmospheric Neon Wash (Rendered only on hover/tap)
        if (auraTextRef.current) {
            auraTextRef.current.visible = effectiveGlow > 0.01;
            if (effectiveGlow > 0.01) {
                auraTextRef.current.outlineOpacity = effectiveGlow * 0.75 * opacityRef.current;
                auraTextRef.current.outlineBlur = THREE.MathUtils.lerp(fontSize * 0.18, fontSize * 0.5, effectiveGlow);
                auraTextRef.current.outlineWidth = THREE.MathUtils.lerp(fontSize * 0.1, fontSize * 0.24, effectiveGlow);
            }
        }

        // 5. Dynamic 3D Neon Point Light (0 when idle, flares up to 2.8 on hover)
        if (lightRef.current) {
            lightRef.current.intensity = THREE.MathUtils.lerp(0.0, 2.8, effectiveGlow) * opacityRef.current;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Invisible Hitbox for 100% raycast coverage - centered at word origin */}
            <mesh
                ref={(el) => registerHitbox?.(id, el)}
                position={[0, 0, 0.02]}
            >
                <planeGeometry args={[wordWidth * (isMobile ? 1.35 : 1.15), fontSize * (isMobile ? 1.8 : 1.6)]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>

            {/* Layer 1: Deep Atmospheric Neon Wash (Wide Bloom Aura) */}
            <Text
                ref={auraTextRef}
                font="/font/Moderniz.otf"
                fontSize={fontSize}
                anchorX="center"
                anchorY="middle"
                color={NEON_ACID_COLOR}
                letterSpacing={letterSpacing}
                fillOpacity={0}
                outlineWidth={fontSize * 0.14}
                outlineBlur={fontSize * 0.22}
                outlineColor={NEON_AURA_COLOR}
                outlineOpacity={0}
                position={[0, 0, -0.012]}
            >
                {text}
            </Text>

            {/* Layer 2: Radiant Neon Halo (Medium Bloom) */}
            <Text
                ref={haloTextRef}
                font="/font/Moderniz.otf"
                fontSize={fontSize}
                anchorX="center"
                anchorY="middle"
                color={NEON_ACID_COLOR}
                letterSpacing={letterSpacing}
                fillOpacity={0}
                outlineWidth={fontSize * 0.06}
                outlineBlur={fontSize * 0.1}
                outlineColor={NEON_ACID_COLOR}
                outlineOpacity={0}
                position={[0, 0, -0.006]}
            >
                {text}
            </Text>

            {/* Layer 3: Core Ultra-Bright White Text */}
            <Text
                ref={mainTextRef}
                font="/font/Moderniz.otf"
                fontSize={fontSize}
                anchorX="center"
                anchorY="middle"
                color="#ffffff"
                letterSpacing={letterSpacing}
                outlineWidth={0}
                outlineBlur={0}
                outlineColor={NEON_ACID_COLOR}
                outlineOpacity={0}
                position={[0, 0, 0]}
            >
                {text}
            </Text>

            {/* Dynamic Localized 3D Neon Point Light */}
            <pointLight
                ref={lightRef}
                position={[0, 0, 0.45]}
                color={NEON_ACID_COLOR}
                intensity={0.0}
                distance={fontSize * 13}
                decay={2}
            />
        </group>
    );
}

export default React.memo(InteractiveWord);
