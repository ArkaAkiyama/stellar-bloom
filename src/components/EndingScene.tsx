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
  hue: number;
}

export default function EndingScene({ visible, onFadeComplete }: EndingSceneProps) {
  const [phase, setPhase] = useState<"petals" | "fade" | "text">("petals");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const petals: Petal[] = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 6 + Math.random() * 6,
        size: 6 + Math.random() * 10,
        rotation: Math.random() * 360,
        swayAmount: 30 + Math.random() * 60,
        opacity: 0.2 + Math.random() * 0.4,
        hue: 260 + Math.random() * 30,
      })),
    []
  );

  useEffect(() => {
    if (!visible) {
      setPhase("petals");
      return;
    }
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
                  background: `hsl(${p.hue}, 35%, 60%)`,
                  filter: "blur(0.5px)",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fade to black */}
      <AnimatePresence>
        {(phase === "fade" || phase === "text") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-auto"
            style={{ background: "hsl(230, 50%, 3%)" }}
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
            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 1.5 }}
              className="h-px w-20 origin-center"
              style={{ background: "hsl(var(--cosmos-glow) / 0.3)" }}
            />

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
              className="max-w-md text-center text-xl leading-relaxed tracking-wide md:text-2xl"
              style={{ color: "hsl(var(--cosmos-text))" }}
            >
              {content.ending.line}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1.5 }}
              className="text-sm italic tracking-wider"
              style={{ color: "hsl(var(--cosmos-text-dim))" }}
            >
              {content.ending.signature}
            </motion.p>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 3.5, duration: 1.5 }}
              className="h-px w-20 origin-center"
              style={{ background: "hsl(var(--cosmos-glow) / 0.3)" }}
            />

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5, duration: 1.5 }}
              onClick={() => window.location.reload()}
              className="cosmos-btn mt-8 border text-xs uppercase tracking-[0.25em] px-6 py-2.5 rounded-full pointer-events-auto"
            >
              From the beginning ↻
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
