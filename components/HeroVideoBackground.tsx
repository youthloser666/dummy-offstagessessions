'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function HeroVideoBackground({ visible = true }: { visible?: boolean }) {
    const { viewport } = useThree();
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);
    const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
    const opacityRef = useRef(visible ? 1 : 0);

    useEffect(() => {
        const video = document.createElement('video');
        video.src = '/hero-video.mp4';
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;

        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Autoplay fallback: re-try on first user interaction
                const handleInteract = () => {
                    video.play().catch(() => {});
                    window.removeEventListener('click', handleInteract);
                    window.removeEventListener('touchstart', handleInteract);
                };
                window.addEventListener('click', handleInteract, { once: true });
                window.addEventListener('touchstart', handleInteract, { once: true });
            });
        }

        const texture = new THREE.VideoTexture(video);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        // Cover-fit aspect ratio so video is never distorted
        const updateAspect = () => {
            if (video.videoWidth && video.videoHeight && viewport.width && viewport.height) {
                const videoAspect = video.videoWidth / video.videoHeight;
                const viewAspect = viewport.width / viewport.height;
                if (videoAspect > viewAspect) {
                    const scaleX = viewAspect / videoAspect;
                    texture.repeat.set(scaleX, 1.0);
                    texture.offset.set((1 - scaleX) / 2, 0);
                } else {
                    const scaleY = videoAspect / viewAspect;
                    texture.repeat.set(1.0, scaleY);
                    texture.offset.set(0, (1 - scaleY) / 2);
                }
                texture.needsUpdate = true;
            }
        };

        video.addEventListener('loadedmetadata', updateAspect);
        updateAspect();
        setVideoTexture(texture);

        return () => {
            video.pause();
            video.removeAttribute('src');
            video.load();
            texture.dispose();
        };
    }, [viewport.width, viewport.height]);

    // Synchronize vertical scroll to move video plane upward with the hero section
    useEffect(() => {
        const handleScroll = () => {
            if (meshRef.current) {
                const scrollY = window.scrollY;
                const unitPerPixel = viewport.height / (window.innerHeight || 1);
                meshRef.current.position.y = scrollY * unitPerPixel;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [viewport.height]);

    // Smooth fade in / out when switching routes
    useFrame((_, delta) => {
        const target = visible ? 1 : 0;
        opacityRef.current = THREE.MathUtils.damp(opacityRef.current, target, 8, delta);

        if (meshRef.current) {
            meshRef.current.visible = opacityRef.current > 0.005;
        }
        if (materialRef.current) {
            materialRef.current.opacity = opacityRef.current;
        }
    });

    if (!videoTexture) return null;

    return (
        <mesh ref={meshRef} position={[0, 0, 0.02]}>
            <planeGeometry args={[viewport.width * 1.05, viewport.height * 1.05]} />
            <meshBasicMaterial
                ref={materialRef}
                map={videoTexture}
                toneMapped={false}
                transparent
                opacity={1}
                onBeforeCompile={(shader) => {
                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <map_fragment>',
                        `
                        #ifdef USE_MAP
                            vec4 sampled = texture2D( map, vMapUv );
                            // Perceptual Grayscale
                            float g = dot(sampled.rgb, vec3(0.299, 0.587, 0.114));
                            // Darkened Ambient Tone matching grid photo background
                            g = clamp(pow(g, 1.35) * 0.38, 0.0, 0.42);
                            diffuseColor = vec4(vec3(g), sampled.a * opacity);
                        #endif
                        `
                    );
                }}
            />
        </mesh>
    );
}
