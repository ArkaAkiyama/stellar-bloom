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

const navItems: { key: Section; label: string; icon: string }[] = [
  { key: "memories", label: "Our Memories", icon: "✦" },
  { key: "letter", label: "A Letter", icon: "❧" },
  { key: "capsule", label: "Time Capsule", icon: "◷" },
  { key: "orbital", label: "2 Years", icon: "∞" },
  { key: "ending", label: "The End", icon: "⊹" },
];

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

  const handleNavClick = (s: Section) => {
    if (s === "orbital") {
      setSection("orbital");
      setOrbitalReveal(true);
    } else {
      setSection(s);
    }
  };

  const handleOrbitalComplete = useCallback(() => {
    setSection("ending");
  }, []);

  const showMemories = section === "memories";

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "hsl(230, 50%, 5%)" }}>
      {/* Vignette overlay */}
      <div className="fixed inset-0 z-[1] vignette" />

      {/* 3D Scene */}
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

      {/* Intro */}
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
              className="cosmos-btn border px-10 py-3 text-sm uppercase tracking-[0.3em] rounded-full"
            >
              See Us
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-morph navigation */}
      <AnimatePresence>
        {morphComplete && section === "none" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-8 z-10 flex flex-col items-center gap-6 md:bottom-14"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1.5 }}
              className="text-base tracking-wide md:text-lg animate-float"
              style={{ color: "hsl(var(--cosmos-text))" }}
            >
              Every star led me to you, <EasterEgg />.
            </motion.p>

            {/* Navigation pills */}
            <motion.div
              className="flex flex-wrap justify-center gap-2.5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1, delayChildren: 1.2 } },
              }}
            >
              {navItems.map(({ key, label, icon }) => (
                <motion.button
                  key={key}
                  variants={{
                    hidden: { opacity: 0, y: 12, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  onClick={() => handleNavClick(key)}
                  className="cosmos-btn border px-5 py-2.5 text-xs uppercase tracking-[0.2em] rounded-full flex items-center gap-2"
                >
                  <span className="text-[10px] opacity-60">{icon}</span>
                  {label}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <AnimatePresence>
        {section !== "none" && section !== "orbital" && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4 }}
            onClick={() => setSection("none")}
            className="cosmos-btn fixed left-6 top-6 z-30 border px-5 py-2.5 text-xs uppercase tracking-[0.2em] rounded-full"
          >
            ← Back
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sections */}
      <LoveLetter visible={section === "letter"} />
      <TimeCapsule visible={section === "capsule"} />
      <EndingScene visible={section === "ending"} />
    </div>
  );
};

export default Index;
