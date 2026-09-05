'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { getShuffledPhotos } from '@/lib/mediaPhotos';

const BASE_SPEED = 0.12; // Default idle speed (calm, slow ambient diagonal drift)
const BOOST_FACTOR = 0.004; // Multiplier when user scrolls
const BOOST_DECAY = 0.92; // Friction decay back to idle speed
const MAX_BOOST = 3.5; // Cap on scroll velocity boost

// Preload all 134 optimized 500x500 WebP photos from /bg/*.webp (~4.5MB total payload)
// Shuffled once at module load so every refresh shows a different mix of photos
const PHOTO_URLS = getShuffledPhotos();

export default function GridBackground() {
    const groupRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();

    // 1. Responsive Grid Dimensions: 3 cols on mobile, 4-6 on tablet, 7 on desktop
    const visibleCols = useMemo(() => {
        if (viewport.width < 3.8) return 3; // Mobile portrait (e.g. iPhone / Android: 3 large clear columns)
        if (viewport.width < 6.5) return 4; // Tablet portrait / Large phone
        if (viewport.width < 9.5) return 6; // Tablet landscape / Small laptop
        return 7; // Desktop
    }, [viewport.width]);

    const TILE_SIZE = viewport.width / visibleCols;

    // Start with minimum grid to fill viewport + buffer
    let cols = Math.ceil(viewport.width / TILE_SIZE) + 2;
    let rows = Math.ceil(viewport.height / TILE_SIZE) + 2;

    // Expand grid so all 134 photos each get a unique tile slot
    // The diagonal scroll naturally reveals every image as it wraps around
    while (cols * rows < PHOTO_URLS.length) {
        if (cols <= rows) cols++;
        else rows++;
    }

    const totalTiles = cols * rows;

    const totalWidth = cols * TILE_SIZE;
    const totalHeight = rows * TILE_SIZE;

    // 2. Preload textures with R3F useLoader & Suspense
    const textures = useLoader(THREE.TextureLoader, PHOTO_URLS);

    // Configure texture color space, filtering, and CENTER COVER-FIT (mencegah gambar gepeng)
    useMemo(() => {
        textures.forEach((tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;

            // Center Cover-Fit: crop tepi foto agar pas 1:1 di dalam balok tanpa distorsi/gepeng
            if (tex.image && tex.image.width && tex.image.height) {
                const imgAspect = tex.image.width / tex.image.height;
                if (imgAspect > 1.0) {
                    // Foto Landscape: crop kiri & kanan ke tengah
                    const scaleX = 1 / imgAspect;
                    tex.repeat.set(scaleX, 1.0);
                    tex.offset.set((1 - scaleX) / 2, 0);
                } else {
                    // Foto Portrait: crop atas & bawah ke tengah
                    const scaleY = imgAspect;
                    tex.repeat.set(1.0, scaleY);
                    tex.offset.set(0, (1 - scaleY) / 2);
                }
                tex.needsUpdate = true;
            }
        });
    }, [textures]);

    // 3. Scroll Velocity Tracking
    const scrollBoostRef = useRef<number>(0);
    const accumulatedOffsetRef = useRef<number>(0);

    useEffect(() => {
        let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
        let lastTime = performance.now();

        const handleScroll = () => {
            const now = performance.now();
            const currentScrollY = window.scrollY;
            const deltaY = Math.abs(currentScrollY - lastScrollY);
            const deltaTime = Math.max(now - lastTime, 16);

            const velocity = deltaY / deltaTime;
            const addedBoost = velocity * BOOST_FACTOR * 10;
            scrollBoostRef.current = Math.min(scrollBoostRef.current + addedBoost, MAX_BOOST);

            lastScrollY = currentScrollY;
            lastTime = now;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 4. Mesh Quad Refs for direct high-performance transform updates
    const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

    // Shared geometry for all tiles (with 6% subtle gap)
    const planeGeo = useMemo(() => {
        return new THREE.PlaneGeometry(TILE_SIZE * 0.94, TILE_SIZE * 0.94);
    }, [TILE_SIZE]);

    // Cleanup geometry on unmount / resize
    useEffect(() => {
        return () => {
            planeGeo.dispose();
        };
    }, [planeGeo]);

    // 5. Animation Loop with Diagonal Modulo Wrapping & Smooth Scroll Decay
    useFrame((state, delta) => {
        scrollBoostRef.current *= BOOST_DECAY;
        if (scrollBoostRef.current < 0.001) scrollBoostRef.current = 0;

        const currentSpeed = BASE_SPEED + scrollBoostRef.current;
        accumulatedOffsetRef.current += currentSpeed * delta * 4;

        const offset = accumulatedOffsetRef.current;

        let index = 0;
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                const mesh = meshRefs.current[index];
                if (mesh) {
                    const baseX = x * TILE_SIZE;
                    const baseY = y * TILE_SIZE;

                    // Diagonal move: left (-offset) and up (+offset)
                    const moveX = baseX - offset;
                    const moveY = baseY + offset;

                    // Perfect modulo wrap centered on screen
                    const wrapX = ((moveX % totalWidth) + totalWidth) % totalWidth - (totalWidth / 2) + (TILE_SIZE / 2);
                    const wrapY = ((moveY % totalHeight) + totalHeight) % totalHeight - (totalHeight / 2) + (TILE_SIZE / 2);

                    mesh.position.set(wrapX, wrapY, 0);
                }
                index++;
            }
        }
    });

    // Create grid tiles array
    const tiles = useMemo(() => {
        const list: { id: number; textureIndex: number }[] = [];
        for (let i = 0; i < totalTiles; i++) {
            list.push({
                id: i,
                textureIndex: i % textures.length,
            });
        }
        return list;
    }, [totalTiles, textures.length]);

    return (
        <group ref={groupRef}>
            {tiles.map((tile, i) => {
                const tex = textures[tile.textureIndex];
                return (
                    <mesh
                        key={tile.id}
                        ref={(el) => {
                            meshRefs.current[i] = el;
                        }}
                        geometry={planeGeo}
                    >
                        <meshBasicMaterial
                            map={tex}
                            toneMapped={false}
                            onBeforeCompile={(shader) => {
                                shader.fragmentShader = shader.fragmentShader.replace(
                                    '#include <map_fragment>',
                                    `
                                    #ifdef USE_MAP
                                        vec4 sampledDiffuseColor = texture2D( map, vMapUv );
                                        // Perceptual Grayscale (Black & White conversion)
                                        float gray = dot(sampledDiffuseColor.rgb, vec3(0.299, 0.587, 0.114));
                                        // Darkened Ambient Tone (Subtle, non-distracting background for maximum content contrast)
                                        gray = clamp(pow(gray, 1.35) * 0.38, 0.0, 0.42);
                                        diffuseColor = vec4(vec3(gray), sampledDiffuseColor.a);
                                    #endif
                                    `
                                );
                            }}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}