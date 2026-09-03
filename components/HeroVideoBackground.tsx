'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D map;
  uniform float opacity;
  uniform vec2 repeat;
  uniform vec2 offset;
  varying vec2 vUv;

  void main() {
    vec2 vidUv = vUv * repeat + offset;
    vec4 sampled = texture2D(map, vidUv);
    
    // Perceptual Grayscale
    float g = dot(sampled.rgb, vec3(0.299, 0.587, 0.114));
    // Darkened Ambient Tone matching grid photo background
    g = clamp(pow(g, 1.35) * 0.38, 0.0, 0.42);
    
    // Smooth bottom fading edge (gradasi lembut di bagian bawah video)
    float bottomFade = smoothstep(0.0, 0.45, vUv.y);
    float edgeFade = bottomFade;
    
    gl_FragColor = vec4(vec3(g * edgeFade), sampled.a * opacity * edgeFade);
  }
`;

export default function HeroVideoBackground({ visible = true }: { visible?: boolean }) {
    const { viewport } = useThree();
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
    const opacityRef = useRef(visible ? 1 : 0);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const planeWidth = viewport.width * 1.05;
    const planeHeight = viewport.height * 1.25;
    const initialY = -viewport.height * 0.08;

    const dummyTexture = useMemo(() => {
        const tex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
        tex.needsUpdate = true;
        return tex;
    }, []);

    const uniforms = useMemo(() => ({
        map: { value: dummyTexture as THREE.Texture },
        opacity: { value: 1.0 },
        repeat: { value: new THREE.Vector2(1, 1) },
        offset: { value: new THREE.Vector2(0, 0) },
    }), [dummyTexture]);

    useEffect(() => {
        const video = document.createElement('video');
        video.src = '/hero-video.mp4';
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        videoRef.current = video;

        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
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
        setVideoTexture(texture);
        uniforms.map.value = texture;

        return () => {
            video.pause();
            video.removeAttribute('src');
            video.load();
            texture.dispose();
            videoRef.current = null;
        };
    }, [uniforms]);

    // Update cover-fit aspect ratio whenever viewport or video metadata changes
    useEffect(() => {
        if (!videoRef.current) return;
        const video = videoRef.current;

        const updateAspect = () => {
            if (video.videoWidth && video.videoHeight && planeWidth && planeHeight) {
                const videoAspect = video.videoWidth / video.videoHeight;
                const planeAspect = planeWidth / planeHeight;
                let repX = 1.0;
                let repY = 1.0;
                let offX = 0.0;
                let offY = 0.0;

                if (videoAspect > planeAspect) {
                    repX = planeAspect / videoAspect;
                    offX = (1.0 - repX) / 2.0;
                } else {
                    repY = videoAspect / planeAspect;
                    offY = (1.0 - repY) / 2.0;
                }

                uniforms.repeat.value.set(repX, repY);
                uniforms.offset.value.set(offX, offY);
            }
        };

        video.addEventListener('loadedmetadata', updateAspect);
        updateAspect();
        return () => video.removeEventListener('loadedmetadata', updateAspect);
    }, [planeWidth, planeHeight, uniforms]);

    // Keep position synchronized with Lenis scroll on every frame
    useFrame((_, delta) => {
        const target = visible ? 1 : 0;
        opacityRef.current = THREE.MathUtils.damp(opacityRef.current, target, 8, delta);

        if (meshRef.current) {
            meshRef.current.visible = opacityRef.current > 0.005;
            const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
            const unitPerPixel = viewport.height / (typeof window !== 'undefined' ? (window.innerHeight || 1) : 1);
            meshRef.current.position.y = initialY + scrollY * unitPerPixel;
        }

        if (materialRef.current) {
            materialRef.current.uniforms.opacity.value = opacityRef.current;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, initialY, 0.05]}>
            <planeGeometry args={[planeWidth, planeHeight]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                toneMapped={false}
            />
        </mesh>
    );
}
