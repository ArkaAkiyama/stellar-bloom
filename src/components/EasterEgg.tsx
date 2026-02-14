import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { content } from "@/config/content";

/**
 * Easter egg: clicking partner's name 3 times reveals a secret message modal.
 * Renders as inline text — place it wherever the name should appear.
 */
export default function EasterEgg() {
  const [clicks, setClicks] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    const next = clicks + 1;
    setClicks(next);

    // Reset click count after 2s of inactivity
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setClicks(0), 2000);

    if (next >= 3) {
      setRevealed(true);
      setClicks(0);
    }
  };

  return (
    <>
      <span
        onClick={handleClick}
        className="cursor-pointer select-none transition-colors duration-300"
        style={{ color: clicks > 0 ? "hsl(270, 50%, 75%)" : "hsl(270, 20%, 55%)" }}
      >
        {content.partner.name}
      </span>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            onClick={() => setRevealed(false)}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0"
              style={{ background: "hsla(240, 30%, 4%, 0.85)" }}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-sm w-full rounded-2xl border p-8 text-center"
              style={{
                background: "hsla(260, 30%, 10%, 0.8)",
                borderColor: "hsla(270, 30%, 35%, 0.5)",
                backdropFilter: "blur(24px)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p
                className="font-serif text-lg leading-relaxed tracking-wide md:text-xl"
                style={{ color: "hsl(270, 35%, 80%)" }}
              >
                {content.partner.secretMessage}
              </p>
              <button
                onClick={() => setRevealed(false)}
                className="mt-6 text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
                style={{ color: "hsl(270, 20%, 50%)" }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
