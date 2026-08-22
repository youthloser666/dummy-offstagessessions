'use client';

import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment, Float, PresentationControls, Center } from '@react-three/drei';

import { EffectComposer } from '@react-three/postprocessing';
import { Fluid } from './react-fluid-distortion';
import * as THREE from 'three';

/* ───────────────────────────────────────────────
   Orbital Rings — cincin tipis yang mengorbit logo
   ─────────────────────────────────────────────── */
function OrbitalRing({
  radiusX = 3,
  radiusY = 3,
  rotationOffset = [0, 0, 0] as [number, number, number],
  speed = 0.3,
  color = '#ffffff',
  opacity = 0.15,
  lineWidth = 1.5,
  dashScale = 1,
  dashed = false,
}: {
  radiusX?: number;
  radiusY?: number;
  rotationOffset?: [number, number, number];
  speed?: number;
  color?: string;
  opacity?: number;
  lineWidth?: number;
  dashScale?: number;
  dashed?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  // Buat ellipse curve
  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radiusX, radiusY, 0, Math.PI * 2, false, 0);
    const pts = curve.getPoints(128);
    return pts.map((p) => new THREE.Vector3(p.x, 0, p.y));
  }, [radiusX, radiusY]);

  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      linewidth: lineWidth,
    });
    return new THREE.Line(geo, mat);
  }, [points, color, opacity, lineWidth]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * speed;
    }
  });

  return (
    <group ref={ref} rotation={rotationOffset}>
      <primitive object={lineObj} />
    </group>
  );
}

/* ───────────────────────────────────────────────
   Orbital Rings Group — 3 cincin di sudut berbeda
   ─────────────────────────────────────────────── */
function OrbitalRings() {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Scale factor berdasarkan lebar viewport — base design di width ~10 unit (desktop)
  const scale = Math.min(viewport.width / 10, 1);

  // Seluruh group mengikuti mouse sedikit (parallax halus)
  useFrame((state, delta) => {
    if (groupRef.current) {
      const targetX = state.pointer.y * 0.1;
      const targetY = state.pointer.x * 0.1;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, delta * 2);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, delta * 2);
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Ring 1 — Horizontal besar, miring sedikit */}
      <OrbitalRing
        radiusX={3.5}
        radiusY={3.2}
        rotationOffset={[0.3, 0, 0.1]}
        speed={0.15}
        color="#ffffff"
        opacity={0.12}
      />
      {/* Ring 2 — Vertikal miring, lebih kecil */}
      <OrbitalRing
        radiusX={2.8}
        radiusY={2.5}
        rotationOffset={[1.2, 0.5, 0.3]}
        speed={-0.2}
        color="#88ffaa"
        opacity={0.1}
      />
      {/* Ring 3 — Diagonal, paling kecil & paling cepat */}
      <OrbitalRing
        radiusX={2.2}
        radiusY={2.0}
        rotationOffset={[0.8, -0.4, 1.0]}
        speed={0.25}
        color="#aaffcc"
        opacity={0.08}
      />
    </group>
  );
}

/* ───────────────────────────────────────────────
   Model — GLB logo with Draco compression support & disabled shadows
   ─────────────────────────────────────────────── */
function Model({ onHoverChange, ...props }: any) {
  // Load the GLTF model with Draco compression support enabled
  const { scene, animations } = useGLTF('/3D/offstage_logo.glb', true);
  const innerRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { actions } = useAnimations(animations, innerRef);
  const targetVec = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    // Jalankan semua animasi bawaan dari GLB
    if (actions) {
      Object.keys(actions).forEach((key) => {
        actions[key]?.play();
      });
    }

    // Matikan bayangan (shadows) pada semua mesh untuk performa maksimal
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
  }, [scene, actions]);

  // Animasi saat dihover dan mengikuti kursor mouse
  useFrame((state, delta) => {
    if (innerRef.current) {
      // 1. Efek membesar (scale) + Blob / Jelly Wobble saat di-hover
      const targetScale = hovered ? 1.15 : 1.0;
      let scaleX = targetScale;
      let scaleY = targetScale;
      let scaleZ = targetScale;

      if (hovered) {
        // Matematika sederhana untuk membuat efek "blob / jelly" bernapas dan berdistorsi
        const t = state.clock.getElapsedTime();
        scaleX += Math.sin(t * 12) * 0.06;
        scaleY += Math.cos(t * 12) * 0.06;
        scaleZ += Math.sin(t * 8) * 0.06;
      }

      targetVec.set(scaleX, scaleY, scaleZ);
      innerRef.current.scale.lerp(targetVec, delta * 8);

      // 2. Efek mengikuti arah mouse (Parallax)
      const targetRotationX = (state.pointer.y * Math.PI) / 6;
      const targetRotationY = (state.pointer.x * Math.PI) / 6;

      innerRef.current.rotation.x = THREE.MathUtils.lerp(innerRef.current.rotation.x, targetRotationX, delta * 3);
      innerRef.current.rotation.y = THREE.MathUtils.lerp(innerRef.current.rotation.y, targetRotationY, delta * 3);
    }
  });

  return (
    <group {...props} dispose={null}>
      <group
        ref={innerRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHoverChange?.(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          setHovered(false);
          onHoverChange?.(false);
          document.body.style.cursor = 'grab';
        }}
      >
        <primitive object={scene} />
      </group>
    </group>
  );
}

/* ───────────────────────────────────────────────
   Logo3D — Main component (Optimized R3F Canvas)
   ─────────────────────────────────────────────── */
export default function Logo3D() {
  const [logoHovered, setLogoHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div 
      className="touch-none max-md:pointer-events-none" 
      style={{ 
        width: '100%', 
        height: '70vh', 
        minHeight: '550px', 
        cursor: 'grab', 
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <Canvas 
        dpr={isMobile ? 1 : [1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ powerPreference: 'high-performance', antialias: true, alpha: true }}
        camera={{ position: [0, 0, 8], fov: 45, near: 0.1, far: 1000 }}
        className="touch-none"
        style={{ touchAction: 'none', width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = 'none';
        }}
      >
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow={false} />

        <Suspense fallback={null}>
          {/* Orbital Rings di belakang logo */}
          <OrbitalRings />

          <PresentationControls
            global={!isMobile}
            rotation={[0, 0, 0]}
            polar={[-0.1, 0.1]}
            azimuth={[-0.3, 0.3]}
            config={{ mass: 1, tension: 170, friction: 26 }}
          >
            <Float
              speed={2}
              rotationIntensity={0.1}
              floatIntensity={0.2}
            >
              <Center>
                <Model
                  scale={7}
                  rotation={[Math.PI / 2, 0, 0]}
                  onHoverChange={setLogoHovered}
                />
              </Center>
            </Float>
          </PresentationControls>

          {!isMobile && (
            <EffectComposer>
              <Fluid 
                radius={0.04}
                curl={4}
                swirl={3}
                distortion={0.2}
                force={logoHovered ? 1.5 : 0}
                showBackground={false}
                fluidColor="#55ff55"
                rainbow={false}
                blend={0.7}
                densityDissipation={0.96}
                velocityDissipation={0.97}
                pressure={0.8}
              />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload the model with Draco compression support enabled
useGLTF.preload('/3D/offstage_logo.glb', true);


