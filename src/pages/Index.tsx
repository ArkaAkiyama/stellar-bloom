import { useState, lazy, Suspense, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicIntro from "@/components/CinematicIntro";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";

const UniverseScene = lazy(() => import("@/scenes/UniverseScene"));

const Index = () => {
  const [entered, setEntered] = useState(false);
  const [morphing, setMorphing] = useState(false);
  const [morphComplete, setMorphComplete] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const { play } = useAmbientAudio();

  const handleEnter = () => {
    play();
    setEntered(true);
  };

  const handleSeeUs = () => {
    if (!morphing && !morphComplete) {
      setMorphing(true);
    }
  };

  const handleMorphComplete = useCallback(() => {
    setMorphComplete(true);
  }, []);

  const handleShowMemories = () => {
    setShowMemories(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0a0e1a" }}>
      {/* 3D Scene */}
      <Suspense fallback={null}>
        <div
          style={{
            opacity: entered ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
          }}
        >
          <UniverseScene
            morphing={morphing}
            showMemories={showMemories}
            onMorphComplete={handleMorphComplete}
          />
        </div>
      </Suspense>

      {/* Intro overlay */}
      {!entered && <CinematicIntro onEnter={handleEnter} />}

      {/* "See Us" button */}
      <AnimatePresence>
        {entered && !morphing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="fixed inset-x-0 bottom-16 z-10 flex justify-center md:bottom-20"
          >
            <button
              onClick={handleSeeUs}
              className="border px-10 py-3 text-sm uppercase tracking-[0.3em] transition-all duration-500 hover:tracking-[0.5em]"
              style={{
                color: "hsl(270, 40%, 78%)",
                borderColor: "hsl(270, 20%, 28%)",
                background: "hsla(270, 30%, 10%, 0.4)",
                backdropFilter: "blur(8px)",
              }}
            >
              See Us
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-morph message + Memories button */}
      <AnimatePresence>
        {morphComplete && !showMemories && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="fixed inset-x-0 bottom-12 z-10 flex flex-col items-center gap-6 md:bottom-16"
          >
            <p
              className="font-serif text-base tracking-wide md:text-lg"
              style={{ color: "hsl(270, 30%, 70%)" }}
            >
              Every star led me to you.
            </p>
            <button
              onClick={handleShowMemories}
              className="border px-8 py-2.5 text-xs uppercase tracking-[0.3em] transition-all duration-500 hover:tracking-[0.5em]"
              style={{
                color: "hsl(270, 40%, 78%)",
                borderColor: "hsl(270, 20%, 28%)",
                background: "hsla(270, 30%, 10%, 0.4)",
                backdropFilter: "blur(8px)",
              }}
            >
              Our Memories
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
