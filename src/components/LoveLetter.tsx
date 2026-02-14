import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { content } from "@/config/content";

interface LoveLetterProps {
  visible: boolean;
  onComplete?: () => void;
}

/**
 * Glassmorphism love letter panel with typewriter text animation.
 */
export default function LoveLetter({ visible, onComplete }: LoveLetterProps) {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paragraphs = content.loveLetter.paragraphs;

  // Start typing when visible
  useEffect(() => {
    if (visible && !started) {
      const t = setTimeout(() => setStarted(true), 600);
      return () => clearTimeout(t);
    }
  }, [visible, started]);

  // Typewriter effect
  useEffect(() => {
    if (!started || currentParagraph >= paragraphs.length) {
      if (currentParagraph >= paragraphs.length) onComplete?.();
      return;
    }

    const full = paragraphs[currentParagraph];
    if (displayedText.length < full.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedText(full.slice(0, displayedText.length + 1));
      }, 45);
    } else {
      // Pause then move to next paragraph
      timeoutRef.current = setTimeout(() => {
        setCurrentParagraph((p) => p + 1);
        setDisplayedText("");
      }, 1200);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [started, displayedText, currentParagraph, paragraphs, onComplete]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="fixed inset-0 z-20 flex items-center justify-center px-6"
    >
      <div
        className="max-w-lg w-full rounded-2xl border p-8 md:p-12"
        style={{
          background: "hsla(250, 30%, 8%, 0.6)",
          borderColor: "hsla(270, 20%, 30%, 0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Completed paragraphs */}
        {paragraphs.slice(0, currentParagraph).map((p, i) => (
          <p
            key={i}
            className="mb-4 font-serif text-base leading-relaxed md:text-lg"
            style={{ color: "hsl(270, 25%, 75%)" }}
          >
            {p}
          </p>
        ))}

        {/* Currently typing paragraph */}
        {currentParagraph < paragraphs.length && (
          <p
            className="mb-4 font-serif text-base leading-relaxed md:text-lg"
            style={{ color: "hsl(270, 25%, 75%)" }}
          >
            {displayedText}
            <span
              className="inline-block w-0.5 ml-0.5 animate-pulse"
              style={{
                height: "1.1em",
                background: "hsl(270, 40%, 65%)",
                verticalAlign: "text-bottom",
              }}
            />
          </p>
        )}
      </div>
    </motion.div>
  );
}
