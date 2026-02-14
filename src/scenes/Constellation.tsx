import { useRef, useMemo, useEffect, useCallback, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import { generateHeartPositions, generateScatteredPositions } from "@/utils/heartShape";

interface ConstellationProps {
  morphing: boolean;
  onMorphComplete?: () => void;
}

/**
 * Constellation particles that morph into a heart shape via GSAP.
 * Pre-computes both scattered and heart positions for performance.
 */
export default function Constellation({ morphing, onMorphComplete }: ConstellationProps) {
  const { particleCount } = useDevicePerformance();
  const pointsRef = useRef<THREE.Points>(null);
  const { camera, pointer } = useThree();
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [hasMorphed, setHasMorphed] = useState(false);
  const glowRef = useRef(0);

  const count = Math.min(particleCount, 2000);

  // Pre-compute both position sets
  const { scattered, heart } = useMemo(() => ({
    scattered: generateScatteredPositions(count, 18),
    heart: generateHeartPositions(count, 3.5),
  }), [count]);

  // Current animated positions (mutable buffer)
  const currentPositions = useMemo(() => new Float32Array(scattered), [scattered]);

  // Trigger morph animation
  useEffect(() => {
    if (!morphing || hasMorphed) return;

    // Animate each particle position via a proxy object
    const proxy = { t: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setHasMorphed(true);
        onMorphComplete?.();
      },
    });
    tlRef.current = tl;

    // Camera dolly
    tl.to(camera.position, {
      z: 8,
      y: 0.5,
      duration: 3,
      ease: "power2.inOut",
    }, 0);

    // Particle morph — lerp between scattered and heart
    tl.to(proxy, {
      t: 1,
      duration: 3.5,
      ease: "power3.inOut",
      onUpdate: () => {
        for (let i = 0; i < count * 3; i++) {
          currentPositions[i] = scattered[i] + (heart[i] - scattered[i]) * proxy.t;
        }
        if (pointsRef.current) {
          const attr = pointsRef.current.geometry.attributes.position;
          (attr as THREE.BufferAttribute).set(currentPositions);
          attr.needsUpdate = true;
        }
      },
    }, 0.3);

    return () => {
      tl.kill();
    };
  }, [morphing, hasMorphed, camera, scattered, heart, currentPositions, count, onMorphComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      tlRef.current?.kill();
    };
  }, []);

  // Subtle glow pulse after morph + parallax
  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const mat = pointsRef.current.material as THREE.PointsMaterial;

    if (hasMorphed) {
      // Pulse opacity
      glowRef.current += delta;
      mat.opacity = 0.7 + 0.2 * Math.sin(glowRef.current * 1.5);

      // Gentle rotation
      pointsRef.current.rotation.y += delta * 0.08;
    } else if (!morphing) {
      // Subtle parallax before morph
      pointsRef.current.rotation.y +=
        (pointer.x * 0.03 - pointsRef.current.rotation.y) * delta * 0.4;
      pointsRef.current.rotation.x +=
        (-pointer.y * 0.03 - pointsRef.current.rotation.x) * delta * 0.4;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={currentPositions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#e9d5ff"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
