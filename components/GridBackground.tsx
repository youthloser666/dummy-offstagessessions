'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { getShuffledPhotos } from '@/lib/mediaPhotos';

// Calm, slow ambient diagonal drift (diperlambat agar tenang, tidak pusing & sangat ringan di mobile)
const BASE_SPEED = 0.20;

// Shuffled once at module load so every refresh shows a different mix of photos
const ALL_PHOTO_URLS = getShuffledPhotos();

// Detect mobile touch devices at module level for texture budget
const IS_MOBILE_TOUCH =
    typeof window !== 'undefined' &&
    (window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
        (window.innerWidth < 840 && ('ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0)));

// Mobile: only preload textures needed for the grid (35 max) to save ~4MB GPU memory
// Desktop: preload all 134 photos for the full infinite collage
const PHOTO_URLS = IS_MOBILE_TOUCH ? ALL_PHOTO_URLS.slice(0, 35) : ALL_PHOTO_URLS;

export default function GridBackground({ isHome = true }: { isHome?: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();
    const heroDimUniform = useMemo(() => ({ value: 1.0 }), []);
    const dimRef = useRef(1.0);

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

    // Expand grid so all photos get slots on desktop, but keep mobile lean & smooth (35 tiles max)
    const isMobileViewport = viewport.width < 5.0 || visibleCols <= 3;
    const maxTargetTiles = isMobileViewport ? 35 : PHOTO_URLS.length;

    while (cols * rows < maxTargetTiles) {
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

    // 3. Constant speed offset & Cached scrollY for hero dimming only (no scroll velocity calculations)
    const accumulatedOffsetRef = useRef<number>(0);
    const cachedScrollY = useRef<number>(typeof window !== 'undefined' ? window.scrollY : 0);

    useEffect(() => {
        const handleScroll = () => {
            // Cache scrollY solely for hero dimming without forced reflow
            cachedScrollY.current = window.scrollY;
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

    // 5. Animation Loop: Constant gentle diagonal drift, completely independent of scroll
    useFrame((state, delta) => {
        accumulatedOffsetRef.current += BASE_SPEED * delta;
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

        // Smoothly adjust collage brightness: dimmed at hero on landing page, full everywhere else
        // Use cached scrollY (no forced layout reflow in render loop)
        const scrollY = cachedScrollY.current;
        const vh = typeof window !== 'undefined' ? (window.innerHeight || 800) : 800;

        if (isHome) {
            // At top (Hero): 0.22 (subtle dark collage texture behind hero video)
            // As user scrolls past hero: smoothly transitions to 1.0 (normal ambient tone)
            const progress = Math.min(1.0, scrollY / (vh * 0.75));
            const targetDim = THREE.MathUtils.lerp(0.22, 1.0, progress);
            dimRef.current = THREE.MathUtils.damp(dimRef.current, targetDim, 6, delta);
        } else {
            dimRef.current = THREE.MathUtils.damp(dimRef.current, 1.0, 6, delta);
        }
        heroDimUniform.value = dimRef.current;
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
                            customProgramCacheKey={() => 'grid_bg_tile_shader'}
                            onBeforeCompile={(shader) => {
                                shader.uniforms.uHeroDim = heroDimUniform;
                                shader.fragmentShader = `uniform float uHeroDim;\n` + shader.fragmentShader;
                                shader.fragmentShader = shader.fragmentShader.replace(
                                    '#include <map_fragment>',
                                    `
                                    #ifdef USE_MAP
                                        vec4 sampledDiffuseColor = texture2D( map, vMapUv );
                                        // Perceptual Grayscale (Black & White conversion)
                                        float gray = dot(sampledDiffuseColor.rgb, vec3(0.299, 0.587, 0.114));
                                        // Darkened Ambient Tone (Subtle, non-distracting background for maximum content contrast)
                                        gray = clamp(pow(gray, 1.35) * 0.38, 0.0, 0.42);
                                        // Hero dimming factor (keeps hero video clear & unobstructed)
                                        gray *= uHeroDim;
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