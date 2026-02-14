import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";

/**
 * Living particle starfield with subtle parallax and pointer reactivity.
 * Uses BufferGeometry + Points for performance.
 */
export default function Starfield() {
  const { particleCount } = useDevicePerformance();
  const pointsRef = useRef<THREE.Points>(null);
  const { pointer } = useThree();

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const sz = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      sz[i] = Math.random() * 2 + 0.5;
    }
    return { positions: pos, sizes: sz };
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    // Subtle parallax rotation following pointer
    pointsRef.current.rotation.y += (pointer.x * 0.02 - pointsRef.current.rotation.y) * delta * 0.5;
    pointsRef.current.rotation.x += (-pointer.y * 0.02 - pointsRef.current.rotation.x) * delta * 0.5;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={particleCount}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          count={particleCount}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#c4b5fd"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
