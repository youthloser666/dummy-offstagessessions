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
    isMobile = false,
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
    isMobile?: boolean;
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
    const neonAcidColor = useMemo(() => new THREE.Color(NEON_ACID_COLOR), []);
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
            {/* Invisible Hitbox for 100% raycast coverage - with generous padding for mobile touch */}
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

// 3D Glass Model: Full premium refractive glass with chromatic dispersion on both desktop & mobile
function GlassOffstageModel({ 
    fontSize,
    isMobile = false,
    visible = true,
    gyroX = 0,
    gyroY = 0,
    isHovered = false,
    registerHitbox,
}: { 
    fontSize: number;
    isMobile?: boolean;
    visible?: boolean;
    gyroX?: number;
    gyroY?: number;
    isHovered?: boolean;
    registerHitbox?: (id: string, mesh: THREE.Mesh | null) => void;
}) {
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
        const targetOpacity = visible ? 1 : 0;
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

export default function HeroScene3D({ visible = true }: { visible?: boolean }) {
    const heroGroupRef = useRef<THREE.Group>(null);
    const { viewport, camera, size } = useThree();
    const transitionRef = useRef(visible ? 1 : 0);
    // Cache scrollY from passive scroll listener to avoid forced layout in useFrame
    const cachedScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

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
    const isTouchActiveRef = useRef(false);

    // Initialized offscreen (999, 999) to prevent false hover at (0, 0)
    const cursor = useRef({ x: 999, y: 999 });
    const smoothCursor = useRef({ x: 0, y: 0 });
    const gyro = useRef({ x: 0, y: 0, active: false });
    const smoothGyro = useRef({ x: 0, y: 0 });
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const pointerVec = useMemo(() => new THREE.Vector2(0, 0), []);

    // Perform direct raycasting against all registered word & 3D hitboxes, with mobile proximity fallback
    const checkIntersection = useCallback((clientX?: number, clientY?: number) => {
        if (typeof clientX === 'number' && typeof clientY === 'number') {
            const w = size.width || window.innerWidth || 1;
            const h = size.height || window.innerHeight || 1;
            cursor.current.x = (clientX / w) * 2 - 1;
            cursor.current.y = -((clientY / h) * 2 - 1);
        }

        pointerVec.set(cursor.current.x, cursor.current.y);
        raycaster.setFromCamera(pointerVec, camera);

        const meshes: THREE.Mesh[] = [];
        const ids: string[] = [];
        hitboxesRef.current.forEach((mesh, id) => {
            meshes.push(mesh);
            ids.push(id);
        });

        if (meshes.length > 0) {
            // 1. Direct raycast intersection check
            const intersects = raycaster.intersectObjects(meshes, false);
            if (intersects.length > 0) {
                const hitMesh = intersects[0].object as THREE.Mesh;
                const hitIdx = meshes.indexOf(hitMesh);
                if (hitIdx !== -1) {
                    const hitId = ids[hitIdx];
                    setHoveredWord(hitId);
                    return true;
                }
            }

            // 2. Mobile touch proximity fallback (detect nearest word when finger taps between or near words)
            if (isMobileMode || isTouchActiveRef.current) {
                let closestId: string | null = null;
                let minDistance = 0.45; // generous touch tolerance in NDC (~90px)
                const tempVec = new THREE.Vector3();
                const aspect = (size.width || 390) / (size.height || 844);

                hitboxesRef.current.forEach((mesh, id) => {
                    mesh.getWorldPosition(tempVec);
                    tempVec.project(camera);
                    const dx = (cursor.current.x - tempVec.x) * aspect;
                    const dy = cursor.current.y - tempVec.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestId = id;
                    }
                });

                if (closestId) {
                    setHoveredWord(closestId);
                    return true;
                }
            }

            // On desktop when mouse leaves words, clear hover
            if (!isTouchActiveRef.current && !isMobileMode) {
                setHoveredWord(null);
            }
        }
        return false;
    }, [camera, isMobileMode, pointerVec, raycaster, size.height, size.width]);

    // Initial mobile teaser glow on "BEST" so hero text greets the user with vivid centerpiece energy
    useEffect(() => {
        if (isMobileMode) {
            const timer = setTimeout(() => {
                setHoveredWord('BEST');
                touchTimeoutRef.current = setTimeout(() => {
                    setHoveredWord(null);
                    cursor.current.x = 999;
                    cursor.current.y = 999;
                }, 2200);
            }, 600);
            return () => {
                clearTimeout(timer);
                if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
            };
        }
    }, [isMobileMode]);

    useEffect(() => {
        const handleTouchStart = (clientX: number, clientY: number) => {
            isTouchActiveRef.current = true;
            if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
            checkIntersection(clientX, clientY);
        };

        const handleTouchMove = (clientX: number, clientY: number) => {
            isTouchActiveRef.current = true;
            checkIntersection(clientX, clientY);
        };

        const handleTouchEnd = () => {
            isTouchActiveRef.current = false;
            if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
            // Smooth lingering neon glow for 1.8 seconds after touch release before smooth fade
            touchTimeoutRef.current = setTimeout(() => {
                setHoveredWord(null);
                cursor.current.x = 999;
                cursor.current.y = 999;
            }, 1800);
        };

        // Pointer event handlers (universal for touchscreens, mobile emulation, and stylus)
        const onPointerDown = (e: PointerEvent) => {
            handleTouchStart(e.clientX, e.clientY);
        };

        const onPointerMove = (e: PointerEvent) => {
            if (e.pointerType === 'mouse') {
                const w = window.innerWidth || 1;
                const h = window.innerHeight || 1;
                cursor.current.x = (e.clientX / w) * 2 - 1;
                cursor.current.y = -((e.clientY / h) * 2 - 1);
            } else if (isTouchActiveRef.current) {
                handleTouchMove(e.clientX, e.clientY);
            }
        };

        const onPointerUp = () => {
            if (isTouchActiveRef.current) {
                handleTouchEnd();
            }
        };

        // Standard touch event handlers
        const onTouchStart = (e: TouchEvent) => {
            if (e.touches && e.touches.length > 0) {
                handleTouchStart(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches && e.touches.length > 0) {
                handleTouchMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const onTouchEnd = () => {
            handleTouchEnd();
        };

        const onClick = (e: MouseEvent) => {
            handleTouchStart(e.clientX, e.clientY);
            handleTouchEnd();
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
            window.removeEventListener('pointerdown', onFirstInteraction);
            window.removeEventListener('click', onFirstInteraction);
        };
        window.addEventListener('touchstart', onFirstInteraction, { passive: true, once: true });
        window.addEventListener('pointerdown', onFirstInteraction, { passive: true, once: true });
        window.addEventListener('click', onFirstInteraction, { passive: true, once: true });

        window.addEventListener('pointerdown', onPointerDown, { passive: true });
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerup', onPointerUp, { passive: true });
        window.addEventListener('pointercancel', onPointerUp, { passive: true });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        window.addEventListener('touchcancel', onTouchEnd, { passive: true });
        window.addEventListener('click', onClick, { passive: true });

        // Cache scrollY from passive scroll listener
        const onScroll = () => {
            cachedScrollY.current = window.scrollY;
            if (window.scrollY > 200) {
                setHoveredWord(null);
                cursor.current.x = 999;
                cursor.current.y = 999;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchcancel', onTouchEnd);
            window.removeEventListener('click', onClick);
            window.removeEventListener('deviceorientation', onOrientation);
            window.removeEventListener('touchstart', onFirstInteraction);
            window.removeEventListener('pointerdown', onFirstInteraction);
            window.removeEventListener('click', onFirstInteraction);
            window.removeEventListener('scroll', onScroll);
        };
    }, [checkIntersection]);

    useFrame((state, delta) => {
        const target = visible ? 1 : 0;
        transitionRef.current = THREE.MathUtils.damp(transitionRef.current, target, 9, delta);

        if (heroGroupRef.current) {
            // Use cached scrollY (no forced layout reflow in render loop)
            const scrollY = cachedScrollY.current;
            const windowH = typeof window !== 'undefined' ? (window.innerHeight || 800) : 800;
            const isOffscreen = scrollY > windowH * 1.35;

            // When scrolled off-screen, completely hide the hero group and skip rendering
            heroGroupRef.current.visible = transitionRef.current > 0.005 && !isOffscreen;
            if (isOffscreen) {
                return;
            }

            // Interpolate smooth cursor and smooth gyro
            if (cursor.current.x < 900) {
                smoothCursor.current.x = THREE.MathUtils.damp(smoothCursor.current.x, cursor.current.x, 5, delta);
                smoothCursor.current.y = THREE.MathUtils.damp(smoothCursor.current.y, cursor.current.y, 5, delta);
            }
            smoothGyro.current.x = THREE.MathUtils.damp(smoothGyro.current.x, gyro.current.x, 6, delta);
            smoothGyro.current.y = THREE.MathUtils.damp(smoothGyro.current.y, gyro.current.y, 6, delta);

            const unitPerPixel = viewport.height / windowH;

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

            // ── NEON GLOW INTERACTION: TRIGGERED BY CURSOR HOVER (DESKTOP) & ACTIVE TOUCH (MOBILE) ──
            if (!isMobileMode || isTouchActiveRef.current) {
                if (cursor.current.x < 900) {
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
                        } else if (isMobileMode || isTouchActiveRef.current) {
                            // Proximity fallback for mobile touch
                            let closestId: string | null = null;
                            let minDistance = 0.45;
                            const tempVec = new THREE.Vector3();
                            const aspect = (size.width || 390) / (size.height || 844);

                            hitboxesRef.current.forEach((mesh, id) => {
                                mesh.getWorldPosition(tempVec);
                                tempVec.project(camera);
                                const dx = (cursor.current.x - tempVec.x) * aspect;
                                const dy = cursor.current.y - tempVec.y;
                                const dist = Math.hypot(dx, dy);
                                if (dist < minDistance) {
                                    minDistance = dist;
                                    closestId = id;
                                }
                            });

                            if (closestId) {
                                setHoveredWord(closestId);
                            }
                        } else {
                            setHoveredWord(null);
                        }
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
                            isMobile={true}
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
                            isMobile={true}
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
                            isMobile={true}
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
                            isMobile={true}
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
                            isMobile={true}
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
                            isHovered={hoveredWord === 'OFFSTAGE'}
                            registerHitbox={registerHitbox}
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
                            isMobile={false}
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
                            isMobile={false}
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
                            isMobile={false}
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
                            isMobile={false}
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
                            isMobile={false}
                        />
                    </group>

                    {/* LINE 3: OFFSTAGE (3D Glass Model) */}
                    <group position={[0, -lineHeight, 0.2]}>
                        <GlassOffstageModel 
                            fontSize={fontSize} 
                            isMobile={false} 
                            visible={visible} 
                            isHovered={hoveredWord === 'OFFSTAGE'}
                            registerHitbox={registerHitbox}
                        />
                    </group>
                </>
            )}
        </group>
    );
}

useGLTF.preload('/3D/offstage_text.glb');
