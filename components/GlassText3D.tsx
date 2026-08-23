'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, MeshTransmissionMaterial, Center, Float } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';

export default function GlassText3D() {
    const { nodes } = useGLTF('/3D/offstage_text.glb') as any;
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera, size } = useThree();

    // ─── LEVA CONTROLS ────────────────────────────────────────────
    const glassConfig = useControls('3D Glass Material', {
        transmission: { value: 1.0, min: 0.0, max: 1.0, step: 0.01 },
        thickness: { value: 1.2, min: 0.0, max: 5.0, step: 0.05 },
        roughness: { value: 0.04, min: 0.0, max: 1.0, step: 0.01 },
        ior: { value: 1.45, min: 1.0, max: 2.5, step: 0.01 },
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

    const posConfig = useControls('3D Position & Motion', {
        scaleMultiplier: { value: 1.0, min: 0.5, max: 2.0, step: 0.02 },
        offsetX: { value: 0.0, min: -2.0, max: 2.0, step: 0.02 },
        offsetY: { value: 0.0, min: -2.0, max: 2.0, step: 0.02 },
        floatSpeed: { value: 1.8, min: 0.0, max: 5.0, step: 0.1 },
        floatIntensity: { value: 0.05, min: 0.0, max: 1.0, step: 0.01 },
        parallaxStrength: { value: 0.6, min: 0.0, max: 3.0, step: 0.1 },
    });

    const TARGET_Z = 0.6;

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // 1. Sync position with HTML #hero-glass-slot
        const slotEl = typeof document !== 'undefined' ? document.getElementById('hero-glass-slot') : null;
        if (slotEl) {
            const rect = slotEl.getBoundingClientRect();
            const slotCenterX = rect.left + rect.width / 2;
            const slotCenterY = rect.top + rect.height / 2;

            const dist = (camera as THREE.PerspectiveCamera).position.z - TARGET_Z;
            const vFov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
            const visibleHeight = 2 * Math.tan(vFov / 2) * dist;
            const visibleWidth = visibleHeight * (size.width / size.height);

            const normX = (slotCenterX / size.width) * 2 - 1;
            const normY = -(slotCenterY / size.height) * 2 + 1;

            const targetX = normX * (visibleWidth / 2) + posConfig.offsetX;
            const targetY = normY * (visibleHeight / 2) + posConfig.offsetY;

            // Model original width ~ 0.127 units
            const targetWidth3D = (rect.width / size.width) * visibleWidth;
            const baseWidth = 0.127;
            const computedScale = (targetWidth3D / baseWidth) * posConfig.scaleMultiplier;

            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 12);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 12);
            groupRef.current.position.z = TARGET_Z;

            if (meshRef.current) {
                meshRef.current.scale.setScalar(computedScale);
            }
        }

        // 2. Mouse Parallax Tilt
        if (posConfig.parallaxStrength > 0) {
            const mult = posConfig.parallaxStrength;
            const targetRotY = (state.pointer.x * Math.PI * mult) / 10;
            const targetRotX = (-state.pointer.y * Math.PI * mult) / 12;

            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 4);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 4);
        }
    });

    if (!nodes || !nodes.Curve) return null;

    return (
        <group ref={groupRef}>
            <Float
                speed={posConfig.floatSpeed}
                rotationIntensity={posConfig.floatIntensity * 0.8}
                floatIntensity={posConfig.floatIntensity}
            >
                <Center rotation={[Math.PI / 2, 0, 0]}>
                    <mesh
                        ref={meshRef}
                        geometry={nodes.Curve.geometry}
                    >
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

useGLTF.preload('/3D/offstage_text.glb');
