import { useState, lazy, Suspense, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicIntro from "@/components/CinematicIntro";
import LoveLetter from "@/components/LoveLetter";
import TimeCapsule from "@/components/TimeCapsule";
import EndingScene from "@/components/EndingScene";
import EasterEgg from "@/components/EasterEgg";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";

const UniverseScene = lazy(() => import("@/scenes/UniverseScene"));

type Section = "none" | "memories" | "letter" | "capsule" | "orbital" | "ending";

const Index = () => {
  const [entered, setEntered] = useState(false);
  const [morphing, setMorphing] = useState(false);
  const [morphComplete, setMorphComplete] = useState(false);
  const [orbitalReveal, setOrbitalReveal] = useState(false);
  const [section, setSection] = useState<Section>("none");
  const { play } = useAmbientAudio();

  const handleEnter = () => {
    play();
    setEntered(true);
  };

  const handleSeeUs = () => {
    if (!morphing && !morphComplete) setMorphing(true);
  };

  const handleMorphComplete = useCallback(() => {
    setMorphComplete(true);
  }, []);

  const handleOrbitalReveal = () => {
    setSection("orbital");
    setOrbitalReveal(true);
  };

  const handleOrbitalComplete = useCallback(() => {
    setSection("ending");
  }, []);

  const showMemories = section === "memories";

  const btnStyle = {
    color: "hsl(270, 40%, 78%)",
    borderColor: "hsl(270, 20%, 28%)",
    background: "hsla(270, 30%, 10%, 0.4)",
    backdropFilter: "blur(8px)",
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0a0e1a" }}>
      <Suspense fallback={null}>
        <div style={{ opacity: entered ? 1 : 0, transition: "opacity 1.5s ease-in-out" }}>
          <UniverseScene
            morphing={morphing}
            showMemories={showMemories}
            orbitalReveal={orbitalReveal}
            onMorphComplete={handleMorphComplete}
            onOrbitalComplete={handleOrbitalComplete}
          />
        </div>
      </Suspense>

      {!entered && <CinematicIntro onEnter={handleEnter} />}

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
              style={btnStyle}
            >
              See Us
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {morphComplete && section === "none" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="fixed inset-x-0 bottom-10 z-10 flex flex-col items-center gap-5 md:bottom-16"
          >
            <p
              className="font-serif text-base tracking-wide md:text-lg"
              style={{ color: "hsl(270, 30%, 70%)" }}
            >
              Every star led me to you, <EasterEgg />.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {(["memories", "letter", "capsule", "orbital", "ending"] as Section[]).map((s) => {
                const labels: Record<string, string> = {
                  memories: "Our Memories",
                  letter: "A Letter",
                  capsule: "Time Capsule",
                  orbital: "2 Years",
                  ending: "The End",
                };
                return (
                  <button
                    key={s}
                    onClick={() => s === "orbital" ? handleOrbitalReveal() : setSection(s)}
                    className="border px-6 py-2 text-xs uppercase tracking-[0.25em] transition-all duration-500 hover:tracking-[0.4em]"
                    style={btnStyle}
                  >
                    {labels[s]}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {section !== "none" && section !== "orbital" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setSection("none")}
            className="fixed left-6 top-6 z-30 border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
            style={btnStyle}
          >
            ← Back
          </motion.button>
        )}
      </AnimatePresence>

      <LoveLetter visible={section === "letter"} />
      <TimeCapsule visible={section === "capsule"} />
      <EndingScene visible={section === "ending"} />
    </div>
  );
};

export default Index;
