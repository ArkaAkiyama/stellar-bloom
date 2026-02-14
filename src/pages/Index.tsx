import { useState, lazy, Suspense } from "react";
import CinematicIntro from "@/components/CinematicIntro";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";

const UniverseScene = lazy(() => import("@/scenes/UniverseScene"));

/**
 * Main entry page: Cinematic intro → 3D universe.
 */
const Index = () => {
  const [entered, setEntered] = useState(false);
  const { play } = useAmbientAudio();

  const handleEnter = () => {
    play();
    setEntered(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0a0e1a" }}>
      {/* 3D Scene — always mounted for preloading, hidden until entered */}
      <Suspense fallback={null}>
        <div
          style={{
            opacity: entered ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
          }}
        >
          <UniverseScene />
        </div>
      </Suspense>

      {/* Intro overlay */}
      {!entered && <CinematicIntro onEnter={handleEnter} />}
    </div>
  );
};

export default Index;
