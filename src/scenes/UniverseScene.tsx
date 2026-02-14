import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import Starfield from "./Starfield";
import LightTrail from "./LightTrail";
import Constellation from "./Constellation";

interface UniverseSceneProps {
  morphing: boolean;
  onMorphComplete?: () => void;
}

/**
 * Main 3D canvas scene: starfield + constellation + light trail + bloom.
 */
export default function UniverseScene({ morphing, onMorphComplete }: UniverseSceneProps) {
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
        <Constellation morphing={morphing} onMorphComplete={onMorphComplete} />
        <LightTrail />
        <EffectComposer>
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
