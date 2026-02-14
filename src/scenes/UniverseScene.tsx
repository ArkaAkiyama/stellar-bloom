import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import Starfield from "./Starfield";
import LightTrail from "./LightTrail";
import Constellation from "./Constellation";
import MemoriesGallery from "./MemoriesGallery";

interface UniverseSceneProps {
  morphing: boolean;
  showMemories: boolean;
  textReveal: boolean;
  onMorphComplete?: () => void;
  onTextRevealComplete?: () => void;
}

/**
 * Main 3D canvas scene with all sub-scenes and post-processing.
 */
export default function UniverseScene({ morphing, showMemories, textReveal, onMorphComplete, onTextRevealComplete }: UniverseSceneProps) {
  const { bloomIntensity, dpr } = useDevicePerformance();

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 10], fov: 60 }}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
      gl={{ antialias: false, alpha: true }}
    >
      <color attach="background" args={["#0a0e1a"]} />
      <Suspense fallback={null}>
        <Starfield />
        <Constellation morphing={morphing} textReveal={textReveal} onMorphComplete={onMorphComplete} onTextRevealComplete={onTextRevealComplete} />
        <MemoriesGallery visible={showMemories} />
        <LightTrail />
        <EffectComposer>
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          {showMemories && (
            <DepthOfField
              focusDistance={0.02}
              focalLength={0.05}
              bokehScale={3}
            />
          )}
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
