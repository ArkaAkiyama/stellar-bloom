import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import { generateHeartPositions, generateScatteredPositions } from "@/utils/heartShape";
import { generateTextPositions } from "@/utils/textShape";
import { content } from "@/config/content";

interface ConstellationProps {
  morphing: boolean;
  textReveal: boolean;
  onMorphComplete?: () => void;
  onTextRevealComplete?: () => void;
}

/**
 * Constellation particles: scattered → heart → text message.
 * Each phase uses GSAP to lerp between pre-computed position buffers.
 */
export default function Constellation({
  morphing,
  textReveal,
  onMorphComplete,
  onTextRevealComplete,
}: ConstellationProps) {
  const { particleCount } = useDevicePerformance();
  const pointsRef = useRef<THREE.Points>(null);
  const { camera, pointer } = useThree();
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [phase, setPhase] = useState<"idle" | "heart" | "text" | "done">("idle");
  const glowRef = useRef(0);

  const count = Math.min(particleCount, 2000);

  // Pre-compute all three position sets
  const { scattered, heart, text } = useMemo(() => ({
    scattered: generateScatteredPositions(count, 18),
    heart: generateHeartPositions(count, 3.5),
    text: generateTextPositions(content.constellationMessage, count, 5),
  }), [count]);

  // Mutable position buffer (reused across all phases)
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

  // Phase 2: Heart → Text
  useEffect(() => {
    if (!textReveal || phase !== "heart") return;

    setPhase("text");
    const proxy = { t: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        // Hold for 3.5 seconds, then signal completion
        gsap.delayedCall(3.5, () => {
          setPhase("done");
          onTextRevealComplete?.();
        });
      },
    });
    tlRef.current = tl;

    // Dissolve heart: briefly scatter, then reform as text
    tl.to(proxy, {
      t: 1, duration: 4, ease: "power2.inOut",
      onUpdate: () => {
        const t = proxy.t;
        // Eased dissolve-to-text: slight scatter in first half, converge in second
        const scatter = Math.sin(t * Math.PI) * 0.4; // peaks at t=0.5
        for (let i = 0; i < count * 3; i++) {
          const fromHeart = heart[i];
          const toText = text[i];
          const base = fromHeart + (toText - fromHeart) * t;
          currentPositions[i] = base + (Math.random() - 0.5) * scatter;
        }
        if (pointsRef.current) {
          const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
          attr.set(currentPositions);
          attr.needsUpdate = true;
        }
      },
    }, 0);

    // Camera: center and zoom in gently
    tl.to(camera.position, {
      x: 0, y: 0.2, z: 6, duration: 3, ease: "power2.inOut",
    }, 0);

    return () => { tl.kill(); };
  }, [textReveal, phase, camera, heart, text, currentPositions, count, onTextRevealComplete]);

  // Cleanup
  useEffect(() => {
    return () => { tlRef.current?.kill(); };
  }, []);

  // Per-frame effects
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const mat = pointsRef.current.material as THREE.PointsMaterial;

    if (phase === "text" || phase === "done") {
      // Bright glow pulse during text
      glowRef.current += delta;
      mat.opacity = 0.85 + 0.12 * Math.sin(glowRef.current * 1.2);
      mat.size = 0.09 + 0.015 * Math.sin(glowRef.current * 0.8);
    } else if (phase === "heart") {
      glowRef.current += delta;
      mat.opacity = 0.7 + 0.2 * Math.sin(glowRef.current * 1.5);
      pointsRef.current.rotation.y += delta * 0.08;
    } else if (!morphing) {
      // Subtle parallax
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
