'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './FluidDistortionBanner.module.css';

interface FluidDistortionBannerProps {
    src: string;
    alt?: string;
    className?: string;
    priority?: boolean;
}

const VERTEX_SHADER = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
        vUv = aPosition * 0.5 + 0.5;
        vUv.y = 1.0 - vUv.y; // Flip Y for WebGL texture orientation
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const FRAGMENT_SHADER = `
    precision highp float;
    uniform sampler2D uTexture;
    uniform vec2 uMouse;
    uniform float uHover;
    uniform float uTime;
    uniform float uAspect;
    uniform float uImgAspect;
    varying vec2 vUv;

    void main() {
        // object-fit: cover UV mapping
        vec2 uv = vUv;
        float ratio = uAspect / uImgAspect;
        if (ratio > 1.0) {
            // Container wider than image — fit width, crop top/bottom
            uv.y = uv.y / ratio + (1.0 - 1.0 / ratio) * 0.5;
        } else {
            // Container taller than image — fit height, crop sides
            uv.x = uv.x * ratio + (1.0 - ratio) * 0.5;
        }

        vec2 mouse = vUv; // use screen-space for mouse
        mouse = uMouse;
        
        // Aspect ratio correction for circular ripple
        vec2 diff = vUv - mouse;
        diff.x *= uAspect;
        float dist = length(diff);
        
        // Fluid wave ripple calculation with velocity decay
        float wave = sin(dist * 22.0 - uTime * 4.5) * exp(-dist * 5.0);
        vec2 offset = normalize(diff + vec2(0.0001)) * wave * 0.04 * uHover;
        
        // Apply offset in UV space (scaled for cover mapping)
        if (ratio > 1.0) {
            offset.y /= ratio;
        } else {
            offset.x *= ratio;
        }
        
        // Chromatic aberration (RGB split)
        float r = texture2D(uTexture, clamp(uv + offset * 1.3, 0.0, 1.0)).r;
        float g = texture2D(uTexture, clamp(uv + offset, 0.0, 1.0)).g;
        float b = texture2D(uTexture, clamp(uv + offset * 0.7, 0.0, 1.0)).b;
        
        // Color with subtle gloss highlight
        vec3 color = vec3(r, g, b) + vec3(max(0.0, wave * 0.2 * uHover));
        
        gl_FragColor = vec4(color, 1.0);
    }
`;


export default function FluidDistortionBanner({
    src,
    alt = '',
    className = '',
    priority = false,
}: FluidDistortionBannerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        // Skip WebGL on touch/mobile devices for optimum battery/performance
        if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
            setIsSupported(false);
            return;
        }

        const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
        if (!gl) {
            setIsSupported(false);
            return;
        }

        // Compile Shader Helper
        const createShader = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
        const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        if (!vertShader || !fragShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        // Quad Buffer
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
        );

        const aPosition = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        // Uniform Locations
        const uTextureLoc = gl.getUniformLocation(program, 'uTexture');
        const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
        const uHoverLoc = gl.getUniformLocation(program, 'uHover');
        const uTimeLoc = gl.getUniformLocation(program, 'uTime');
        const uAspectLoc = gl.getUniformLocation(program, 'uAspect');
        const uImgAspectLoc = gl.getUniformLocation(program, 'uImgAspect');

        // Texture Setup
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Load image into texture
        let imgAspect = 1.0;
        let textureReady = false;
        const image = new window.Image();
        image.crossOrigin = 'anonymous';
        image.src = src;
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            imgAspect = image.naturalWidth / image.naturalHeight;
            gl.uniform1f(uImgAspectLoc, imgAspect);
            textureReady = true;
        };

        let mouseX = 0.5;
        let mouseY = 0.5;
        let targetHover = 0;
        let currentHover = 0;
        let startTime = performance.now();
        let animationFrameId: number;
        let isHovered = false;

        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(uAspectLoc, rect.width / rect.height);
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width;
            mouseY = (e.clientY - rect.top) / rect.height;
        };

        const handleMouseEnter = () => {
            isHovered = true;
            targetHover = 1;
        };

        const handleMouseLeave = () => {
            isHovered = false;
            targetHover = 0;
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);

        const render = () => {
            if (!textureReady) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            currentHover += (targetHover - currentHover) * 0.08;
            const elapsedTime = (performance.now() - startTime) / 1000;

            gl.uniform2f(uMouseLoc, mouseX, mouseY);
            gl.uniform1f(uHoverLoc, currentHover);
            gl.uniform1f(uTimeLoc, elapsedTime);
            gl.uniform1i(uTextureLoc, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', updateSize);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseenter', handleMouseEnter);
            container.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
            gl.deleteProgram(program);
            gl.deleteShader(vertShader);
            gl.deleteShader(fragShader);
            gl.deleteTexture(texture);
            gl.deleteBuffer(positionBuffer);
        };
    }, [src]);

    return (
        <div ref={containerRef} className={`${styles.fluidContainer} ${className}`}>
            {isSupported && (
                <canvas ref={canvasRef} className={styles.fluidCanvas} />
            )}
            {/* Fallback & SSR Image */}
            <Image
                src={src}
                alt={alt}
                fill
                priority={priority}
                className={`${styles.fallbackImg} ${isSupported ? styles.imgHiddenOnDesktop : ''}`}
            />
        </div>
    );
}
