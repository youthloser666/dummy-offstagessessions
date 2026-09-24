'use client';

import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
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
    scaleMultiplier: 1.15,
    floatSpeed: 2.8,
    floatIntensity: 0.09,
};

// ─── NEON GLOW CONFIGURATION ──
const NEON_ACID_COLOR = '#c8ff00';
const NEON_AURA_COLOR = '#a6ff00';

function InteractiveWord({
    id,
    text,
    fontSize,
    wordWidth,
    letterSpacing = -0.02,
    position = [0, 0, 0],
    isHovered = false,
    registerHitbox,
    visible = true,
}: {
    id: string;
    text: string;
    fontSize: number;
    wordWidth: number;
    letterSpacing?: number;
    position?: [number, number, number];
    isHovered?: boolean;
    registerHitbox?: (id: string, mesh: THREE.Mesh | null) => void;
    visible?: boolean;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const mainTextRef = useRef<any>(null);
    const haloTextRef = useRef<any>(null);
    const auraTextRef = useRef<any>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    const glowFactorRef = useRef(0);
    const opacityRef = useRef(visible ? 1 : 0);

    const whiteColor = useMemo(() => new THREE.Color('#ffffff'), []);
    const neonHotCoreColor = useMemo(() => new THREE.Color('#f6ffe0'), []);
    const blackShadowColor = useMemo(() => new THREE.Color('#000000'), []);
    const neonAcidColor = useMemo(() => new THREE.Color(NEON_ACID_COLOR), []);
    const currentOutlineColor = useRef(new THREE.Color('#000000'));
    const currentColor = useRef(new THREE.Color('#ffffff'));

    useFrame((state, delta) => {
        const targetOpacity = visible ? 1 : 0;
        opacityRef.current = THREE.MathUtils.damp(opacityRef.current, targetOpacity, 9, delta);

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

        // 2. Core Text - Pure, brilliant, solid white
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
            {/* Invisible Hitbox for 100% raycast coverage */}
            <mesh
                ref={(el) => registerHitbox?.(id, el)}
                position={[0, 0, 0.02]}
            >
                <planeGeometry args={[wordWidth, fontSize * 1.3]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
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

// 3D Glass Model: Clean, serene, luxurious refractive glass without glitching
function GlassOffstageModel({ 
    fontSize,
    isMobile = false,
    visible = true,
    gyroX = 0,
    gyroY = 0,
}: { 
    fontSize: number;
    isMobile?: boolean;
    visible?: boolean;
    gyroX?: number;
    gyroY?: number;
}) {
    const { nodes } = useGLTF('/3D/offstage_text.glb') as any;
    const groupRef = useRef<THREE.Group>(null);
    const opacityRef = useRef(visible ? 1 : 0);
    const scaleFactor = isMobile ? 5.2 : 7.0;
    const baseScale = (fontSize * scaleFactor / 0.127) * MOTION_CONFIG.scaleMultiplier;

    useFrame((_, delta) => {
        const targetOpacity = visible ? 1 : 0;
        opacityRef.current = THREE.MathUtils.damp(opacityRef.current, targetOpacity, 9, delta);

        if (!groupRef.current) return;
        groupRef.current.visible = opacityRef.current > 0.01;

        const currentScale = baseScale * THREE.MathUtils.lerp(0.85, 1.0, opacityRef.current);
        groupRef.current.scale.lerp(new THREE.Vector3(currentScale, currentScale, currentScale), delta * 8);

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
        <group ref={groupRef} position={[0, 0, 0.28]}>
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
                            samples={isMobile ? 3 : GLASS_CONFIG.samples}
                            resolution={isMobile ? 128 : GLASS_CONFIG.resolution}
                            transmission={GLASS_CONFIG.transmission}
                            roughness={GLASS_CONFIG.roughness}
                            thickness={GLASS_CONFIG.thickness}
                            ior={GLASS_CONFIG.ior}
                            chromaticAberration={isMobile ? 0.04 : GLASS_CONFIG.chromaticAberration}
                            anisotropy={isMobile ? 0.1 : GLASS_CONFIG.anisotropy}
                            distortion={GLASS_CONFIG.distortion}
                            distortionScale={GLASS_CONFIG.distortionScale}
                            temporalDistortion={isMobile ? 0 : GLASS_CONFIG.temporalDistortion}
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

export default function HeroScene3D({ visible = true }: { visible?: boolean }) {
    const heroGroupRef = useRef<THREE.Group>(null);
    const { viewport, camera } = useThree();
    const transitionRef = useRef(visible ? 1 : 0);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const isMobileMode = isMobile || viewport.width < 5.6;

    // Responsive font sizing based on viewport mode
    const fontSize = useMemo(() => {
        if (isMobileMode) {
            // Mobile: slightly reduced (~68% of mobile width) for elegant poster margins
            return Math.min(Math.max((viewport.width * 0.68) / 7.5, 0.18), 0.38);
        }
        // Desktop: sized so "THE BEST MOMENTS" (span ~15.2 * fontSize) fits comfortably
        const responsiveSize = (viewport.width * 0.74) / 15.2;
        return Math.min(Math.max(responsiveSize, 0.16), 0.42);
    }, [viewport.width, isMobileMode]);

    const lineHeight = useMemo(() => {
        return isMobileMode ? fontSize * 1.32 : fontSize * 1.25;
    }, [fontSize, isMobileMode]);

    // Registry of word hitbox meshes for direct mathematical raycasting
    const hitboxesRef = useRef<Map<string, THREE.Mesh>>(new Map());
    const registerHitbox = useCallback((id: string, mesh: THREE.Mesh | null) => {
        if (mesh) {
            hitboxesRef.current.set(id, mesh);
        } else {
            hitboxesRef.current.delete(id);
        }
    }, []);

    const [hoveredWord, setHoveredWord] = useState<string | null>(null);
    const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Unified cursor, smooth cursor (desktop) & gyroscope tracking (mobile)
    const cursor = useRef({ x: 0, y: 0 });
    const smoothCursor = useRef({ x: 0, y: 0 });
    const gyro = useRef({ x: 0, y: 0, active: false });
    const smoothGyro = useRef({ x: 0, y: 0 });
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const pointerVec = useMemo(() => new THREE.Vector2(0, 0), []);

    useEffect(() => {
        const onPointerMove = (e: MouseEvent | TouchEvent) => {
            let clientX = 0, clientY = 0;
            if ('touches' in e && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if ('clientX' in e) {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            cursor.current.x = (clientX / (window.innerWidth || 1)) * 2 - 1;
            cursor.current.y = -((clientY / (window.innerHeight || 1)) * 2 - 1);
        };

        const onTouchEnd = () => {
            if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
            touchTimeoutRef.current = setTimeout(() => {
                if (!isMobileMode) {
                    setHoveredWord(null);
                }
            }, 650);
        };

        const onOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma !== null && e.beta !== null) {
                gyro.current.active = true;
                // e.gamma: [-90, 90] left/right tilt. Normalized within ±25 deg range
                gyro.current.x = THREE.MathUtils.clamp(e.gamma / 25, -1, 1);
                // e.beta: [-180, 180] forward/backward tilt. Typical portrait holding is ~45 deg
                gyro.current.y = THREE.MathUtils.clamp((e.beta - 45) / 25, -1, 1);
            }
        };

        // iOS 13+ DeviceOrientation permission handler
        const requestGyroPermission = async () => {
            if (
                typeof window !== 'undefined' &&
                typeof (DeviceOrientationEvent as any)?.requestPermission === 'function'
            ) {
                try {
                    const permission = await (DeviceOrientationEvent as any).requestPermission();
                    if (permission === 'granted') {
                        window.addEventListener('deviceorientation', onOrientation, { passive: true });
                    }
                } catch (err) {
                    console.warn('Gyroscope permission error:', err);
                }
            }
        };

        // For Android & non-iOS browsers, attach listener immediately
        if (
            typeof window !== 'undefined' &&
            'DeviceOrientationEvent' in window &&
            typeof (DeviceOrientationEvent as any)?.requestPermission !== 'function'
        ) {
            window.addEventListener('deviceorientation', onOrientation, { passive: true });
        }

        // On first tap/touch on window, trigger iOS permission request if required
        const onFirstInteraction = () => {
            requestGyroPermission();
            window.removeEventListener('touchstart', onFirstInteraction);
            window.removeEventListener('click', onFirstInteraction);
        };
        window.addEventListener('touchstart', onFirstInteraction, { passive: true, once: true });
        window.addEventListener('click', onFirstInteraction, { passive: true, once: true });

        window.addEventListener('mousemove', onPointerMove, { passive: true });

        return () => {
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('deviceorientation', onOrientation);
            window.removeEventListener('touchstart', onFirstInteraction);
            window.removeEventListener('click', onFirstInteraction);
        };
    }, [isMobileMode]);

    useFrame((state, delta) => {
        const target = visible ? 1 : 0;
        transitionRef.current = THREE.MathUtils.damp(transitionRef.current, target, 9, delta);

        if (heroGroupRef.current) {
            heroGroupRef.current.visible = transitionRef.current > 0.005;

            // Interpolate smooth cursor and smooth gyro
            smoothCursor.current.x = THREE.MathUtils.damp(smoothCursor.current.x, cursor.current.x, 5, delta);
            smoothCursor.current.y = THREE.MathUtils.damp(smoothCursor.current.y, cursor.current.y, 5, delta);
            smoothGyro.current.x = THREE.MathUtils.damp(smoothGyro.current.x, gyro.current.x, 6, delta);
            smoothGyro.current.y = THREE.MathUtils.damp(smoothGyro.current.y, gyro.current.y, 6, delta);

            const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
            const unitPerPixel = viewport.height / (typeof window !== 'undefined' ? (window.innerHeight || 1) : 1);

            if (isMobileMode) {
                // ── MOBILE MODE: GYRO STRICTLY FOR MOTION (TILT & PARALLAX) ──
                // If physical gyro is active, use smoothGyro; otherwise provide organic ambient float
                const time = state.clock.elapsedTime;
                const gx = gyro.current.active ? smoothGyro.current.x : Math.sin(time * 1.5) * 0.28;
                const gy = gyro.current.active ? smoothGyro.current.y : Math.cos(time * 1.2) * 0.22;

                // Generous tactile tilt angles for mobile screens
                const targetRotY = gx * 0.30;
                const targetRotX = -gy * 0.24;
                const targetPosX = gx * 0.26;
                const targetPosY = (scrollY * unitPerPixel) + (-gy * 0.20);

                heroGroupRef.current.rotation.y = THREE.MathUtils.damp(heroGroupRef.current.rotation.y, targetRotY, 6, delta);
                heroGroupRef.current.rotation.x = THREE.MathUtils.damp(heroGroupRef.current.rotation.x, targetRotX, 6, delta);
                heroGroupRef.current.position.x = THREE.MathUtils.damp(heroGroupRef.current.position.x, targetPosX, 6, delta);
                heroGroupRef.current.position.y = THREE.MathUtils.damp(heroGroupRef.current.position.y, targetPosY, 6, delta);
            } else {
                // ── DESKTOP MODE: MOUSE CURSOR PARALLAX & TILT ──
                const targetRotY = smoothCursor.current.x * 0.11;
                const targetRotX = -smoothCursor.current.y * 0.09;
                const targetPosX = smoothCursor.current.x * 0.15;
                const targetPosY = (scrollY * unitPerPixel) + (smoothCursor.current.y * 0.12);

                heroGroupRef.current.rotation.y = THREE.MathUtils.damp(heroGroupRef.current.rotation.y, targetRotY, 5, delta);
                heroGroupRef.current.rotation.x = THREE.MathUtils.damp(heroGroupRef.current.rotation.x, targetRotX, 5, delta);
                heroGroupRef.current.position.x = THREE.MathUtils.damp(heroGroupRef.current.position.x, targetPosX, 5, delta);
                heroGroupRef.current.position.y = THREE.MathUtils.damp(heroGroupRef.current.position.y, targetPosY, 6, delta);
            }

            // ── NEON GLOW INTERACTION: TRIGGERED BY CURSOR HOVER (DESKTOP ONLY) ──
            if (!isMobileMode) {
                pointerVec.set(cursor.current.x, cursor.current.y);
                raycaster.setFromCamera(pointerVec, camera);

                const meshes: THREE.Mesh[] = [];
                const ids: string[] = [];
                hitboxesRef.current.forEach((mesh, id) => {
                    meshes.push(mesh);
                    ids.push(id);
                });

                if (meshes.length > 0) {
                    const intersects = raycaster.intersectObjects(meshes, false);
                    if (intersects.length > 0) {
                        const hitMesh = intersects[0].object as THREE.Mesh;
                        const hitIdx = meshes.indexOf(hitMesh);
                        if (hitIdx !== -1) {
                            setHoveredWord(ids[hitIdx]);
                        }
                    } else {
                        setHoveredWord(null);
                    }
                }
            }
        }
    });

    return (
        // Position z = 0.8 ensures full clearance in front of video plane at z = 0.05
        <group ref={heroGroupRef} position={[0, 0, 0.8]}>
            {isMobileMode ? (
                /* MOBILE MODE: 3-LINE POSTER COMPOSITION (THE BEST / MOMENTS / ARE MADE / OFFSTAGE) */
                <>
                    {/* LINE 1: THE BEST */}
                    <group position={[0, 1.5 * lineHeight, 0]}>
                        <InteractiveWord
                            id="THE"
                            text="THE"
                            fontSize={fontSize}
                            wordWidth={2.45 * fontSize}
                            position={[-2.15 * fontSize, 0, 0]}
                            isHovered={hoveredWord === 'THE'}
                            registerHitbox={registerHitbox}
                            visible={visible}
                        />
                        <InteractiveWord
                            id="BEST"
                            text="BEST"
                            fontSize={fontSize}
                            wordWidth={3.5 * fontSize}
                            position={[1.60 * fontSize, 0, 0]}
                            isHovered={hoveredWord === 'BEST'}
                            registerHitbox={registerHitbox}
                            visible={visible}
                        />
                    </group>

                    {/* LINE 2: MOMENTS */}
                    <group position={[0, 0.5 * lineHeight, 0]}>
                        <InteractiveWord
                            id="MOMENTS"
                            text="MOMENTS"
                            fontSize={fontSize}
                            wordWidth={6.5 * fontSize}
                            position={[0, 0, 0]}
                            isHovered={hoveredWord === 'MOMENTS'}
                            registerHitbox={registerHitbox}
                            visible={visible}
                        />
                    </group>

                    {/* LINE 3: ARE MADE */}
                    <group position={[0, -0.5 * lineHeight, 0.08]}>
                        <InteractiveWord
                            id="ARE"
                            text="ARE"
                            fontSize={fontSize}
                            wordWidth={2.8 * fontSize}
                            position={[-2.414 * fontSize, 0, 0]}
                            isHovered={hoveredWord === 'ARE'}
                            registerHitbox={registerHitbox}
                            visible={visible}
                        />
                        <InteractiveWord
                            id="MADE"
                            text="MADE"
                            fontSize={fontSize}
                            wordWidth={3.8 * fontSize}
                            position={[1.777 * fontSize, 0, 0]}
                            isHovered={hoveredWord === 'MADE'}
                            registerHitbox={registerHitbox}
                            visible={visible}
                        />
                    </group>

                    {/* LINE 4: OFFSTAGE (3D Glass Model - Raised closer to ARE MADE) */}
                    <group position={[0, -1.30 * lineHeight, 0.2]}>
                        <GlassOffstageModel 
                            fontSize={fontSize} 
                            isMobile={true} 
                            visible={visible} 
                            gyroX={smoothGyro.current.x} 
                            gyroY={smoothGyro.current.y} 
                        />
                    </group>
                </>
            ) : (
                /* DESKTOP MODE: ORIGINAL CLASSIC 3-LINE CINEMATIC COMPOSITION */
                <>
                    {/* LINE 1: THE BEST MOMENTS */}
                    <group position={[0, lineHeight, 0]}>
                        <InteractiveWord
                            id="THE"
                            text="THE"
                            fontSize={fontSize}
                            wordWidth={2.4 * fontSize}
                            position={[-6.155 * fontSize, 0, 0]}
                            isHovered={hoveredWord === 'THE'}
                            registerHitbox={registerHitbox}
                            visible={visible}
                        />
                        <InteractiveWord
                            id="BEST"
                            text="BEST"
                            fontSize={fontSize}
                            wordWidth={3.5 * fontSize}
                            position={[-2.294 * fontSize, 0, 0]}
                            isHovered={hoveredWord === 'BEST'}
                            registerHitbox={registerHitbox}
                            visible={visible}
                        />
                        <InteractiveWord
                            id="MOMENTS"
                            text="MOMENTS"
                            fontSize={fontSize}
                            wordWidth={6.5 * fontSize}
                            position={[3.862 * fontSize, 0, 0]}
                            isHovered={hoveredWord === 'MOMENTS'}
                            registerHitbox={registerHitbox}
                            visible={visible}
                        />
                    </group>

                    {/* LINE 2: ARE MADE */}
                    <group position={[0, 0, 0.08]}>
                        <InteractiveWord
                            id="ARE"
                            text="ARE"
                            fontSize={fontSize}
                            wordWidth={2.8 * fontSize}
                            position={[-2.414 * fontSize, 0, 0]}
                            isHovered={hoveredWord === 'ARE'}
                            registerHitbox={registerHitbox}
                            visible={visible}
                        />
                        <InteractiveWord
                            id="MADE"
                            text="MADE"
                            fontSize={fontSize}
                            wordWidth={3.8 * fontSize}
                            position={[1.777 * fontSize, 0, 0]}
                            isHovered={hoveredWord === 'MADE'}
                            registerHitbox={registerHitbox}
                            visible={visible}
                        />
                    </group>

                    {/* LINE 3: OFFSTAGE (3D Glass Model) */}
                    <group position={[0, -lineHeight, 0.2]}>
                        <GlassOffstageModel fontSize={fontSize} isMobile={false} visible={visible} />
                    </group>
                </>
            )}
        </group>
    );
}

useGLTF.preload('/3D/offstage_text.glb');
