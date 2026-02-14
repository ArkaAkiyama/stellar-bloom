import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { content } from "@/config/content";

interface EndingSceneProps {
  visible: boolean;
  onFadeComplete?: () => void;
}

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  swayAmount: number;
  opacity: number;
}

/**
 * Ending scene: falling petal particles → fade to black → signature text.
 */
export default function EndingScene({ visible, onFadeComplete }: EndingSceneProps) {
  const [phase, setPhase] = useState<"petals" | "fade" | "text">("petals");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate petals
  const petals: Petal[] = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 6 + Math.random() * 6,
        size: 6 + Math.random() * 10,
        rotation: Math.random() * 360,
        swayAmount: 30 + Math.random() * 60,
        opacity: 0.3 + Math.random() * 0.5,
      })),
    []
  );

  useEffect(() => {
    if (!visible) {
      setPhase("petals");
      return;
    }

    // Petals fall for 5s → fade to black → show text
    timerRef.current = setTimeout(() => setPhase("fade"), 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  useEffect(() => {
    if (phase === "fade") {
      const t = setTimeout(() => {
        setPhase("text");
        onFadeComplete?.();
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [phase, onFadeComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none">
      {/* Falling petals */}
      <AnimatePresence>
        {(phase === "petals" || phase === "fade") && (
          <motion.div
            className="absolute inset-0 overflow-hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            {petals.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  x: `${p.x}vw`,
                  y: "-5vh",
                  rotate: p.rotation,
                  opacity: 0,
                }}
                animate={{
                  y: "110vh",
                  rotate: p.rotation + 360,
                  opacity: [0, p.opacity, p.opacity, 0],
                  x: [
                    `${p.x}vw`,
                    `${p.x + p.swayAmount * 0.5}vw`,
                    `${p.x - p.swayAmount * 0.3}vw`,
                    `${p.x + p.swayAmount * 0.2}vw`,
                  ],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "linear",
                  repeat: Infinity,
                }}
                style={{
                  position: "absolute",
                  width: p.size,
                  height: p.size * 1.4,
                  borderRadius: `${p.size}px ${p.size}px 0 ${p.size}px`,
                  background: `hsl(${270 + Math.random() * 20}, 30%, ${55 + Math.random() * 15}%)`,
                  filter: "blur(0.5px)",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fade to black overlay */}
      <AnimatePresence>
        {(phase === "fade" || phase === "text") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-auto"
            style={{ background: "#050509" }}
          />
        )}
      </AnimatePresence>

      {/* Final text */}
      <AnimatePresence>
        {phase === "text" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 2 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-auto px-6"
          >
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
              className="max-w-md text-center font-serif text-xl leading-relaxed tracking-wide md:text-2xl"
              style={{ color: "hsl(270, 30%, 80%)" }}
            >
              {content.ending.line}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1.5 }}
              className="font-serif text-sm italic tracking-wider"
              style={{ color: "hsl(270, 15%, 50%)" }}
            >
              {content.ending.signature}
            </motion.p>

            {/* Restart hint */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5, duration: 1.5 }}
              onClick={() => window.location.reload()}
              className="mt-8 text-xs uppercase tracking-[0.25em] transition-opacity hover:opacity-70 pointer-events-auto"
              style={{ color: "hsl(270, 10%, 35%)" }}
            >
              From the beginning ↻
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
