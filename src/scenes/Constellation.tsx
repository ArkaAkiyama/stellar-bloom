import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import { generateHeartPositions, generateScatteredPositions } from "@/utils/heartShape";
import { content } from "@/config/content";

interface ConstellationProps {
  morphing: boolean;
  orbitalReveal: boolean;
  onMorphComplete?: () => void;
  onOrbitalComplete?: () => void;
}

/**
 * Constellation: scattered → heart → dissolve → orbit → merge → burst → seal → ending
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
  const ringRef = useRef<THREE.Mesh>(null);
  const sealRef = useRef<THREE.Mesh>(null);
  const burstRef = useRef<THREE.PointLight>(null);
  const { camera, pointer } = useThree();
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const [phase, setPhase] = useState<"idle" | "heart" | "orbital" | "merging" | "seal" | "done">("idle");
  const phaseRef = useRef("idle");
  const glowRef = useRef(0);
  const orbitalStarted = useRef(false);
  const orbitRadiusRef = useRef(1.2);
  const burstOpacity = useRef(0);

  const [showStars, setShowStars] = useState(false);
  const [showRing, setShowRing] = useState(false);
  const [showLabel1, setShowLabel1] = useState(false);
  const [showLabel2, setShowLabel2] = useState(false);
  const [showSeal, setShowSeal] = useState(false);

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

  // Phase 2: Promise Seal sequence
  useEffect(() => {
    if (!orbitalReveal || orbitalStarted.current || phaseRef.current !== "heart") return;
    orbitalStarted.current = true;
    setPhase("orbital");

    const proxy = { dissolve: 0, starScale: 0, ringScale: 0, ringOpacity: 0 };
    const tl = gsap.timeline();
    tlRef.current = tl;

    // 1) Dissolve heart particles outward
    tl.to(proxy, {
      dissolve: 1, duration: 2.5, ease: "power2.in",
      onUpdate: () => {
        const d = proxy.dissolve;
        for (let i = 0; i < count * 3; i++) {
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
    tl.to(camera.position, { x: 0, y: 0, z: 7, duration: 2.5, ease: "power2.inOut" }, 0);

    // 2) Two stars emerge
    tl.call(() => setShowStars(true), [], 1.8);
    tl.to(proxy, {
      starScale: 1, duration: 1.5, ease: "power2.out",
      onUpdate: () => {
        starARef.current?.scale.setScalar(proxy.starScale);
        starBRef.current?.scale.setScalar(proxy.starScale);
      },
    }, 1.8);

    // 3) Glowing ring forms
    tl.call(() => setShowRing(true), [], 2.8);
    tl.to(proxy, {
      ringScale: 1, ringOpacity: 0.4, duration: 2, ease: "power2.out",
      onUpdate: () => {
        if (ringRef.current) {
          ringRef.current.scale.setScalar(proxy.ringScale * 2.8);
          (ringRef.current.material as THREE.MeshBasicMaterial).opacity = proxy.ringOpacity;
        }
      },
    }, 2.8);

    // 4) Text 1: "2 Years Since I Chose You"
    tl.call(() => setShowLabel1(true), [], 4);

    // 5) Stars move closer (merge)
    tl.to(orbitRadiusRef, {
      current: 0, duration: 3, ease: "power2.inOut",
    }, 7);
    tl.call(() => setPhase("merging"), [], 7);

    // 6) Light burst on merge
    tl.call(() => {
      burstOpacity.current = 1;
      setShowLabel1(false);
    }, [], 10);

    // 7) Fade burst, show seal
    tl.to(burstOpacity, {
      current: 0, duration: 2, ease: "power2.out",
    }, 10.5);
    tl.call(() => {
      setShowSeal(true);
      setPhase("seal");
    }, [], 11);

    // 8) Text 2: "Still Choosing You."
    tl.call(() => setShowLabel2(true), [], 12);

    // 9) Signal done (no auto-transition — user clicks Next)
    tl.call(() => {
      setPhase("done");
      onOrbitalComplete?.();
    }, [], 14);

  }, [orbitalReveal, camera, heart, scattered, currentPositions, count, onOrbitalComplete]);

  // Cleanup
  useEffect(() => {
    return () => { tlRef.current?.kill(); };
  }, []);

  // Per-frame animation
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const mat = pointsRef.current.material as THREE.PointsMaterial;

    if (phase === "orbital" || phase === "merging" || phase === "seal" || phase === "done") {
      glowRef.current += delta;

      // Orbit stars
      if (starARef.current && starBRef.current) {
        const angle = glowRef.current * 0.5;
        const r = orbitRadiusRef.current;
        starARef.current.position.x = Math.cos(angle) * r;
        starARef.current.position.y = Math.sin(angle) * r * 0.3;
        starARef.current.position.z = Math.sin(angle) * r * 0.5;

        starBRef.current.position.x = Math.cos(angle + Math.PI) * r;
        starBRef.current.position.y = Math.sin(angle + Math.PI) * r * 0.3;
        starBRef.current.position.z = Math.sin(angle + Math.PI) * r * 0.5;
      }

      // Ring rotation
      if (ringRef.current) {
        ringRef.current.rotation.z += delta * 0.15;
      }

      // Seal pulse
      if (sealRef.current) {
        const pulse = 0.8 + 0.15 * Math.sin(glowRef.current * 2);
        sealRef.current.scale.setScalar(pulse);
      }

      // Burst light
      if (burstRef.current) {
        burstRef.current.intensity = burstOpacity.current * 8;
      }

      // Dim particles
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
            <meshBasicMaterial color="#e9d5ff" transparent opacity={0.95} toneMapped={false} />
            <pointLight color="#c4b5fd" intensity={2} distance={4} />
          </mesh>

          <mesh ref={starBRef} scale={0}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#fde68a" transparent opacity={0.9} toneMapped={false} />
            <pointLight color="#fde68a" intensity={1.5} distance={3.5} />
          </mesh>
        </>
      )}

      {/* Glowing orbit ring */}
      {showRing && (
        <mesh ref={ringRef} scale={0} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.95, 1, 64]} />
          <meshBasicMaterial
            color="#c4b5fd"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Burst light */}
      <pointLight ref={burstRef} color="#fff5e0" intensity={0} distance={12} />

      {/* Infinity / halo seal */}
      {showSeal && (
        <mesh ref={sealRef} scale={0.8}>
          <torusGeometry args={[0.5, 0.02, 16, 64]} />
          <meshBasicMaterial
            color="#e9d5ff"
            transparent
            opacity={0.5}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Label 1: "2 Years Since I Chose You" */}
      {showLabel1 && (
        <Html center position={[0, -2.2, 0]} style={{ pointerEvents: "none" }}>
          <p
            style={{
              color: "hsl(270, 25%, 75%)",
              fontSize: "15px",
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              opacity: 0,
              animation: "fadeInLabel 2s ease-out forwards",
              whiteSpace: "nowrap",
            }}
          >
            {content.orbital.line1}
          </p>
          <style>{`
            @keyframes fadeInLabel {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </Html>
      )}

      {/* Label 2: "Still Choosing You." */}
      {showLabel2 && (
        <Html center position={[0, -1.8, 0]} style={{ pointerEvents: "none" }}>
          <p
            style={{
              color: "hsl(45, 80%, 70%)",
              fontSize: "17px",
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: "0.2em",
              fontStyle: "italic",
              opacity: 0,
              animation: "fadeInLabel 2.5s ease-out forwards",
              whiteSpace: "nowrap",
            }}
          >
            {content.orbital.line2}
          </p>
        </Html>
      )}
    </group>
  );
}
