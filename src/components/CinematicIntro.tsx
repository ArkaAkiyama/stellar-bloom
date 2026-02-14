import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { content } from "@/config/content";

interface CinematicIntroProps {
  onEnter: () => void;
}

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
          style={{ background: "hsl(230, 50%, 3%)" }}
        >
          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }}
            className="mb-10 h-px w-24 origin-center"
            style={{ background: "hsl(var(--cosmos-glow) / 0.4)" }}
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
            className="max-w-md px-6 text-center text-xl leading-relaxed tracking-wide md:text-2xl"
            style={{ color: "hsl(var(--cosmos-text))" }}
          >
            {content.intro.line}
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
            className="mt-10 h-px w-24 origin-center"
            style={{ background: "hsl(var(--cosmos-glow) / 0.4)" }}
          />

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8, duration: 1 }}
            onClick={handleEnter}
            className="cosmos-btn mt-14 border px-10 py-3.5 text-sm uppercase tracking-[0.35em] rounded-full"
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
          style={{ background: "hsl(230, 50%, 3%)" }}
        />
      )}
    </AnimatePresence>
  );
}
