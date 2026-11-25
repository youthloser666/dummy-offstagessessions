'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, MeshTransmissionMaterial, Center, Float } from '@react-three/drei';
import * as THREE from 'three';
import { GLASS_CONFIG, MOTION_CONFIG, NEON_ACID_COLOR } from './heroSceneConfig';

export interface GlassOffstageModelProps {
    fontSize: number;
    isMobile?: boolean;
    visible?: boolean;
    gyroX?: number;
    gyroY?: number;
    isHovered?: boolean;
    registerHitbox?: (id: string, mesh: THREE.Mesh | null) => void;
}

export function GlassOffstageModel({ 
    fontSize,
    isMobile = false,
    visible = true,
    gyroX = 0,
    gyroY = 0,
    isHovered = false,
    registerHitbox,
}: GlassOffstageModelProps) {
    const { nodes } = useGLTF('/3D/offstage_text.glb') as any;
    const groupRef = useRef<THREE.Group>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    const matRef = useRef<any>(null);
    const opacityRef = useRef(visible ? 1 : 0);
    const glowRef = useRef(0);
    const scaleFactor = isMobile ? 5.2 : 7.0;
    const baseScale = (fontSize * scaleFactor / 0.127) * MOTION_CONFIG.scaleMultiplier;

    const whiteColor = useMemo(() => new THREE.Color('#ffffff'), []);
    const neonAcidColor = useMemo(() => new THREE.Color(NEON_ACID_COLOR), []);

    useFrame((_, delta) => {
        if (!visible) {
            opacityRef.current = 0;
            glowRef.current = 0;
            if (groupRef.current) groupRef.current.visible = false;
            return;
        }

        const targetOpacity = 1;
        opacityRef.current = THREE.MathUtils.damp(opacityRef.current, targetOpacity, 9, delta);

        const targetGlow = isHovered ? 1.0 : 0.0;
        glowRef.current = THREE.MathUtils.damp(glowRef.current, targetGlow, 8, delta);

        if (!groupRef.current) return;
        groupRef.current.visible = opacityRef.current > 0.01;

        const currentScale = baseScale * THREE.MathUtils.lerp(0.85, 1.0, opacityRef.current) * (1.0 + glowRef.current * 0.06);
        groupRef.current.scale.lerp(new THREE.Vector3(currentScale, currentScale, currentScale), delta * 8);

        // Dynamic 3D Neon light flaring behind glass when touched
        if (lightRef.current) {
            lightRef.current.intensity = glowRef.current * 4.5 * opacityRef.current;
        }

        // Electrify glass material with neon acid green-yellow when touched
        if (matRef.current) {
            matRef.current.color.lerpColors(whiteColor, neonAcidColor, glowRef.current * 0.85);
            matRef.current.attenuationColor.lerpColors(whiteColor, neonAcidColor, glowRef.current * 0.95);
        }

        // Mobile gyro reaction: dynamic specular refraction & tilt as phone rotates
        if (isMobile) {
            const targetRotY = gyroX * 0.35;
            const targetRotX = -gyroY * 0.25;
            const targetRotZ = -gyroX * 0.10;
            groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 6, delta);
            groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 6, delta);
            groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, targetRotZ, 6, delta);
        }
    });

    if (!nodes || !nodes.Curve) return null;

    return (
        <group position={[0, 0, 0.28]}>
            {/* Interactive Hitbox for OFFSTAGE 3D Model: unscaled 1:1 world coordinates */}
            <mesh
                ref={(el) => registerHitbox?.('OFFSTAGE', el)}
                position={[0, 0, 0.05]}
            >
                <planeGeometry args={[fontSize * (isMobile ? 7.2 : 9.5), fontSize * 1.5]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>

            {/* Dynamic Localized 3D Neon Point Light behind the glass */}
            <pointLight
                ref={lightRef}
                position={[0, 0, 0.38]}
                color={NEON_ACID_COLOR}
                intensity={0.0}
                distance={fontSize * 16}
                decay={2}
            />

            {/* 3D Glass model container scaled by baseScale */}
            <group ref={groupRef}>
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
                            {/* Full premium 3D glass with transmission FBO on both desktop & mobile */}
                            <MeshTransmissionMaterial
                                ref={matRef}
                                backside={GLASS_CONFIG.backside}
                                samples={isMobile ? 6 : GLASS_CONFIG.samples}
                                resolution={isMobile ? 256 : GLASS_CONFIG.resolution}
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
        </group>
    );
}

export default React.memo(GlassOffstageModel);
