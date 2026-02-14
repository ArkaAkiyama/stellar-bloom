import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { content } from "@/config/content";

interface CinematicIntroProps {
  onEnter: () => void;
}

/**
 * Fullscreen cinematic intro overlay.
 * Fades in text, shows Enter button, crossfades out.
 */
export default function CinematicIntro({ onEnter }: CinematicIntroProps) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 1200);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "#050509" }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
            className="max-w-md px-6 text-center font-serif text-xl leading-relaxed tracking-wide md:text-2xl"
            style={{ color: "hsl(250, 30%, 80%)" }}
          >
            {content.intro.line}
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8, duration: 1 }}
            onClick={handleEnter}
            className="mt-12 border px-8 py-3 text-sm uppercase tracking-[0.3em] transition-all duration-500 hover:tracking-[0.5em]"
            style={{
              color: "hsl(250, 30%, 75%)",
              borderColor: "hsl(250, 20%, 30%)",
              background: "transparent",
            }}
          >
            {content.intro.buttonText}
          </motion.button>
        </motion.div>
      )}

      {exiting && (
        <motion.div
          key="exit"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="fixed inset-0 z-50"
          style={{ background: "#050509" }}
        />
      )}
    </AnimatePresence>
  );
}
