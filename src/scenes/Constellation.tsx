import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import { generateHeartPositions, generateScatteredPositions } from "@/utils/heartShape";

interface ConstellationProps {
  morphing: boolean;
  orbitalReveal: boolean;
  onMorphComplete?: () => void;
  onOrbitalComplete?: () => void;
}

/**
 * Constellation particles: scattered → heart → dissolve → two orbiting stars.
 */
export default function Constellation({
  morphing,
  orbitalReveal,
  onMorphComplete,
  onOrbitalComplete,
}: ConstellationProps) {
  const { particleCount } = useDevicePerformance();
  const pointsRef = useRef<THREE.Points>(null);
  const starARef = useRef<THREE.Mesh>(null);
  const starBRef = useRef<THREE.Mesh>(null);
  const { camera, pointer } = useThree();
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [phase, setPhase] = useState<"idle" | "heart" | "orbital" | "done">("idle");
  const phaseRef = useRef("idle");
  const glowRef = useRef(0);
  const orbitalStarted = useRef(false);
  const [showLabel, setShowLabel] = useState(false);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const count = Math.min(particleCount, 2000);

  const { scattered, heart } = useMemo(() => ({
    scattered: generateScatteredPositions(count, 18),
    heart: generateHeartPositions(count, 3.5),
  }), [count]);

  const currentPositions = useMemo(() => new Float32Array(scattered), [scattered]);

  // Phase 1: Scattered → Heart
  useEffect(() => {
    if (!morphing || phase !== "idle") return;

    const proxy = { t: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setPhase("heart");
        onMorphComplete?.();
      },
    });
    tlRef.current = tl;

    tl.to(camera.position, {
      z: 8, y: 0.5, duration: 3, ease: "power2.inOut",
    }, 0);

    tl.to(proxy, {
      t: 1, duration: 3.5, ease: "power3.inOut",
      onUpdate: () => {
        for (let i = 0; i < count * 3; i++) {
          currentPositions[i] = scattered[i] + (heart[i] - scattered[i]) * proxy.t;
        }
        if (pointsRef.current) {
          const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
          attr.set(currentPositions);
          attr.needsUpdate = true;
        }
      },
    }, 0.3);

    return () => { tl.kill(); };
  }, [morphing, phase, camera, scattered, heart, currentPositions, count, onMorphComplete]);

  // Phase 2: Heart dissolves → two orbiting stars appear
  useEffect(() => {
    if (!orbitalReveal || orbitalStarted.current || phaseRef.current !== "heart") return;
    orbitalStarted.current = true;
    setPhase("orbital");

    const proxy = { dissolve: 0, starScale: 0 };
    const tl = gsap.timeline();
    tlRef.current = tl;

    // Dissolve heart particles outward
    tl.to(proxy, {
      dissolve: 1, duration: 2.5, ease: "power2.in",
      onUpdate: () => {
        const d = proxy.dissolve;
        for (let i = 0; i < count * 3; i++) {
          // Push particles outward from heart center
          currentPositions[i] = heart[i] * (1 + d * 3) + (scattered[i] - heart[i]) * d * 0.5;
        }
        if (pointsRef.current) {
          const mat = pointsRef.current.material as THREE.PointsMaterial;
          mat.opacity = 0.75 * (1 - d * 0.85);
          const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
          attr.set(currentPositions);
          attr.needsUpdate = true;
        }
      },
    }, 0);

    // Camera centers
    tl.to(camera.position, {
      x: 0, y: 0, z: 7, duration: 2.5, ease: "power2.inOut",
    }, 0);

    // Reveal the two orbiting stars
    tl.call(() => setShowStars(true), [], 1.8);
    tl.to(proxy, {
      starScale: 1, duration: 1.5, ease: "power2.out",
      onUpdate: () => {
        const s = proxy.starScale;
        starARef.current?.scale.setScalar(s);
        starBRef.current?.scale.setScalar(s);
      },
    }, 1.8);

    // Show label
    tl.call(() => setShowLabel(true), [], 3.5);

    // Hold for 5s then signal completion
    tl.call(() => {
      setPhase("done");
      onOrbitalComplete?.();
    }, [], 9);

  }, [orbitalReveal, camera, heart, scattered, currentPositions, count, onOrbitalComplete]);

  // Cleanup
  useEffect(() => {
    return () => { tlRef.current?.kill(); };
  }, []);

  // Per-frame: orbit the two stars + effects
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const mat = pointsRef.current.material as THREE.PointsMaterial;

    if (phase === "orbital" || phase === "done") {
      glowRef.current += delta;

      // Orbit the two stars around each other
      if (starARef.current && starBRef.current) {
        const angle = glowRef.current * 0.4;
        const radius = 1.2;
        starARef.current.position.x = Math.cos(angle) * radius;
        starARef.current.position.y = Math.sin(angle) * radius * 0.3;
        starARef.current.position.z = Math.sin(angle) * radius * 0.5;

        starBRef.current.position.x = Math.cos(angle + Math.PI) * radius;
        starBRef.current.position.y = Math.sin(angle + Math.PI) * radius * 0.3;
        starBRef.current.position.z = Math.sin(angle + Math.PI) * radius * 0.5;
      }

      // Residual particles dim further
      mat.opacity = Math.max(0.03, mat.opacity - delta * 0.02);
    } else if (phase === "heart") {
      glowRef.current += delta;
      mat.opacity = 0.7 + 0.2 * Math.sin(glowRef.current * 1.5);
      pointsRef.current.rotation.y += delta * 0.08;
    } else if (!morphing) {
      pointsRef.current.rotation.y +=
        (pointer.x * 0.03 - pointsRef.current.rotation.y) * delta * 0.4;
      pointsRef.current.rotation.x +=
        (-pointer.y * 0.03 - pointsRef.current.rotation.x) * delta * 0.4;
    }
  });

  return (
    <group>
      {/* Particle field */}
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

      {/* Two orbiting stars */}
      {showStars && (
        <>
          <mesh ref={starARef} scale={0}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial
              color="#e9d5ff"
              transparent
              opacity={0.95}
              toneMapped={false}
            />
            {/* Inner glow */}
            <pointLight color="#c4b5fd" intensity={2} distance={4} />
          </mesh>

          <mesh ref={starBRef} scale={0}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial
              color="#fde68a"
              transparent
              opacity={0.9}
              toneMapped={false}
            />
            <pointLight color="#fde68a" intensity={1.5} distance={3.5} />
          </mesh>

          {/* Centered label */}
          {showLabel && (
            <Html center position={[0, -2, 0]} style={{ pointerEvents: "none" }}>
              <p
                style={{
                  color: "hsl(270, 25%, 75%)",
                  fontSize: "15px",
                  fontFamily: "serif",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  opacity: 0,
                  animation: "fadeInLabel 2s ease-out forwards",
                  whiteSpace: "nowrap",
                }}
              >
                2 Years.
              </p>
              <style>{`
                @keyframes fadeInLabel {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </Html>
          )}
        </>
      )}
    </group>
  );
}
