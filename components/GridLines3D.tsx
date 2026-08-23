'use client';

import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function GridLines3D() {
    const { viewport, size } = useThree();

    const shaderMat = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: {
                uResolution: { value: new THREE.Vector2(size.width, size.height) },
                uGridSize: { value: 40.0 },
                uColor: { value: new THREE.Color('#ffffff') },
                uOpacity: { value: 0.1 },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec2 uResolution;
                uniform float uGridSize;
                uniform vec3 uColor;
                uniform float uOpacity;
                varying vec2 vUv;

                void main() {
                    vec2 screenCoord = vUv * uResolution;
                    vec2 grid = abs(fract(screenCoord / uGridSize - 0.5) - 0.5) / (fwidth(screenCoord / uGridSize));
                    float line = min(grid.x, grid.y);
                    float c = 1.0 - min(line, 1.0);
                    gl_FragColor = vec4(uColor, c * uOpacity);
                }
            `,
        });
    }, []);

    useMemo(() => {
        if (shaderMat) {
            shaderMat.uniforms.uResolution.value.set(size.width, size.height);
        }
    }, [size.width, size.height, shaderMat]);

    return (
        <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
            <primitive object={shaderMat} attach="material" />
        </mesh>
    );
}
